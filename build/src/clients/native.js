"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/*
    Native app can call JS functions with primitives.
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositToMegavault = exports.getMegavaultWithdrawalInfo = exports.getMegavaultOwnerShares = exports.setSelectedGasDenom = exports.signPushNotificationTokenRegistrationPayload = exports.signCompliancePayload = exports.subaccountTransfer = exports.getWithdrawalAndTransferGatingStatus = exports.getWithdrawalCapacityByDenom = exports.cctpMultiMsgWithdraw = exports.cctpWithdraw = exports.withdrawToNobleIBC = exports.sendNobleIBC = exports.getNobleBalance = exports.getMarketPrice = exports.getCurrentUnstaking = exports.getStakingRewards = exports.getDelegatorDelegations = exports.getRewardsParams = exports.getOptimalIndexer = exports.getOptimalNode = exports.decodeAccountResponseValue = exports.encodeAccountRequestData = exports.signCancelOrder = exports.signPlaceOrder = exports.signRawPlaceOrder = exports.simulateTransferNativeToken = exports.simulateWithdraw = exports.simulateDeposit = exports.getUserStats = exports.getAccountBalances = exports.getAccountBalance = exports.transferNativeToken = exports.withdrawToIBC = exports.faucet = exports.withdraw = exports.deposit = exports.cancelOrder = exports.wrappedError = exports.placeOrder = exports.getPerpetualMarkets = exports.getEquityTiers = exports.getUserFeeTier = exports.getFeeTiers = exports.getHeight = exports.deriveMnemomicFromEthereumSignature = exports.connect = exports.connectWallet = exports.connectNetwork = exports.connectClient = void 0;
exports.withdrawFromMegavault = void 0;
const crypto_1 = require("@cosmjs/crypto");
const proto_signing_1 = require("@cosmjs/proto-signing");
const stargate_1 = require("@cosmjs/stargate");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const AuthModule = __importStar(require("cosmjs-types/cosmos/auth/v1beta1/query"));
const long_1 = __importDefault(require("long"));
const constants_1 = require("../lib/constants");
const errors_1 = require("../lib/errors");
const helpers_1 = require("../lib/helpers");
const onboarding_1 = require("../lib/onboarding");
const network_optimizer_1 = require("../network_optimizer");
const composite_client_1 = require("./composite-client");
const constants_2 = require("./constants");
const faucet_client_1 = require("./faucet-client");
const request_helpers_1 = require("./helpers/request-helpers");
const local_wallet_1 = __importDefault(require("./modules/local-wallet"));
const noble_client_1 = require("./noble-client");
const subaccount_1 = require("./subaccount");
async function connectClient(network) {
    try {
        globalThis.client = await composite_client_1.CompositeClient.connect(network);
        return (0, helpers_1.encodeJson)(network);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.connectClient = connectClient;
async function connectNetwork(paramsJSON) {
    try {
        const params = JSON.parse(paramsJSON);
        const { indexerUrl, websocketUrl, validatorUrl, chainId, faucetUrl, nobleValidatorUrl, USDC_DENOM, USDC_DECIMALS, USDC_GAS_DENOM, CHAINTOKEN_DENOM, CHAINTOKEN_DECIMALS, CHAINTOKEN_GAS_DENOM, txnMemo, } = params;
        if (indexerUrl === undefined ||
            websocketUrl === undefined ||
            validatorUrl === undefined ||
            chainId === undefined) {
            throw new errors_1.UserError('Missing required network params');
        }
        if (USDC_DENOM === undefined ||
            USDC_DECIMALS === undefined ||
            CHAINTOKEN_DENOM === undefined ||
            CHAINTOKEN_DECIMALS === undefined) {
            throw new errors_1.UserError('Missing required token params');
        }
        if (txnMemo === undefined) {
            throw new errors_1.UserError('Missing required transaction memo (`txnMemo`)');
        }
        const denomConfig = {
            USDC_DENOM,
            USDC_DECIMALS,
            USDC_GAS_DENOM,
            CHAINTOKEN_DENOM,
            CHAINTOKEN_DECIMALS,
            CHAINTOKEN_GAS_DENOM,
        };
        const indexerConfig = new constants_2.IndexerConfig(indexerUrl, websocketUrl);
        const validatorConfig = new constants_2.ValidatorConfig(validatorUrl, chainId, denomConfig, undefined, txnMemo);
        const config = new constants_2.Network('native', indexerConfig, validatorConfig);
        globalThis.client = await composite_client_1.CompositeClient.connect(config);
        if (faucetUrl !== undefined) {
            globalThis.faucetClient = new faucet_client_1.FaucetClient(faucetUrl);
        }
        else {
            globalThis.faucetClient = null;
        }
        try {
            globalThis.nobleClient = new noble_client_1.NobleClient(nobleValidatorUrl, txnMemo);
            if (globalThis.nobleWallet) {
                await globalThis.nobleClient.connect(globalThis.nobleWallet);
            }
        }
        catch (e) {
            console.error('Failed to connect to noble validator');
        }
        return (0, helpers_1.encodeJson)(config);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.connectNetwork = connectNetwork;
async function connectWallet(mnemonic) {
    var _a;
    try {
        globalThis.wallet = await local_wallet_1.default.fromMnemonic(mnemonic, constants_1.BECH32_PREFIX);
        globalThis.nobleWallet = await local_wallet_1.default.fromMnemonic(mnemonic, constants_1.NOBLE_BECH32_PREFIX);
        const { privateKey, publicKey } = (0, onboarding_1.deriveHDKeyFromMnemonic)(mnemonic);
        globalThis.hdKey = {
            privateKey,
            publicKey,
        };
        try {
            await ((_a = globalThis.nobleClient) === null || _a === void 0 ? void 0 : _a.connect(globalThis.nobleWallet));
        }
        catch (e) {
            console.error('Failed to connect to noble validator');
        }
        const address = globalThis.wallet.address;
        return (0, helpers_1.encodeJson)({ address });
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.connectWallet = connectWallet;
async function connect(network, mnemonic) {
    try {
        await connectClient(network);
        return connectWallet(mnemonic);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.connect = connect;
async function deriveMnemomicFromEthereumSignature(signature) {
    try {
        const { mnemonic, privateKey, publicKey } = (0, onboarding_1.deriveHDKeyFromEthereumSignature)(signature);
        const wallet = await local_wallet_1.default.fromMnemonic(mnemonic, constants_1.BECH32_PREFIX);
        globalThis.hdKey = {
            privateKey,
            publicKey,
        };
        const result = { mnemonic, address: wallet.address };
        return new Promise((resolve) => {
            resolve((0, helpers_1.encodeJson)(result));
        });
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.deriveMnemomicFromEthereumSignature = deriveMnemomicFromEthereumSignature;
async function getHeight() {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const block = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.latestBlock());
        return (0, helpers_1.encodeJson)(block);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getHeight = getHeight;
async function getFeeTiers() {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const feeTiers = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getFeeTiers());
        return (0, helpers_1.encodeJson)(feeTiers);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getFeeTiers = getFeeTiers;
async function getUserFeeTier(payload) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const feeTiers = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getUserFeeTier(address));
        return (0, helpers_1.encodeJson)(feeTiers);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getUserFeeTier = getUserFeeTier;
async function getEquityTiers() {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const equityTiers = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getEquityTierLimitConfiguration());
        return (0, helpers_1.encodeJson)(equityTiers, helpers_1.ByteArrayEncoding.BIGINT);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getEquityTiers = getEquityTiers;
async function getPerpetualMarkets() {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const markets = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.indexerClient.markets.getPerpetualMarkets());
        return (0, helpers_1.encodeJson)(markets);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getPerpetualMarkets = getPerpetualMarkets;
async function placeOrder(payload) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const marketId = json.marketId;
        if (marketId === undefined) {
            throw new errors_1.UserError('marketId is not set');
        }
        const type = json.type;
        if (type === undefined) {
            throw new errors_1.UserError('type is not set');
        }
        const side = json.side;
        if (side === undefined) {
            throw new errors_1.UserError('side is not set');
        }
        const price = json.price;
        if (price === undefined) {
            throw new errors_1.UserError('price is not set');
        }
        // trigger_price: number,   // not used for MARKET and LIMIT
        const size = json.size;
        if (size === undefined) {
            throw new errors_1.UserError('size is not set');
        }
        const clientId = json.clientId;
        if (clientId === undefined) {
            throw new errors_1.UserError('clientId is not set');
        }
        const timeInForce = json.timeInForce;
        const goodTilTimeInSeconds = (_a = json.goodTilTimeInSeconds) !== null && _a !== void 0 ? _a : 0;
        const goodTilBlock = (_b = json.goodTilBlock) !== null && _b !== void 0 ? _b : undefined;
        const execution = json.execution;
        const postOnly = (_c = json.postOnly) !== null && _c !== void 0 ? _c : false;
        const reduceOnly = (_d = json.reduceOnly) !== null && _d !== void 0 ? _d : false;
        const triggerPrice = (_e = json.triggerPrice) !== null && _e !== void 0 ? _e : undefined;
        const marketInfo = (_f = json.marketInfo) !== null && _f !== void 0 ? _f : undefined;
        const currentHeight = (_g = json.currentHeight) !== null && _g !== void 0 ? _g : undefined;
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.placeOrder(subaccount, marketId, type, side, price, size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly, triggerPrice, marketInfo, currentHeight, goodTilBlock);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.placeOrder = placeOrder;
function wrappedError(error) {
    const text = JSON.stringify(error, Object.getOwnPropertyNames(error));
    return `{"error": ${text}}`;
}
exports.wrappedError = wrappedError;
async function cancelOrder(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const clientId = json.clientId;
        if (clientId === undefined) {
            throw new errors_1.UserError('clientId is not set');
        }
        const orderFlags = json.orderFlags;
        if (orderFlags === undefined) {
            throw new errors_1.UserError('orderFlags is not set');
        }
        const clobPairId = json.clobPairId;
        if (clobPairId === undefined) {
            throw new errors_1.UserError('clobPairId is not set');
        }
        const goodTilBlock = json.goodTilBlock;
        const goodTilBlockTime = json.goodTilBlockTime;
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.cancelRawOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock !== 0 ? goodTilBlock : undefined, goodTilBlockTime !== 0 ? goodTilBlockTime : undefined);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.cancelOrder = cancelOrder;
async function deposit(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.depositToSubaccount(subaccount, amount);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.deposit = deposit;
async function withdraw(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.withdrawFromSubaccount(subaccount, amount, json.recipient, json.memo);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.withdraw = withdraw;
async function faucet(payload) {
    try {
        const faucetClient = globalThis.faucetClient;
        if (!faucetClient) {
            throw new errors_1.UserError('faucetClient is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const response = await faucetClient.fill(wallet.address, subaccountNumber, amount);
        const sanitized = {
            data: response.data,
            status: response.status,
            headers: response.headers,
        };
        return (0, helpers_1.encodeJson)(sanitized);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.faucet = faucet;
async function withdrawToIBC(subaccountNumber, amount, payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const decode = (str) => Buffer.from(str, 'base64').toString('binary');
        const decoded = decode(payload);
        const json = JSON.parse(decoded);
        const ibcMsg = {
            typeUrl: json.msgTypeUrl,
            value: {
                ...json.msg,
                // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
                timeoutTimestamp: json.msg.timeoutTimestamp
                    ? BigInt(long_1.default.fromValue(json.msg.timeoutTimestamp).toString())
                    : undefined,
            },
        };
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const subaccountMsg = client.withdrawFromSubaccountMessage(subaccount, amount);
        const msgs = [subaccountMsg, ibcMsg];
        const encodeObjects = new Promise((resolve) => resolve(msgs));
        const tx = await client.send(wallet, () => {
            return encodeObjects;
        }, false, undefined, undefined);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.withdrawToIBC = withdrawToIBC;
async function transferNativeToken(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const msg = client.sendTokenMessage(wallet, amount, json.recipient);
        const msgs = [msg];
        const encodeObjects = new Promise((resolve) => resolve(msgs));
        const tx = await client.send(wallet, () => {
            return encodeObjects;
        }, false, client.validatorClient.post.defaultDydxGasPrice, json.memo);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.transferNativeToken = transferNativeToken;
async function getAccountBalance() {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const address = globalThis.wallet.address;
        const tx = await client.validatorClient.get.getAccountBalance(address, client.validatorClient.config.denoms.USDC_DENOM);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getAccountBalance = getAccountBalance;
async function getAccountBalances() {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const address = globalThis.wallet.address;
        const tx = await client.validatorClient.get.getAccountBalances(address);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getAccountBalances = getAccountBalances;
async function getUserStats(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const tx = await client.validatorClient.get.getUserStats(address);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getUserStats = getUserStats;
async function simulateDeposit(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const msg = client.depositToSubaccountMessage(subaccount, amount);
        const msgs = [msg];
        const encodeObjects = new Promise((resolve) => resolve(msgs));
        const stdFee = await client.simulate(globalThis.wallet, () => {
            return encodeObjects;
        });
        return JSON.stringify(stdFee);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.simulateDeposit = simulateDeposit;
async function simulateWithdraw(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const msg = client.withdrawFromSubaccountMessage(subaccount, amount, json.recipient);
        const msgs = [msg];
        const encodeObjects = new Promise((resolve) => resolve(msgs));
        const stdFee = await client.simulate(globalThis.wallet, () => {
            return encodeObjects;
        });
        return (0, helpers_1.encodeJson)(stdFee);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.simulateWithdraw = simulateWithdraw;
async function simulateTransferNativeToken(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const recipient = json.recipient;
        if (recipient === undefined) {
            throw new errors_1.UserError('recipient is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        const msg = client.sendTokenMessage(wallet, amount, json.recipient);
        const msgs = [msg];
        const encodeObjects = new Promise((resolve) => resolve(msgs));
        const stdFee = await client.simulate(globalThis.wallet, () => {
            return encodeObjects;
        }, client.validatorClient.post.defaultDydxGasPrice);
        return (0, helpers_1.encodeJson)(stdFee);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.simulateTransferNativeToken = simulateTransferNativeToken;
async function signRawPlaceOrder(subaccountNumber, clientId, clobPairId, side, quantums, subticks, timeInForce, orderFlags, reduceOnly, goodTilBlock, goodTilBlockTime, clientMetadata) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const msgs = new Promise((resolve) => {
            const msg = client.validatorClient.post.composer.composeMsgPlaceOrder(wallet.address, subaccountNumber, clientId, clobPairId, orderFlags, goodTilBlock, goodTilBlockTime, side, quantums, subticks, timeInForce, reduceOnly, clientMetadata !== null && clientMetadata !== void 0 ? clientMetadata : 0);
            resolve([msg]);
        });
        const signed = await client.sign(wallet, () => msgs, true);
        return Buffer.from(signed).toString('base64');
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.signRawPlaceOrder = signRawPlaceOrder;
async function signPlaceOrder(subaccountNumber, marketId, type, side, price, 
// trigger_price: number,   // not used for MARKET and LIMIT
size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const signed = await client.signPlaceOrder(subaccount, marketId, type, side, price, size, clientId, timeInForce, goodTilTimeInSeconds, execution, postOnly, reduceOnly);
        return signed;
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.signPlaceOrder = signPlaceOrder;
async function signCancelOrder(subaccountNumber, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const signed = await client.signCancelOrder(subaccount, clientId, orderFlags, clobPairId, goodTilBlock, goodTilBlockTime);
        return signed;
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.signCancelOrder = signCancelOrder;
async function encodeAccountRequestData(address) {
    return new Promise((resolve, reject) => {
        try {
            const requestData = Uint8Array.from(AuthModule.QueryAccountRequest.encode({ address }).finish());
            resolve(Buffer.from(requestData).toString('hex'));
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.encodeAccountRequestData = encodeAccountRequestData;
async function decodeAccountResponseValue(value) {
    return new Promise((resolve, reject) => {
        try {
            const rawData = Buffer.from(value, 'base64');
            const rawAccount = AuthModule.QueryAccountResponse.decode(rawData).account;
            // The promise should have been rejected if the rawAccount was undefined.
            if (rawAccount === undefined) {
                throw Error('rawAccount is undefined');
            }
            const account = (0, stargate_1.accountFromAny)(rawAccount);
            resolve((0, helpers_1.encodeJson)(account));
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.decodeAccountResponseValue = decodeAccountResponseValue;
async function getOptimalNode(endpointUrlsAsJson) {
    /*
      param:
        endpointUrlsAsJson:
        {
          "endpointUrls": [
            "https://rpc.testnet.near.org"
          ],
          "chainId": "testnet"
        }
    */
    try {
        const param = JSON.parse(endpointUrlsAsJson);
        const endpointUrls = param.endpointUrls;
        const chainId = param.chainId;
        const networkOptimizer = new network_optimizer_1.NetworkOptimizer();
        const optimalUrl = await networkOptimizer.findOptimalNode(endpointUrls, chainId);
        const url = {
            url: optimalUrl,
        };
        return (0, helpers_1.encodeJson)(url);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getOptimalNode = getOptimalNode;
async function getOptimalIndexer(endpointUrlsAsJson) {
    /*
      param:
        endpointUrlsAsJson:
        {
          "endpointUrls": [
            "https://api.example.org"
          ]
        }
    */
    try {
        const param = JSON.parse(endpointUrlsAsJson);
        const endpointUrls = param.endpointUrls;
        const networkOptimizer = new network_optimizer_1.NetworkOptimizer();
        const optimalUrl = await networkOptimizer.findOptimalIndexer(endpointUrls);
        const url = {
            url: optimalUrl,
        };
        return (0, helpers_1.encodeJson)(url);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getOptimalIndexer = getOptimalIndexer;
async function getRewardsParams() {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const rewardsParams = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getRewardsParams());
        return (0, helpers_1.encodeJson)(rewardsParams);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getRewardsParams = getRewardsParams;
async function getDelegatorDelegations(payload) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const delegations = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getDelegatorDelegations(address));
        return (0, helpers_1.encodeJson)(delegations);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getDelegatorDelegations = getDelegatorDelegations;
async function getStakingRewards(payload) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const delegations = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getDelegationTotalRewards(address));
        return (0, helpers_1.encodeJson)(delegations);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getStakingRewards = getStakingRewards;
async function getCurrentUnstaking(payload) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const delegations = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getDelegatorUnbondingDelegations(address));
        return (0, helpers_1.encodeJson)(delegations);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getCurrentUnstaking = getCurrentUnstaking;
async function getMarketPrice(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const marketId = json.marketId;
        if (marketId === undefined) {
            throw new errors_1.UserError('marketId is not set');
        }
        const marketPrice = await client.validatorClient.get.getPrice(marketId);
        return (0, helpers_1.encodeJson)(marketPrice);
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getMarketPrice = getMarketPrice;
async function getNobleBalance() {
    try {
        const client = globalThis.nobleClient;
        if (client === undefined || !client.isConnected) {
            throw new errors_1.UserError('client is not connected.');
        }
        const coin = await client.getAccountBalance('uusdc');
        return (0, helpers_1.encodeJson)(coin);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getNobleBalance = getNobleBalance;
async function sendNobleIBC(squidPayload) {
    try {
        const client = globalThis.nobleClient;
        if (client === undefined || !client.isConnected) {
            throw new errors_1.UserError('client is not connected.');
        }
        const json = JSON.parse(squidPayload);
        const ibcMsg = {
            typeUrl: json.msgTypeUrl,
            value: {
                ...json.msg,
                // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
                timeoutTimestamp: json.msg.timeoutTimestamp
                    ? BigInt(long_1.default.fromValue(json.msg.timeoutTimestamp).toString())
                    : undefined,
            },
        };
        const fee = await client.simulateTransaction([ibcMsg]);
        if (!ibcMsg.value.token) {
            throw new errors_1.UserError('Payload missing token field');
        }
        // take out fee from amount before sweeping
        const amount = parseInt(ibcMsg.value.token.amount, 10) -
            Math.floor(parseInt(fee.amount[0].amount, 10) * constants_1.GAS_MULTIPLIER);
        if (amount <= 0) {
            throw new errors_1.UserError('noble balance does not cover fees');
        }
        ibcMsg.value.token = (0, proto_signing_1.coin)(amount.toString(), ibcMsg.value.token.denom);
        const tx = await client.IBCTransfer(ibcMsg);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.sendNobleIBC = sendNobleIBC;
async function withdrawToNobleIBC(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const { subaccountNumber, amount, ibcPayload } = json !== null && json !== void 0 ? json : {};
        const decode = (str) => Buffer.from(str, 'base64').toString('binary');
        const decoded = decode(ibcPayload);
        const parsedIbcPayload = JSON.parse(decoded);
        const msg = client.withdrawFromSubaccountMessage(new subaccount_1.SubaccountInfo(wallet, subaccountNumber), parseFloat(amount).toFixed(client.validatorClient.config.denoms.USDC_DECIMALS));
        const ibcMsg = {
            typeUrl: parsedIbcPayload.msgTypeUrl,
            value: {
                ...parsedIbcPayload.msg,
                // Squid returns timeoutTimestamp as Long, but the signer expects BigInt
                timeoutTimestamp: parsedIbcPayload.msg.timeoutTimestamp
                    ? BigInt(long_1.default.fromValue(parsedIbcPayload.msg.timeoutTimestamp).toString())
                    : undefined,
            },
        };
        const tx = await client.send(wallet, () => Promise.resolve([msg, ibcMsg]), false);
        return (0, helpers_1.encodeJson)({
            txHash: `0x${Buffer.from(tx === null || tx === void 0 ? void 0 : tx.hash).toString('hex')}`,
        });
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.withdrawToNobleIBC = withdrawToNobleIBC;
async function cctpWithdraw(squidPayload) {
    try {
        const client = globalThis.nobleClient;
        if (client === undefined || !client.isConnected) {
            throw new errors_1.UserError('client is not connected.');
        }
        const json = JSON.parse(squidPayload);
        const ibcMsg = {
            typeUrl: json.typeUrl,
            value: json.value,
        };
        const fee = await client.simulateTransaction([ibcMsg]);
        // take out fee from amount before sweeping
        const amount = parseInt(ibcMsg.value.amount, 10) -
            Math.floor(parseInt(fee.amount[0].amount, 10) * constants_1.GAS_MULTIPLIER);
        if (amount <= 0) {
            throw new Error('noble balance does not cover fees');
        }
        ibcMsg.value.amount = amount.toString();
        const tx = await client.send([ibcMsg]);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.cctpWithdraw = cctpWithdraw;
async function cctpMultiMsgWithdraw(cosmosPayload) {
    try {
        const client = globalThis.nobleClient;
        const messages = JSON.parse(cosmosPayload);
        if (client === undefined || !client.isConnected) {
            throw new errors_1.UserError('client is not connected.');
        }
        const ibcMsgs = messages.map(({ typeUrl, value }) => ({
            typeUrl,
            value,
        }));
        const fee = await client.simulateTransaction(ibcMsgs);
        // take out fee from amount before sweeping
        const amount = parseInt(ibcMsgs[0].value.amount, 10) -
            Math.floor(parseInt(fee.amount[0].amount, 10) * constants_1.GAS_MULTIPLIER);
        if (amount <= 0) {
            throw new Error('noble balance does not cover fees');
        }
        ibcMsgs[0].value.amount = amount.toString();
        const tx = await client.send(ibcMsgs);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.cctpMultiMsgWithdraw = cctpMultiMsgWithdraw;
async function getWithdrawalCapacityByDenom(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const denom = json.denom;
        if (denom === undefined) {
            throw new errors_1.UserError('denom is not set');
        }
        const response = await client.validatorClient.get.getWithdrawalCapacityByDenom(denom);
        return (0, helpers_1.encodeJson)(response, helpers_1.ByteArrayEncoding.BIGINT);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getWithdrawalCapacityByDenom = getWithdrawalCapacityByDenom;
async function getWithdrawalAndTransferGatingStatus(perpetualId) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const response = await client.validatorClient.get.getWithdrawalAndTransferGatingStatus(perpetualId);
        return (0, helpers_1.encodeJson)(response);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.getWithdrawalAndTransferGatingStatus = getWithdrawalAndTransferGatingStatus;
async function subaccountTransfer(payload) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const json = JSON.parse(payload);
        const subaccountNumber = json.subaccountNumber;
        if (subaccountNumber === undefined) {
            throw new errors_1.UserError('subaccountNumber is not set');
        }
        const amount = json.amount;
        if (amount === undefined) {
            throw new errors_1.UserError('amount is not set');
        }
        let destinationAddress = json.destinationAddress;
        if (destinationAddress === undefined) {
            destinationAddress = wallet.address;
        }
        const destinationSubaccountNumber = json.destinationSubaccountNumber;
        if (destinationSubaccountNumber === undefined) {
            throw new errors_1.UserError('destinationSubaccountNumber is not set');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.transferToSubaccount(subaccount, destinationAddress, destinationSubaccountNumber, parseFloat(amount).toFixed(6), tendermint_rpc_1.Method.BroadcastTxCommit);
        return (0, helpers_1.encodeJson)(tx);
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.subaccountTransfer = subaccountTransfer;
async function signCompliancePayload(payload) {
    var _a, _b;
    try {
        const json = JSON.parse(payload);
        const message = json.message;
        if (message === undefined) {
            throw new errors_1.UserError('message is not set');
        }
        const action = json.action;
        if (action === undefined) {
            throw new errors_1.UserError('action is not set');
        }
        const currentStatus = json.status;
        if (currentStatus === undefined) {
            throw new errors_1.UserError('status is not set');
        }
        if (!((_a = globalThis.hdKey) === null || _a === void 0 ? void 0 : _a.privateKey) || !((_b = globalThis.hdKey) === null || _b === void 0 ? void 0 : _b.publicKey)) {
            throw new Error('Missing hdKey');
        }
        const timestampInSeconds = Math.floor(Date.now() / 1000);
        const messageToSign = `${message}:${action}"${currentStatus !== null && currentStatus !== void 0 ? currentStatus : ''}:${timestampInSeconds}`;
        const messageHash = (0, crypto_1.sha256)(Buffer.from(messageToSign));
        const signed = await crypto_1.Secp256k1.createSignature(messageHash, globalThis.hdKey.privateKey);
        const signedMessage = signed.toFixedLength();
        return (0, helpers_1.encodeJson)({
            signedMessage: Buffer.from(signedMessage).toString('base64'),
            publicKey: Buffer.from(globalThis.hdKey.publicKey).toString('base64'),
            timestamp: timestampInSeconds,
        });
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.signCompliancePayload = signCompliancePayload;
async function signPushNotificationTokenRegistrationPayload(payload) {
    var _a, _b;
    try {
        const json = JSON.parse(payload);
        const message = json.message;
        if (message === undefined) {
            throw new errors_1.UserError('message is not set');
        }
        if (!((_a = globalThis.hdKey) === null || _a === void 0 ? void 0 : _a.privateKey) || !((_b = globalThis.hdKey) === null || _b === void 0 ? void 0 : _b.publicKey)) {
            throw new Error('Missing hdKey');
        }
        const timestampInSeconds = Math.floor(Date.now() / 1000);
        const messageToSign = `${message}:REGISTER_TOKEN"${''}:${timestampInSeconds}`;
        const messageHash = (0, crypto_1.sha256)(Buffer.from(messageToSign));
        const signed = await crypto_1.Secp256k1.createSignature(messageHash, globalThis.hdKey.privateKey);
        const signedMessage = signed.toFixedLength();
        return (0, helpers_1.encodeJson)({
            signedMessage: Buffer.from(signedMessage).toString('base64'),
            publicKey: Buffer.from(globalThis.hdKey.publicKey).toString('base64'),
            timestamp: timestampInSeconds,
        });
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.signPushNotificationTokenRegistrationPayload = signPushNotificationTokenRegistrationPayload;
async function setSelectedGasDenom(gasDenom) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        await client.setSelectedGasDenom(gasDenom);
        return (0, helpers_1.encodeJson)('success');
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.setSelectedGasDenom = setSelectedGasDenom;
async function getMegavaultOwnerShares(payload) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const json = JSON.parse(payload);
        const address = json.address;
        if (address === undefined) {
            throw new errors_1.UserError('address is not set');
        }
        const response = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getMegavaultOwnerShares(address));
        return (0, helpers_1.encodeJson)((0, request_helpers_1.parseToPrimitives)(response));
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getMegavaultOwnerShares = getMegavaultOwnerShares;
async function getMegavaultWithdrawalInfo(sharesToWithdraw) {
    var _a;
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectClient() first');
        }
        const response = await ((_a = globalThis.client) === null || _a === void 0 ? void 0 : _a.validatorClient.get.getMegavaultWithdrawalInfo(sharesToWithdraw));
        return (0, helpers_1.encodeJson)((0, request_helpers_1.parseToPrimitives)(response));
    }
    catch (e) {
        return wrappedError(e);
    }
}
exports.getMegavaultWithdrawalInfo = getMegavaultWithdrawalInfo;
async function depositToMegavault(subaccountNumber, amountUsdc) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.depositToMegavault(subaccount, amountUsdc, tendermint_rpc_1.Method.BroadcastTxCommit);
        return (0, helpers_1.encodeJson)((0, request_helpers_1.parseToPrimitives)(tx));
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.depositToMegavault = depositToMegavault;
async function withdrawFromMegavault(subaccountNumber, shares, minAmount) {
    try {
        const client = globalThis.client;
        if (client === undefined) {
            throw new errors_1.UserError('client is not connected. Call connectNetwork() first');
        }
        const wallet = globalThis.wallet;
        if (wallet === undefined) {
            throw new errors_1.UserError('wallet is not set. Call connectWallet() first');
        }
        const subaccount = new subaccount_1.SubaccountInfo(wallet, subaccountNumber);
        const tx = await client.withdrawFromMegavault(subaccount, shares, minAmount, tendermint_rpc_1.Method.BroadcastTxCommit);
        return (0, helpers_1.encodeJson)((0, request_helpers_1.parseToPrimitives)(tx));
    }
    catch (error) {
        return wrappedError(error);
    }
}
exports.withdrawFromMegavault = withdrawFromMegavault;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudHMvbmF0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1REFBdUQ7QUFDdkQ7O0VBRUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVGLDJDQUFtRDtBQUNuRCx5REFBeUU7QUFDekUsK0NBQTJFO0FBQzNFLDJEQUFnRDtBQUtoRCxtRkFBcUU7QUFDckUsZ0RBQXdCO0FBRXhCLGdEQUFzRjtBQUN0RiwwQ0FBMEM7QUFDMUMsNENBQStEO0FBQy9ELGtEQUE4RjtBQUM5Riw0REFBd0Q7QUFDeEQseURBQWlFO0FBQ2pFLDJDQVNxQjtBQUNyQixtREFBK0M7QUFDL0MsK0RBQThEO0FBRTlELDBFQUFpRDtBQUNqRCxpREFBNkM7QUFDN0MsNkNBQThDO0FBc0J2QyxLQUFLLFVBQVUsYUFBYSxDQUFDLE9BQWdCO0lBQ2xELElBQUk7UUFDRixVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sa0NBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDM0QsT0FBTyxJQUFBLG9CQUFVLEVBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUI7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3hCO0FBQ0gsQ0FBQztBQVBELHNDQU9DO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxVQUFrQjtJQUNyRCxJQUFJO1FBQ0YsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0QyxNQUFNLEVBQ0osVUFBVSxFQUNWLFlBQVksRUFDWixZQUFZLEVBQ1osT0FBTyxFQUNQLFNBQVMsRUFDVCxpQkFBaUIsRUFDakIsVUFBVSxFQUNWLGFBQWEsRUFDYixjQUFjLEVBQ2QsZ0JBQWdCLEVBQ2hCLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsT0FBTyxHQUNSLEdB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