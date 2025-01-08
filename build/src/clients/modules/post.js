"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const math_1 = require("@cosmjs/math");
const stargate_1 = require("@cosmjs/stargate");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const lodash_1 = __importDefault(require("lodash"));
const long_1 = __importDefault(require("long"));
const protobufjs_1 = __importDefault(require("protobufjs"));
const constants_1 = require("../constants");
const errors_1 = require("../lib/errors");
const registry_1 = require("../lib/registry");
const types_1 = require("../types");
const composer_1 = require("./composer");
const proto_includes_1 = require("./proto-includes");
// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobufjs_1.default.util.Long = long_1.default;
protobufjs_1.default.configure();
class Post {
    constructor(get, chainId, denoms, defaultClientMemo, useTimestampNonce) {
        this.selectedGasDenom = constants_1.SelectedGasDenom.USDC;
        this.useTimestampNonce = false;
        this.accountNumberCache = new Map();
        this.get = get;
        this.chainId = chainId;
        this.registry = (0, registry_1.generateRegistry)();
        this.composer = new composer_1.Composer();
        this.denoms = denoms;
        this.defaultClientMemo = defaultClientMemo;
        this.defaultGasPrice = stargate_1.GasPrice.fromString(`0.025${denoms.USDC_GAS_DENOM !== undefined ? denoms.USDC_GAS_DENOM : denoms.USDC_DENOM}`);
        this.defaultDydxGasPrice = stargate_1.GasPrice.fromString(`25000000000${denoms.CHAINTOKEN_GAS_DENOM !== undefined
            ? denoms.CHAINTOKEN_GAS_DENOM
            : denoms.CHAINTOKEN_DENOM}`);
        if (useTimestampNonce === true)
            this.useTimestampNonce = useTimestampNonce;
    }
    /**
     * @description Retrieves the account number for the given wallet address and populates the accountNumberCache.
     * The account number is required for txOptions when signing a transaction.
     * Pre-populating the cache avoids a round-trip request during the first transaction creation in the session, preventing it from being a performance blocker.
     */
    async populateAccountNumberCache(address) {
        if (this.accountNumberCache.has(address))
            return;
        const account = await this.get.getAccount(address);
        this.accountNumberCache.set(address, account);
    }
    setSelectedGasDenom(selectedGasDenom) {
        this.selectedGasDenom = selectedGasDenom;
    }
    getGasPrice() {
        return this.selectedGasDenom === constants_1.SelectedGasDenom.USDC
            ? this.defaultGasPrice
            : this.defaultDydxGasPrice;
    }
    /**
     * @description Simulate a transaction
     * the calling function is responsible for creating the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Fee for broadcasting a transaction.
     */
    async simulate(wallet, messaging, gasPrice = this.getGasPrice(), memo, account) {
        let msgs;
        // protocol expects timestamp nonce in UTC milliseconds, which is the unit returned by Date.now()
        let sequence = Date.now();
        if (this.useTimestampNonce) {
            msgs = await messaging();
        }
        else {
            const msgsPromise = messaging();
            const accountPromise = account ? await account() : this.account(wallet.address);
            const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
            msgs = msgsAndAccount[0];
            sequence = msgsAndAccount[1].sequence;
        }
        return this.simulateTransaction(wallet.pubKey, sequence, msgs, gasPrice, memo);
    }
    /**
     * @description Sign a transaction
     * the calling function is responsible for creating the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Signature.
     */
    async sign(wallet, messaging, zeroFee, gasPrice = this.getGasPrice(), memo, account) {
        const msgsPromise = await messaging();
        const accountPromise = account ? await account() : this.account(wallet.address);
        const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
        const msgs = msgsAndAccount[0];
        return this.signTransaction(wallet, msgs, msgsAndAccount[1], zeroFee, gasPrice, memo);
    }
    /**
     * @description Send a transaction
     * the calling function is responsible for creating the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Tx Hash.
     */
    async send(wallet, messaging, zeroFee, gasPrice = this.getGasPrice(), memo, broadcastMode, account, gasAdjustment = constants_1.GAS_MULTIPLIER) {
        const msgsPromise = messaging();
        const accountPromise = account ? await account() : this.account(wallet.address);
        const msgsAndAccount = await Promise.all([msgsPromise, accountPromise]);
        const msgs = msgsAndAccount[0];
        return this.signAndSendTransaction(wallet, msgsAndAccount[1], msgs, zeroFee, gasPrice, memo !== null && memo !== void 0 ? memo : this.defaultClientMemo, broadcastMode !== null && broadcastMode !== void 0 ? broadcastMode : this.defaultBroadcastMode(msgs), gasAdjustment);
    }
    /**
     * @description Calculate the default broadcast mode.
     */
    defaultBroadcastMode(msgs) {
        var _a, _b, _c;
        if (msgs.length === 1 &&
            (msgs[0].typeUrl === '/dydxprotocol.clob.MsgPlaceOrder' ||
                msgs[0].typeUrl === '/dydxprotocol.clob.MsgCancelOrder')) {
            const orderFlags = msgs[0].typeUrl === '/dydxprotocol.clob.MsgPlaceOrder'
                ? (_b = (_a = msgs[0].value.order) === null || _a === void 0 ? void 0 : _a.orderId) === null || _b === void 0 ? void 0 : _b.orderFlags
                : (_c = msgs[0].value.orderId) === null || _c === void 0 ? void 0 : _c.orderFlags;
            switch (orderFlags) {
                case types_1.OrderFlags.SHORT_TERM:
                    return tendermint_rpc_1.Method.BroadcastTxSync;
                case types_1.OrderFlags.LONG_TERM:
                case types_1.OrderFlags.CONDITIONAL:
                    return tendermint_rpc_1.Method.BroadcastTxCommit;
                default:
                    break;
            }
        }
        return tendermint_rpc_1.Method.BroadcastTxSync;
    }
    /**
     * @description Sign and send a message
     *
     * @returns The Tx Response.
     */
    async signTransaction(wallet, messages, account, zeroFee, gasPrice = this.getGasPrice(), memo, gasAdjustment = constants_1.GAS_MULTIPLIER) {
        // protocol expects timestamp nonce in UTC milliseconds, which is the unit returned by Date.now()
        const sequence = this.useTimestampNonce ? Date.now() : account.sequence;
        // Simulate transaction if no fee is specified.
        const fee = zeroFee
            ? {
                amount: [],
                gas: '1000000',
            }
            : await this.simulateTransaction(wallet.pubKey, sequence, messages, gasPrice, memo, gasAdjustment);
        const txOptions = {
            sequence,
            accountNumber: account.accountNumber,
            chainId: this.chainId,
        };
        // Generate signed transaction.
        return wallet.signTransaction(messages, txOptions, fee, memo);
    }
    /**
     * @description Retrieve an account structure for transactions.
     * For short term orders, the sequence doesn't matter. Use cached if available.
     * For long term and conditional orders, a round trip to validator must be made.
     * when timestamp nonce is supported, no need to fetch account sequence number
     */
    async account(address, orderFlags) {
        if (orderFlags === types_1.OrderFlags.SHORT_TERM || this.useTimestampNonce) {
            if (this.accountNumberCache.has(address)) {
                // If order is SHORT_TERM or if timestamp nonce is enabled, the sequence doesn't matter
                return this.accountNumberCache.get(address);
            }
        }
        const account = await this.get.getAccount(address);
        this.accountNumberCache.set(address, account);
        return account;
    }
    /**
     * @description Sign and send a message
     *
     * @returns The Tx Response.
     */
    async signAndSendTransaction(wallet, account, messages, zeroFee, gasPrice = this.getGasPrice(), memo, broadcastMode, gasAdjustment = constants_1.GAS_MULTIPLIER) {
        const signedTransaction = await this.signTransaction(wallet, messages, account, zeroFee, gasPrice, memo, gasAdjustment);
        return this.sendSignedTransaction(signedTransaction, broadcastMode);
    }
    /**
     * @description Send signed transaction.
     *
     * @returns The Tx Response.
     */
    async sendSignedTransaction(signedTransaction, broadcastMode) {
        return this.get.tendermintClient.broadcastTransaction(signedTransaction, broadcastMode !== undefined ? broadcastMode : tendermint_rpc_1.Method.BroadcastTxSync);
    }
    /**
     * @description Simulate broadcasting a transaction.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Fee for broadcasting a transaction.
     */
    async simulateTransaction(pubKey, sequence, messages, gasPrice = this.getGasPrice(), memo, gasAdjustment = constants_1.GAS_MULTIPLIER) {
        // Get simulated response.
        const encodedMessages = messages.map((message) => this.registry.encodeAsAny(message));
        const simulationResponse = await this.get.stargateQueryClient.tx.simulate(encodedMessages, memo, pubKey, sequence);
        // The promise should have been rejected if the gasInfo was undefined.
        if (simulationResponse.gasInfo === undefined) {
            throw new errors_1.UnexpectedClientError();
        }
        // Calculate and return fee from gasEstimate.
        const gasEstimate = math_1.Uint53.fromString(simulationResponse.gasInfo.gasUsed.toString()).toNumber();
        const fee = (0, stargate_1.calculateFee)(Math.floor(gasEstimate * gasAdjustment), gasPrice);
        // TODO(TRCL-2550): Temporary workaround before IBC denom is supported in '@cosmjs/stargate'.
        // The '@cosmjs/stargate' does not support denom with '/', so currently GAS_PRICE is
        // represented in 'uusdc', and the output of `calculateFee` is in '', which is replaced
        // below by USDC_DENOM string.
        const amount = lodash_1.default.map(fee.amount, (coin) => {
            if (coin.denom === 'uusdc') {
                return {
                    amount: coin.amount,
                    denom: this.denoms.USDC_DENOM,
                };
            }
            return coin;
        });
        return {
            ...fee,
            amount,
        };
    }
    // ------ State-Changing Requests ------ //
    async placeOrder(subaccount, clientId, clobPairId, side, quantums, subticks, timeInForce, orderFlags, reduceOnly, goodTilBlock, goodTilBlockTime, clientMetadata = 0, conditionType = proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED, conditionalOrderTriggerSubticks = long_1.default.fromInt(0), broadcastMode) {
        const msg = await this.placeOrderMsg(subaccount.address, subaccount.subaccountNumber, clientId, clobPairId, side, quantums, subticks, timeInForce, orderFlags, reduceOnly, goodTilBlock, goodTilBlockTime, clientMetadata, conditionType, conditionalOrderTriggerSubticks);
        const account = this.account(subaccount.address, orderFlags);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), true, undefined, undefined, broadcastMode, () => account);
    }
    async placeOrderMsg(address, subaccountNumber, clientId, clobPairId, side, quantums, subticks, timeInForce, orderFlags, reduceOnly, goodTilBlock, goodTilBlockTime, clientMetadata = 0, conditionType = proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED, conditionalOrderTriggerSubticks = long_1.default.fromInt(0)) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgPlaceOrder(address, subaccountNumber, clientId, clobPairId, orderFlags, goodTilBlock !== null && goodTilBlock !== void 0 ? goodTilBlock : 0, goodTilBlockTime !== null && goodTilBlockTime !== void 0 ? goodTilBlockTime : 0, side, quantums, subticks, timeInForce, reduceOnly, clientMetadata, conditionType, conditionalOrderTriggerSubticks);
            resolve(msg);
        });
    }
    async placeOrderObject(subaccount, placeOrder, broadcastMode) {
        var _a, _b;
        return this.placeOrder(subaccount, placeOrder.clientId, placeOrder.clobPairId, placeOrder.side, placeOrder.quantums, placeOrder.subticks, placeOrder.timeInForce, placeOrder.orderFlags, placeOrder.reduceOnly, placeOrder.goodTilBlock, placeOrder.goodTilBlockTime, placeOrder.clientMetadata, (_a = placeOrder.conditionType) !== null && _a !== void 0 ? _a : proto_includes_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED, (_b = placeOrder.conditionalOrderTriggerSubticks) !== null && _b !== void 0 ? _b : long_1.default.fromInt(0), broadcastMode);
    }
    async cancelOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime, broadcastMode) {
        const msg = await this.cancelOrderMsg(subaccount.address, subaccount.subaccountNumber, clientId, orderFlags, clobPairId, goodTilBlock !== null && goodTilBlock !== void 0 ? goodTilBlock : 0, goodTilBlockTime !== null && goodTilBlockTime !== void 0 ? goodTilBlockTime : 0);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), true, undefined, undefined, broadcastMode);
    }
    async cancelOrderMsg(address, subaccountNumber, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgCancelOrder(address, subaccountNumber, clientId, clobPairId, orderFlags, goodTilBlock !== null && goodTilBlock !== void 0 ? goodTilBlock : 0, goodTilBlockTime !== null && goodTilBlockTime !== void 0 ? goodTilBlockTime : 0);
            resolve(msg);
        });
    }
    async cancelOrderObject(subaccount, cancelOrder, broadcastMode) {
        return this.cancelOrder(subaccount, cancelOrder.clientId, cancelOrder.orderFlags, cancelOrder.clobPairId, cancelOrder.goodTilBlock, cancelOrder.goodTilBlockTime, broadcastMode);
    }
    async batchCancelShortTermOrders(subaccount, shortTermOrders, goodTilBlock, broadcastMode) {
        const msg = await this.batchCancelShortTermOrdersMsg(subaccount.address, subaccount.subaccountNumber, shortTermOrders, goodTilBlock);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), true, undefined, undefined, broadcastMode);
    }
    async batchCancelShortTermOrdersMsg(address, subaccountNumber, shortTermOrders, goodTilBlock) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgBatchCancelShortTermOrders(address, subaccountNumber, shortTermOrders, goodTilBlock);
            resolve(msg);
        });
    }
    async transfer(subaccount, recipientAddress, recipientSubaccountNumber, assetId, amount, broadcastMode) {
        const msg = await this.transferMsg(subaccount.address, subaccount.subaccountNumber, recipientAddress, recipientSubaccountNumber, assetId, amount);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode);
    }
    async transferMsg(address, subaccountNumber, recipientAddress, recipientSubaccountNumber, assetId, amount) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgTransfer(address, subaccountNumber, recipientAddress, recipientSubaccountNumber, assetId, amount);
            resolve(msg);
        });
    }
    async deposit(subaccount, assetId, quantums, broadcastMode) {
        const msg = await this.depositMsg(subaccount.address, subaccount.subaccountNumber, assetId, quantums);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode);
    }
    async depositMsg(address, subaccountNumber, assetId, quantums) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgDepositToSubaccount(address, subaccountNumber, assetId, quantums);
            resolve(msg);
        });
    }
    async withdraw(subaccount, assetId, quantums, recipient, broadcastMode) {
        const msg = await this.withdrawMsg(subaccount.address, subaccount.subaccountNumber, assetId, quantums, recipient);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode);
    }
    async withdrawMsg(address, subaccountNumber, assetId, quantums, recipient) {
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgWithdrawFromSubaccount(address, subaccountNumber, assetId, quantums, recipient);
            resolve(msg);
        });
    }
    async sendToken(subaccount, recipient, coinDenom, quantums, zeroFee = true, broadcastMode) {
        const msg = await this.sendTokenMsg(subaccount.address, recipient, coinDenom, quantums);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), zeroFee, coinDenom === this.denoms.CHAINTOKEN_DENOM ? this.defaultDydxGasPrice : this.defaultGasPrice, undefined, broadcastMode);
    }
    async sendTokenMsg(address, recipient, coinDenom, quantums) {
        if (coinDenom !== this.denoms.CHAINTOKEN_DENOM && coinDenom !== this.denoms.USDC_DENOM) {
            throw new Error('Unsupported coinDenom');
        }
        return new Promise((resolve) => {
            const msg = this.composer.composeMsgSendToken(address, recipient, coinDenom, quantums);
            resolve(msg);
        });
    }
    async delegate(subaccount, delegator, validator, amount, broadcastMode) {
        const msg = this.composer.composeMsgDelegate(delegator, validator, {
            denom: this.denoms.CHAINTOKEN_DENOM,
            amount,
        });
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, this.defaultDydxGasPrice, undefined, broadcastMode);
    }
    delegateMsg(delegator, validator, amount) {
        return this.composer.composeMsgDelegate(delegator, validator, {
            denom: this.denoms.CHAINTOKEN_DENOM,
            amount,
        });
    }
    async undelegate(subaccount, delegator, validator, amount, broadcastMode) {
        const msg = this.composer.composeMsgUndelegate(delegator, validator, {
            denom: this.denoms.CHAINTOKEN_DENOM,
            amount,
        });
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, this.defaultDydxGasPrice, undefined, broadcastMode);
    }
    undelegateMsg(delegator, validator, amount) {
        return this.composer.composeMsgUndelegate(delegator, validator, {
            denom: this.denoms.CHAINTOKEN_DENOM,
            amount,
        });
    }
    async withdrawDelegatorReward(subaccount, delegator, validator, broadcastMode) {
        const msg = this.composer.composeMsgWithdrawDelegatorReward(delegator, validator);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, this.defaultGasPrice, undefined, broadcastMode);
    }
    withdrawDelegatorRewardMsg(delegator, validator) {
        return this.composer.composeMsgWithdrawDelegatorReward(delegator, validator);
    }
    // vaults
    async depositToMegavault(subaccount, quoteQuantums, broadcastMode) {
        const msg = await this.depositToMegavaultMsg(subaccount.address, subaccount.subaccountNumber, quoteQuantums);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode);
    }
    depositToMegavaultMsg(...args) {
        return this.composer.composeMsgDepositToMegavault(...args);
    }
    async withdrawFromMegavault(subaccount, shares, minQuoteQuantums, broadcastMode) {
        const msg = await this.withdrawFromMegavaultMsg(subaccount.address, subaccount.subaccountNumber, shares, minQuoteQuantums);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode);
    }
    withdrawFromMegavaultMsg(...args) {
        return this.composer.composeMsgWithdrawFromMegavault(...args);
    }
    async registerAffiliate(subaccount, affiliate, broadcastMode, gasAdjustment = 2) {
        const msg = this.registerAffiliateMsg(subaccount.address, affiliate);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, undefined, broadcastMode, undefined, gasAdjustment);
    }
    registerAffiliateMsg(...args) {
        return this.composer.composeMsgRegisterAffiliate(...args);
    }
    launchMarketMsg(...args) {
        return this.composer.composeMsgCreateMarketPermissionless(...args);
    }
    async createMarketPermissionless(ticker, subaccount, broadcastMode, gasAdjustment, memo) {
        const msg = this.launchMarketMsg(subaccount.address, ticker, subaccount.subaccountNumber);
        return this.send(subaccount.wallet, () => Promise.resolve([msg]), false, undefined, memo, broadcastMode, undefined, gasAdjustment);
    }
}
exports.Post = Post;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRzL21vZHVsZXMvcG9zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSx1Q0FBc0M7QUFFdEMsK0NBQXNGO0FBQ3RGLDJEQUFnRDtBQUtoRCxvREFBdUI7QUFDdkIsZ0RBQXdCO0FBQ3hCLDREQUFrQztBQUVsQyw0Q0FBZ0U7QUFDaEUsMENBQXNEO0FBQ3RELDhDQUFtRDtBQUVuRCxvQ0FPa0I7QUFDbEIseUNBQXNDO0FBR3RDLHFEQVEwQjtBQUUxQixvRUFBb0U7QUFDcEUscUVBQXFFO0FBQ3JFLHdFQUF3RTtBQUN4RSxrRUFBa0U7QUFDbEUsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQUksQ0FBQztBQUMxQixvQkFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRXJCLE1BQWEsSUFBSTtJQWVmLFlBQ0UsR0FBUSxFQUNSLE9BQWUsRUFDZixNQUFtQixFQUNuQixpQkFBMEIsRUFDMUIsaUJBQTJCO1FBWnRCLHFCQUFnQixHQUFxQiw0QkFBZ0IsQ0FBQyxJQUFJLENBQUM7UUFJM0Qsc0JBQWlCLEdBQVksS0FBSyxDQUFDO1FBQ2xDLHVCQUFrQixHQUF5QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBUzNELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFBLDJCQUFnQixHQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7UUFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxtQkFBUSxDQUFDLFVBQVUsQ0FDeEMsUUFBUSxNQUFN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