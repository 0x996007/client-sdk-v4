"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeClient = void 0;
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const order_1 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/order");
const ethers_1 = require("ethers");
const long_1 = __importDefault(require("long"));
const protobufjs_1 = __importDefault(require("protobufjs"));
const helpers_1 = require("../lib/helpers");
const validation_1 = require("../lib/validation");
const types_1 = require("../types");
const constants_1 = require("./constants");
const chain_helpers_1 = require("./helpers/chain-helpers");
const indexer_client_1 = require("./indexer-client");
const errors_1 = require("./lib/errors");
const registry_1 = require("./lib/registry");
const validator_client_1 = require("./validator-client");
// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable
// - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobufjs_1.default.util.Long = long_1.default;
protobufjs_1.default.configure();
class CompositeClient {
    static async connect(network) {
        const client = new CompositeClient(network);
        await client.initialize();
        return client;
    }
    constructor(network, apiTimeout) {
        this.gasDenom = constants_1.SelectedGasDenom.USDC;
        this.network = network;
        this._indexerClient = new indexer_client_1.IndexerClient(network.indexerConfig, apiTimeout);
    }
    async initialize() {
        this._validatorClient = await validator_client_1.ValidatorClient.connect(this.network.validatorConfig);
    }
    get indexerClient() {
        /**
         * Get the validator client
         */
        return this._indexerClient;
    }
    get validatorClient() {
        /**
         * Get the validator client
         */
        return this._validatorClient;
    }
    get selectedGasDenom() {
        if (!this._validatorClient)
            return undefined;
        return this._validatorClient.selectedGasDenom;
    }
    setSelectedGasDenom(gasDenom) {
        if (!this._validatorClient)
            throw new Error('Validator client not initialized');
        this._validatorClient.setSelectedGasDenom(gasDenom);
    }
    async populateAccountNumberCache(address) {
        if (!this._validatorClient)
            throw new Error('Validator client not initialized');
        await this._validatorClient.populateAccountNumberCache(address);
    }
    /**
     * @description Sign a list of messages with a wallet.
     * the calling function is responsible for creating the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Signature.
     */
    async sign(wallet, messaging, zeroFee, gasPrice, memo, account) {
        return this.validatorClient.post.sign(wallet, messaging, zeroFee, gasPrice, memo, account);
    }
    /**
     * @description Send a list of messages with a wallet.
     * the calling function is responsible for creating the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Transaction Hash.
     */
    async send(wallet, messaging, zeroFee, gasPrice, memo, broadcastMode, account) {
        return this.validatorClient.post.send(wallet, messaging, zeroFee, gasPrice, memo, broadcastMode, account);
    }
    /**
     * @description Send a signed transaction.
     *
     * @param signedTransaction The signed transaction to send.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The Transaction Hash.
     */
    async sendSignedTransaction(signedTransaction) {
        return this.validatorClient.post.sendSignedTransaction(signedTransaction);
    }
    /**
     * @description Simulate a list of messages with a wallet.
     * the calling function is responsible for creating the messages.
     *
     * To send multiple messages with gas estimate:
     * 1. Client is responsible for creating the messages.
     * 2. Call simulate() to get the gas estimate.
     * 3. Call send() to send the messages.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The gas estimate.
     */
    async simulate(wallet, messaging, gasPrice, memo, account) {
        return this.validatorClient.post.simulate(wallet, messaging, gasPrice, memo, account);
    }
    /**
     * @description Calculate the goodTilBlock value for a SHORT_TERM order
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The goodTilBlock value
     */
    async calculateGoodTilBlock(orderFlags, currentHeight, goodTilBlock) {
        if (orderFlags === types_1.OrderFlags.SHORT_TERM) {
            if (goodTilBlock !== undefined && goodTilBlock !== 0 && goodTilBlock !== null) {
                return Promise.resolve(goodTilBlock);
            }
            else {
                const height = currentHeight !== null && currentHeight !== void 0 ? currentHeight : (await this.validatorClient.get.latestBlockHeight());
                return height + constants_1.SHORT_BLOCK_FORWARD;
            }
        }
        else {
            return Promise.resolve(0);
        }
    }
    /**
     * @description Validate the goodTilBlock value for a SHORT_TERM order
     *
     * @param goodTilBlock Number of blocks from the current block height the order will
     * be valid for.
     *
     * @throws UserError if the goodTilBlock value is not valid given latest block height and
     * SHORT_BLOCK_WINDOW.
     */
    async validateGoodTilBlock(goodTilBlock) {
        const height = await this.validatorClient.get.latestBlockHeight();
        const nextValidBlockHeight = height + 1;
        const lowerBound = nextValidBlockHeight;
        const upperBound = nextValidBlockHeight + constants_1.SHORT_BLOCK_WINDOW;
        if (goodTilBlock < lowerBound || goodTilBlock > upperBound) {
            throw new errors_1.UserError(`Invalid Short-Term order GoodTilBlock.
        Should be greater-than-or-equal-to ${lowerBound} and less-than-or-equal-to ${upperBound}.
        Provided good til block: ${goodTilBlock}`);
        }
    }
    /**
     * @description Calculate the goodTilBlockTime value for a LONG_TERM order
     * the calling function is responsible for creating the messages.
     *
     * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The goodTilBlockTime value
     */
    calculateGoodTilBlockTime(goodTilTimeInSeconds) {
        const now = new Date();
        const millisecondsPerSecond = 1000;
        const interval = goodTilTimeInSeconds * millisecondsPerSecond;
        const future = new Date(now.valueOf() + interval);
        return Math.round(future.getTime() / 1000);
    }
    /**
     * @description Place a short term order with human readable input.
     *
     * Use human readable form of input, including price and size
     * The quantum and subticks are calculated and submitted
     *
     * @param subaccount The subaccount to place the order under
     * @param marketId The market to place the order on
     * @param side The side of the order to place
     * @param price The price of the order to place
     * @param size The size of the order to place
     * @param clientId The client id of the order to place
     * @param timeInForce The time in force of the order to place
     * @param goodTilBlock The goodTilBlock of the order to place
     * @param reduceOnly The reduceOnly of the order to place
     *
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async placeShortTermOrder(subaccount, marketId, side, price, size, clientId, goodTilBlock, timeInForce, reduceOnly, memo) {
        const msgs = new Promise((resolve, reject) => {
            const msg = this.placeShortTermOrderMessage(subaccount, marketId, side, price, size, clientId, goodTilBlock, timeInForce, reduceOnly);
            msg
                .then((it) => resolve([it]))
                .catch((err) => {
                console.log(err);
                reject(err);
            });
        });
        const account = this.validatorClient.post.account(subaccount.address, undefined);
        return this.send(subaccount.wallet, () => msgs, true, undefined, memo, undefined, () => account);
    }
    /**
     * @description Place an order with human readable input.
     *
     * Only MARKET and LIMIT types are supported right now
     * Use human readable form of input, including price and size
     * The quantum and subticks are calculated and submitted
     *
     * @param subaccount The subaccount to place the order on.
     * @param marketId The market to place the order on.
     * @param type The type of order to place.
     * @param side The side of the order to place.
     * @param price The price of the order to place.
     * @param size The size of the order to place.
     * @param clientId The client id of the order to place.
     * @param timeInForce The time in force of the order to place.
     * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place.
     * @param execution The execution of the order to place.
     * @param postOnly The postOnly of the order to place.
     * @param reduceOnly The reduceOnly of the order to place.
     * @param triggerPrice The trigger price of conditional orders.
     * @param marketInfo optional market information for calculating quantums and subticks.
     *        This can be constructed from Indexer API. If set to null, additional round
     *        trip to Indexer API will be made.
     * @param currentHeight Current block height. This can be obtained from ValidatorClient.
     *        If set to null, additional round trip to ValidatorClient will be made.
     *
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async placeOrder(subaccount, marketId, type, side, price, size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly, triggerPrice, marketInfo, currentHeight, goodTilBlock, memo) {
        const msgs = new Promise((resolve) => {
            const msg = this.placeOrderMessage(subaccount, marketId, type, side, price, size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly, triggerPrice, marketInfo, currentHeight, goodTilBlock);
            msg
                .then((it) => resolve([it]))
                .catch((err) => {
                throw err;
            });
        });
        const orderFlags = (0, chain_helpers_1.calculateOrderFlags)(type, timeInForce);
        const account = this.validatorClient.post.account(subaccount.address, orderFlags);
        return this.send(subaccount.wallet, () => msgs, true, undefined, memo, undefined, () => account);
    }
    /**
     * @description Calculate and create the place order message
     *
     * Only MARKET and LIMIT types are supported right now
     * Use human readable form of input, including price and size
     * The quantum and subticks are calculated and submitted
     *
     * @param subaccount The subaccount to place the order under
     * @param marketId The market to place the order on
     * @param type The type of order to place
     * @param side The side of the order to place
     * @param price The price of the order to place
     * @param size The size of the order to place
     * @param clientId The client id of the order to place
     * @param timeInForce The time in force of the order to place
     * @param goodTilTimeInSeconds The goodTilTimeInSeconds of the order to place
     * @param execution The execution of the order to place
     * @param postOnly The postOnly of the order to place
     * @param reduceOnly The reduceOnly of the order to place
     *
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message to be passed into the protocol
     */
    async placeOrderMessage(subaccount, marketId, type, side, price, 
    // trigger_price: number,   // not used for MARKET and LIMIT
    size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly, triggerPrice, marketInfo, currentHeight, goodTilBlock) {
        const orderFlags = (0, chain_helpers_1.calculateOrderFlags)(type, timeInForce);
        const result = await Promise.all([
            this.calculateGoodTilBlock(orderFlags, currentHeight, goodTilBlock),
            this.retrieveMarketInfo(marketId, marketInfo),
        ]);
        const desiredGoodTilBlock = result[0];
        const clobPairId = result[1].clobPairId;
        const atomicResolution = result[1].atomicResolution;
        const stepBaseQuantums = result[1].stepBaseQuantums;
        const quantumConversionExponent = result[1].quantumConversionExponent;
        const subticksPerTick = result[1].subticksPerTick;
        const orderSide = (0, chain_helpers_1.calculateSide)(side);
        const quantums = (0, chain_helpers_1.calculateQuantums)(size, atomicResolution, stepBaseQuantums);
        const subticks = (0, chain_helpers_1.calculateSubticks)(price, atomicResolution, quantumConversionExponent, subticksPerTick);
        const orderTimeInForce = (0, chain_helpers_1.calculateTimeInForce)(type, timeInForce, execution, postOnly);
        let goodTilBlockTime = 0;
        if (orderFlags === types_1.OrderFlags.LONG_TERM || orderFlags === types_1.OrderFlags.CONDITIONAL) {
            if (goodTilTimeInSeconds == null) {
                throw new Error('goodTilTimeInSeconds must be set for LONG_TERM or CONDITIONAL order');
            }
            else {
                goodTilBlockTime = this.calculateGoodTilBlockTime(goodTilTimeInSeconds);
            }
        }
        const clientMetadata = (0, chain_helpers_1.calculateClientMetadata)(type);
        const conditionalType = (0, chain_helpers_1.calculateConditionType)(type);
        const conditionalOrderTriggerSubticks = (0, chain_helpers_1.calculateConditionalOrderTriggerSubticks)(type, atomicResolution, quantumConversionExponent, subticksPerTick, triggerPrice);
        return this.validatorClient.post.composer.composeMsgPlaceOrder(subaccount.address, subaccount.subaccountNumber, clientId, clobPairId, orderFlags, desiredGoodTilBlock, goodTilBlockTime, orderSide, quantums, subticks, orderTimeInForce, reduceOnly !== null && reduceOnly !== void 0 ? reduceOnly : false, clientMetadata, conditionalType, conditionalOrderTriggerSubticks);
    }
    async retrieveMarketInfo(marketId, marketInfo) {
        if (marketInfo) {
            return Promise.resolve(marketInfo);
        }
        else {
            const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
            const market = marketsResponse.markets[marketId];
            const clobPairId = market.clobPairId;
            const atomicResolution = market.atomicResolution;
            const stepBaseQuantums = market.stepBaseQuantums;
            const quantumConversionExponent = market.quantumConversionExponent;
            const subticksPerTick = market.subticksPerTick;
            return {
                clobPairId,
                atomicResolution,
                stepBaseQuantums,
                quantumConversionExponent,
                subticksPerTick,
            };
        }
    }
    /**
     * @description Calculate and create the short term place order message
     *
     * Use human readable form of input, including price and size
     * The quantum and subticks are calculated and submitted
     *
     * @param subaccount The subaccount to place the order under
     * @param marketId The market to place the order on
     * @param side The side of the order to place
     * @param price The price of the order to place
     * @param size The size of the order to place
     * @param clientId The client id of the order to place
     * @param timeInForce The time in force of the order to place
     * @param goodTilBlock The goodTilBlock of the order to place
     * @param reduceOnly The reduceOnly of the order to place
     *
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message to be passed into the protocol
     */
    async placeShortTermOrderMessage(subaccount, marketId, side, price, size, clientId, goodTilBlock, timeInForce, reduceOnly) {
        await this.validateGoodTilBlock(goodTilBlock);
        const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
        const market = marketsResponse.markets[marketId];
        const clobPairId = market.clobPairId;
        const atomicResolution = market.atomicResolution;
        const stepBaseQuantums = market.stepBaseQuantums;
        const quantumConversionExponent = market.quantumConversionExponent;
        const subticksPerTick = market.subticksPerTick;
        const orderSide = (0, chain_helpers_1.calculateSide)(side);
        const quantums = (0, chain_helpers_1.calculateQuantums)(size, atomicResolution, stepBaseQuantums);
        const subticks = (0, chain_helpers_1.calculateSubticks)(price, atomicResolution, quantumConversionExponent, subticksPerTick);
        const orderFlags = types_1.OrderFlags.SHORT_TERM;
        return this.validatorClient.post.composer.composeMsgPlaceOrder(subaccount.address, subaccount.subaccountNumber, clientId, clobPairId, orderFlags, goodTilBlock, 0, // Short term orders use goodTilBlock.
        orderSide, quantums, subticks, timeInForce, reduceOnly, 0, // Client metadata is 0 for short term orders.
        order_1.Order_ConditionType.CONDITION_TYPE_UNSPECIFIED, // Short term orders cannot be conditional.
        long_1.default.fromInt(0));
    }
    /**
     * @description Cancel an order with order information from web socket or REST.
     *
     * @param subaccount The subaccount to cancel the order from
     * @param clientId The client id of the order to cancel
     * @param orderFlags The order flags of the order to cancel
     * @param clobPairId The clob pair id of the order to cancel
     * @param goodTilBlock The goodTilBlock of the order to cancel
     * @param goodTilBlockTime The goodTilBlockTime of the order to cancel
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async cancelRawOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime) {
        return this.validatorClient.post.cancelOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime);
    }
    /**
     * @description Cancel an order with human readable input.
     *
     * @param subaccount The subaccount to cancel the order from
     * @param clientId The client id of the order to cancel
     * @param orderFlags The order flags of the order to cancel
     * @param marketId The market to cancel the order on
     * @param goodTilBlock The goodTilBlock of the order to cancel
     * @param goodTilBlockTime The goodTilBlockTime of the order to cancel
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async cancelOrder(subaccount, clientId, orderFlags, marketId, goodTilBlock, goodTilTimeInSeconds) {
        const marketsResponse = await this.indexerClient.markets.getPerpetualMarkets(marketId);
        const market = marketsResponse.markets[marketId];
        const clobPairId = market.clobPairId;
        if (!(0, validation_1.verifyOrderFlags)(orderFlags)) {
            throw new Error(`Invalid order flags: ${orderFlags}`);
        }
        let goodTilBlockTime;
        if ((0, validation_1.isStatefulOrder)(orderFlags)) {
            if (goodTilTimeInSeconds === undefined || goodTilTimeInSeconds === 0) {
                throw new Error('goodTilTimeInSeconds must be set for LONG_TERM or CONDITIONAL order');
            }
            if (goodTilBlock !== 0) {
                throw new Error('goodTilBlock should be zero since LONG_TERM or CONDITIONAL orders ' +
                    'use goodTilTimeInSeconds instead of goodTilBlock.');
            }
            goodTilBlockTime = this.calculateGoodTilBlockTime(goodTilTimeInSeconds);
        }
        else {
            if (goodTilBlock === undefined || goodTilBlock === 0) {
                throw new Error('goodTilBlock must be non-zero for SHORT_TERM orders');
            }
            if (goodTilTimeInSeconds !== undefined && goodTilTimeInSeconds !== 0) {
                throw new Error('goodTilTimeInSeconds should be zero since SHORT_TERM orders use goodTilBlock instead of goodTilTimeInSeconds.');
            }
        }
        return this.validatorClient.post.cancelOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime);
    }
    /**
     * @description Batch cancel short term orders using marketId to clobPairId translation.
     *
     * @param subaccount The subaccount to cancel the order from
     * @param shortTermOrders The list of short term order batches to cancel with marketId
     * @param goodTilBlock The goodTilBlock of the order to cancel
     * @returns The transaction hash.
     */
    async batchCancelShortTermOrdersWithMarketId(subaccount, shortTermOrders, goodTilBlock, broadcastMode) {
        const orderBatches = await Promise.all(shortTermOrders.map(async ({ marketId, clobPairId, clientIds }) => ({
            clobPairId: (clobPairId !== null && clobPairId !== void 0 ? clobPairId : (await this.indexerClient.markets.getPerpetualMarkets(marketId)).markets[marketId]).clobPairId,
            clientIds,
        })));
        return this.validatorClient.post.batchCancelShortTermOrders(subaccount, orderBatches, goodTilBlock, broadcastMode);
    }
    /**
     * @description Batch cancel short term orders using clobPairId.
     *
     * @param subaccount The subaccount to cancel the order from
     * @param shortTermOrders The list of short term order batches to cancel with clobPairId
     * @param goodTilBlock The goodTilBlock of the order to cancel
     * @returns The transaction hash.
     */
    async batchCancelShortTermOrdersWithClobPairId(subaccount, shortTermOrders, goodTilBlock, broadcastMode) {
        return this.validatorClient.post.batchCancelShortTermOrders(subaccount, shortTermOrders, goodTilBlock, broadcastMode);
    }
    /**
     * @description Transfer from a subaccount to another subaccount
     *
     * @param subaccount The subaccount to transfer from
     * @param recipientAddress The recipient address
     * @param recipientSubaccountNumber The recipient subaccount number
     * @param amount The amount to transfer
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async transferToSubaccount(subaccount, recipientAddress, recipientSubaccountNumber, amount, memo, broadcastMode) {
        const msgs = new Promise((resolve) => {
            const msg = this.transferToSubaccountMessage(subaccount, recipientAddress, recipientSubaccountNumber, amount);
            resolve([msg]);
        });
        return this.send(subaccount.wallet, () => msgs, false, undefined, memo, broadcastMode !== null && broadcastMode !== void 0 ? broadcastMode : tendermint_rpc_1.Method.BroadcastTxCommit);
    }
    /**
     * @description Create message to transfer from a subaccount to another subaccount
     *
     * @param subaccount The subaccount to transfer from
     * @param recipientAddress The recipient address
     * @param recipientSubaccountNumber The recipient subaccount number
     * @param amount The amount to transfer
     *
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message
     */
    transferToSubaccountMessage(subaccount, recipientAddress, recipientSubaccountNumber, amount) {
        const validatorClient = this._validatorClient;
        if (validatorClient === undefined) {
            throw new Error('validatorClient not set');
        }
        const quantums = (0, ethers_1.parseUnits)(amount, validatorClient.config.denoms.USDC_DECIMALS);
        if (quantums > BigInt(long_1.default.MAX_VALUE.toString())) {
            throw new Error('amount to large');
        }
        if (quantums < 0) {
            throw new Error('amount must be positive');
        }
        return this.validatorClient.post.composer.composeMsgTransfer(subaccount.address, subaccount.subaccountNumber, recipientAddress, recipientSubaccountNumber, 0, long_1.default.fromString(quantums.toString()));
    }
    /**
     * @description Deposit from wallet to subaccount
     *
     * @param subaccount The subaccount to deposit to
     * @param amount The amount to deposit
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash.
     */
    async depositToSubaccount(subaccount, amount, memo) {
        const msgs = new Promise((resolve) => {
            const msg = this.depositToSubaccountMessage(subaccount, amount);
            resolve([msg]);
        });
        return this.validatorClient.post.send(subaccount.wallet, () => msgs, false, undefined, memo);
    }
    /**
     * @description Create message to deposit from wallet to subaccount
     *
     * @param subaccount The subaccount to deposit to
     * @param amount The amount to deposit
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message
     */
    depositToSubaccountMessage(subaccount, amount) {
        const validatorClient = this._validatorClient;
        if (validatorClient === undefined) {
            throw new Error('validatorClient not set');
        }
        const quantums = (0, ethers_1.parseUnits)(amount, validatorClient.config.denoms.USDC_DECIMALS);
        if (quantums > BigInt(long_1.default.MAX_VALUE.toString())) {
            throw new Error('amount to large');
        }
        if (quantums < 0) {
            throw new Error('amount must be positive');
        }
        return this.validatorClient.post.composer.composeMsgDepositToSubaccount(subaccount.address, subaccount.subaccountNumber, 0, long_1.default.fromString(quantums.toString()));
    }
    /**
     * @description Withdraw from subaccount to wallet
     *
     * @param subaccount The subaccount to withdraw from
     * @param amount The amount to withdraw
     * @param recipient The recipient address, default to subaccount address
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The transaction hash
     */
    async withdrawFromSubaccount(subaccount, amount, recipient, memo) {
        const msgs = new Promise((resolve) => {
            const msg = this.withdrawFromSubaccountMessage(subaccount, amount, recipient);
            resolve([msg]);
        });
        return this.send(subaccount.wallet, () => msgs, false, undefined, memo);
    }
    /**
     * @description Create message to withdraw from subaccount to wallet
     * with human readable input.
     *
     * @param subaccount The subaccount to withdraw from
     * @param amount The amount to withdraw
     * @param recipient The recipient address
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message
     */
    withdrawFromSubaccountMessage(subaccount, amount, recipient) {
        const validatorClient = this._validatorClient;
        if (validatorClient === undefined) {
            throw new Error('validatorClient not set');
        }
        const quantums = (0, ethers_1.parseUnits)(amount, validatorClient.config.denoms.USDC_DECIMALS);
        if (quantums > BigInt(long_1.default.MAX_VALUE.toString())) {
            throw new Error('amount to large');
        }
        if (quantums < 0) {
            throw new Error('amount must be positive');
        }
        return this.validatorClient.post.composer.composeMsgWithdrawFromSubaccount(subaccount.address, subaccount.subaccountNumber, 0, long_1.default.fromString(quantums.toString()), recipient);
    }
    /**
     * @description Create message to send chain token from subaccount to wallet
     * with human readable input.
     *
     * @param subaccount The subaccount to withdraw from
     * @param amount The amount to withdraw
     * @param recipient The recipient address
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error
     * at any point.
     * @returns The message
     */
    sendTokenMessage(wallet, amount, recipient) {
        var _a;
        const address = wallet.address;
        if (address === undefined) {
            throw new errors_1.UserError('wallet address is not set. Call connectWallet() first');
        }
        const { CHAINTOKEN_DENOM: chainTokenDenom, CHAINTOKEN_DECIMALS: chainTokenDecimals } = ((_a = this._validatorClient) === null || _a === void 0 ? void 0 : _a.config.denoms) || {};
        if (chainTokenDenom === undefined || chainTokenDecimals === undefined) {
            throw new Error('Chain token denom not set in validator config');
        }
        const quantums = (0, ethers_1.parseUnits)(amount, chainTokenDecimals);
        return this.validatorClient.post.composer.composeMsgSendToken(address, recipient, chainTokenDenom, quantums.toString());
    }
    async signPlaceOrder(subaccount, marketId, type, side, price, 
    // trigger_price: number,   // not used for MARKET and LIMIT
    size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly) {
        const msgs = new Promise((resolve) => {
            const msg = this.placeOrderMessage(subaccount, marketId, type, side, price, 
            // trigger_price: number,   // not used for MARKET and LIMIT
            size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly);
            msg
                .then((it) => resolve([it]))
                .catch((err) => {
                console.log(err);
            });
        });
        const signature = await this.sign(wallet, () => msgs, true);
        return Buffer.from(signature).toString('base64');
    }
    async signCancelOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime) {
        const msgs = new Promise((resolve) => {
            const msg = this.validatorClient.post.composer.composeMsgCancelOrder(subaccount.address, subaccount.subaccountNumber, clientId, clobPairId, orderFlags, goodTilBlock, goodTilBlockTime);
            resolve([msg]);
        });
        const signature = await this.sign(subaccount.wallet, () => msgs, true);
        return Buffer.from(signature).toString('base64');
    }
    // vaults
    async depositToMegavault(subaccount, amountUsdc, broadcastMode) {
        return this.validatorClient.post.depositToMegavault(subaccount, (0, helpers_1.bigIntToBytes)((0, chain_helpers_1.calculateVaultQuantums)(amountUsdc)), broadcastMode);
    }
    depositToMegavaultMessage(subaccount, amountUsdc) {
        return this.validatorClient.post.depositToMegavaultMsg(subaccount.address, subaccount.subaccountNumber, (0, helpers_1.bigIntToBytes)((0, chain_helpers_1.calculateVaultQuantums)(amountUsdc)));
    }
    async withdrawFromMegavault(subaccount, shares, minAmount, broadcastMode) {
        return this.validatorClient.post.withdrawFromMegavault(subaccount, (0, helpers_1.bigIntToBytes)(BigInt(Math.floor(shares))), (0, helpers_1.bigIntToBytes)((0, chain_helpers_1.calculateVaultQuantums)(minAmount)), broadcastMode);
    }
    withdrawFromMegavaultMessage(subaccount, shares, minAmount) {
        return this.validatorClient.post.withdrawFromMegavaultMsg(subaccount.address, subaccount.subaccountNumber, (0, helpers_1.bigIntToBytes)(BigInt(Math.floor(shares))), (0, helpers_1.bigIntToBytes)((0, chain_helpers_1.calculateVaultQuantums)(minAmount)));
    }
    /**
     * @description Submit a governance proposal to add a new market.
     *
     * @param params Parameters neeeded to create a new market.
     * @param title Title of the gov proposal.
     * @param summary Summary of the gov proposal.
     * @param initialDepositAmount Initial deposit amount of the gov proposal.
     * @param proposer proposer of the gov proposal.
     *
     * @returns the transaction hash.
     */
    async submitGovAddNewMarketProposal(wallet, params, title, summary, initialDepositAmount, memo, metadata, expedited) {
        const msg = new Promise((resolve) => {
            const composer = this.validatorClient.post.composer;
            const registry = (0, registry_1.generateRegistry)();
            const msgs = [];
            const isDydxUsd = params.ticker.toLowerCase() === 'dydx-usd';
            // x/prices.MsgCreateOracleMarket
            const createOracleMarket = composer.composeMsgCreateOracleMarket(params.id, params.ticker, params.priceExponent, params.minExchanges, params.minPriceChange, params.exchangeConfigJson);
            // x/perpetuals.MsgCreatePerpetual
            const createPerpetual = composer.composeMsgCreatePerpetual(params.id, isDydxUsd ? 1000001 : params.id, params.ticker, params.atomicResolution, params.liquidityTier, params.marketType);
            // x/clob.MsgCreateClobPair
            const createClobPair = composer.composeMsgCreateClobPair(params.id, params.id, params.quantumConversionExponent, params.stepBaseQuantums, params.subticksPerTick);
            // x/clob.MsgUpdateClobPair
            const updateClobPair = composer.composeMsgUpdateClobPair(params.id, params.id, params.quantumConversionExponent, params.stepBaseQuantums, params.subticksPerTick);
            // x/delaymsg.MsgDelayMessage
            const delayMessage = composer.composeMsgDelayMessage(
            // IMPORTANT: must wrap messages in Any type to fit into delaymsg.
            composer.wrapMessageAsAny(registry, updateClobPair), params.delayBlocks);
            // The order matters.
            if (!isDydxUsd) {
                msgs.push(createOracleMarket);
            }
            msgs.push(createPerpetual);
            msgs.push(createClobPair);
            msgs.push(delayMessage);
            // x/gov.v1.MsgSubmitProposal
            const submitProposal = composer.composeMsgSubmitProposal(title, initialDepositAmount, this.validatorClient.config.denoms, // use the client denom.
            summary, 
            // IMPORTANT: must wrap messages in Any type for gov's submit proposal.
            composer.wrapMessageArrAsAny(registry, msgs), wallet.address, // proposer
            metadata, expedited);
            resolve([submitProposal]);
        });
        return this.send(wallet, () => msg, false, undefined, memo);
    }
    async createMarketPermissionless(subaccount, ticker, broadcastMode, gasAdjustment, memo) {
        return this.validatorClient.post.createMarketPermissionless(ticker, subaccount, broadcastMode, gasAdjustment, memo);
    }
}
exports.CompositeClient = CompositeClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlLWNsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jbGllbnRzL2NvbXBvc2l0ZS1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsMkRBQWdEO0FBS2hELHNGQUdvRTtBQUNwRSxtQ0FBb0M7QUFDcEMsZ0RBQXdCO0FBQ3hCLDREQUFrQztBQUVsQyw0Q0FBK0M7QUFDL0Msa0RBQXNFO0FBQ3RFLG9DQUE2RDtBQUM3RCwyQ0FTcUI7QUFDckIsMkRBVWlDO0FBQ2pDLHFEQUFpRDtBQUNqRCx5Q0FBeUM7QUFDekMsNkNBQWtEO0FBSWxELHlEQUFxRDtBQUVyRCxvRUFBb0U7QUFDcEUscUVBQXFFO0FBQ3JFLHdFQUF3RTtBQUN4RSxrRUFBa0U7QUFDbEUsb0JBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGNBQUksQ0FBQztBQUMxQixvQkFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBZ0JyQixNQUFhLGVBQWU7SUFNMUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBZ0I7UUFDbkMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUMsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUIsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELFlBQW9CLE9BQWdCLEVBQUUsVUFBbUI7UUFWbEQsYUFBUSxHQUFxQiw0QkFBZ0IsQ0FBQyxJQUFJLENBQUM7UUFXeEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLDhCQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU8sS0FBSyxDQUFDLFVBQVU7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sa0NBQWUsQ0FBQyxPQUFPLENBQUMsSUFB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