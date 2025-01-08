"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHORT_BLOCK_WINDOW = exports.MAX_MEMO_CHARACTERS = exports.DEFAULT_API_TIMEOUT = exports.TradingRewardAggregationPeriod = exports.PnlTickInterval = exports.TimePeriod = exports.PositionStatus = exports.TickerType = exports.OrderStatus = exports.OrderExecution = exports.OrderTimeInForce = exports.OrderSide = exports.OrderType = exports.MarketStatisticDay = exports.MEGAVAULT_MODULE_ADDRESS = exports.DELAYMSG_MODULE_ADDRESS = exports.GOV_MODULE_ADDRESS = exports.TYPE_URL_MSG_WITHDRAW_DELEGATOR_REWARD = exports.TYPE_URL_MSG_UNDELEGATE = exports.TYPE_URL_MSG_DELEGATE = exports.TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT = exports.TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT = exports.TYPE_URL_MSG_REGISTER_AFFILIATE = exports.TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT = exports.TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT = exports.TYPE_URL_MSG_CREATE_TRANSFER = exports.TYPE_URL_MSG_CREATE_ORACLE_MARKET = exports.TYPE_URL_MSG_CREATE_PERPETUAL = exports.TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS = exports.TYPE_URL_MSG_DELAY_MESSAGE = exports.TYPE_URL_MSG_UPDATE_CLOB_PAIR = exports.TYPE_URL_MSG_CREATE_CLOB_PAIR = exports.TYPE_URL_BATCH_CANCEL = exports.TYPE_URL_MSG_CANCEL_ORDER = exports.TYPE_URL_MSG_PLACE_ORDER = exports.TYPE_URL_MSG_SUBMIT_PROPOSAL = exports.TYPE_URL_MSG_SEND = exports.SelectedGasDenom = exports.NETWORK_ID_MAINNET = exports.NETWORK_ID_TESTNET = exports.NetworkId = exports.ValidatorApiHost = exports.FaucetApiHost = exports.IndexerWSHost = exports.IndexerApiHost = exports.MAINNET_CHAIN_ID = exports.LOCAL_CHAIN_ID = exports.TESTNET_CHAIN_ID = exports.STAGING_CHAIN_ID = exports.DEV_CHAIN_ID = void 0;
exports.Network = exports.ValidatorConfig = exports.IndexerConfig = exports.PAGE_REQUEST = exports.SHORT_BLOCK_FORWARD = void 0;
const long_1 = __importDefault(require("long"));
__exportStar(require("../lib/constants"), exports);
/**
 * Disclaimer: Note that as of the date hereof, the testnet and dYdX Chain deployment by DYDX
 * token holders are the only known deployments of the dYdX v4 software, and other deployment
 * options may be added.
 * For more information, please see https://dydx.exchange/dydx-chain-front-end-options
 */
// Chain ID
exports.DEV_CHAIN_ID = 'orderstory-dev';
exports.STAGING_CHAIN_ID = 'orderstory-staging';
exports.TESTNET_CHAIN_ID = 'orderstory-testnet';
exports.LOCAL_CHAIN_ID = 'orderstory-local';
// For the deployment by DYDX token holders
exports.MAINNET_CHAIN_ID = 'dydxprotocol-testnet';
// ------------ API URLs ------------
var IndexerApiHost;
(function (IndexerApiHost) {
    IndexerApiHost["TESTNET"] = "http://18.179.86.26:3002/";
    IndexerApiHost["STAGING"] = "https://indexer.orderstory.xyz/";
    IndexerApiHost["LOCAL"] = "http://localhost:3002";
    // For the deployment by DYDX token holders
    IndexerApiHost["MAINNET"] = "https://indexer.v4testnet.dydx.exchange/";
})(IndexerApiHost = exports.IndexerApiHost || (exports.IndexerApiHost = {}));
var IndexerWSHost;
(function (IndexerWSHost) {
    IndexerWSHost["TESTNET"] = "ws://18.179.86.26:3003/v4/ws";
    IndexerWSHost["STAGING"] = "wss://indexer.orderstory.xyz/v4/ws";
    IndexerWSHost["LOCAL"] = "ws://localhost:3003";
    // For the deployment by DYDX token holders
    IndexerWSHost["MAINNET"] = "wss://indexer.v4testnet.dydx.exchange/v4/ws";
})(IndexerWSHost = exports.IndexerWSHost || (exports.IndexerWSHost = {}));
var FaucetApiHost;
(function (FaucetApiHost) {
    FaucetApiHost["TESTNET"] = "https://faucet.orderstory.xyz";
})(FaucetApiHost = exports.FaucetApiHost || (exports.FaucetApiHost = {}));
var ValidatorApiHost;
(function (ValidatorApiHost) {
    ValidatorApiHost["TESTNET"] = "http://18.179.86.26:26657";
    ValidatorApiHost["STAGING"] = "https://validator.orderstory.xyz";
    ValidatorApiHost["LOCAL"] = "http://localhost:26657";
    // For the deployment by DYDX token holders
    ValidatorApiHost["MAINNET"] = "https://test-dydx-rpc.kingnodes.com";
})(ValidatorApiHost = exports.ValidatorApiHost || (exports.ValidatorApiHost = {}));
// ------------ Network IDs ------------
var NetworkId;
(function (NetworkId) {
    NetworkId["TESTNET"] = "orderstory-testnet-1";
    // For the deployment by DYDX token holders
    NetworkId["MAINNET"] = "dydx-testnet-4";
})(NetworkId = exports.NetworkId || (exports.NetworkId = {}));
exports.NETWORK_ID_TESTNET = 'orderstory-testnet';
// For the deployment by DYDX token holders
exports.NETWORK_ID_MAINNET = 'dydxprotocol-testnet';
// ------------ Gas Denoms ------------
var SelectedGasDenom;
(function (SelectedGasDenom) {
    SelectedGasDenom["NATIVE"] = "NATIVE";
    SelectedGasDenom["USDC"] = "USDC";
})(SelectedGasDenom = exports.SelectedGasDenom || (exports.SelectedGasDenom = {}));
// ------------ MsgType URLs ------------
// Default CosmosSDK
// x/bank
exports.TYPE_URL_MSG_SEND = '/cosmos.bank.v1beta1.MsgSend';
// x/gov
exports.TYPE_URL_MSG_SUBMIT_PROPOSAL = '/cosmos.gov.v1.MsgSubmitProposal';
// dYdX Specific
// x/clob
exports.TYPE_URL_MSG_PLACE_ORDER = '/dydxprotocol.clob.MsgPlaceOrder';
exports.TYPE_URL_MSG_CANCEL_ORDER = '/dydxprotocol.clob.MsgCancelOrder';
exports.TYPE_URL_BATCH_CANCEL = '/dydxprotocol.clob.MsgBatchCancel';
exports.TYPE_URL_MSG_CREATE_CLOB_PAIR = '/dydxprotocol.clob.MsgCreateClobPair';
exports.TYPE_URL_MSG_UPDATE_CLOB_PAIR = '/dydxprotocol.clob.MsgUpdateClobPair';
// x/delaymsg
exports.TYPE_URL_MSG_DELAY_MESSAGE = '/dydxprotocol.delaymsg.MsgDelayMessage';
// x/listing
exports.TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS = '/dydxprotocol.listing.MsgCreateMarketPermissionless';
// x/perpetuals
exports.TYPE_URL_MSG_CREATE_PERPETUAL = '/dydxprotocol.perpetuals.MsgCreatePerpetual';
// x/prices
exports.TYPE_URL_MSG_CREATE_ORACLE_MARKET = '/dydxprotocol.prices.MsgCreateOracleMarket';
// x/sending
exports.TYPE_URL_MSG_CREATE_TRANSFER = '/dydxprotocol.sending.MsgCreateTransfer';
exports.TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT = '/dydxprotocol.sending.MsgWithdrawFromSubaccount';
exports.TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT = '/dydxprotocol.sending.MsgDepositToSubaccount';
// x/affiliates
exports.TYPE_URL_MSG_REGISTER_AFFILIATE = '/dydxprotocol.affiliates.MsgRegisterAffiliate';
// x/vault
exports.TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT = '/dydxprotocol.vault.MsgDepositToMegavault';
exports.TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT = '/dydxprotocol.vault.MsgWithdrawFromMegavault';
// x/staking
exports.TYPE_URL_MSG_DELEGATE = '/cosmos.staking.v1beta1.MsgDelegate';
exports.TYPE_URL_MSG_UNDELEGATE = '/cosmos.staking.v1beta1.MsgUndelegate';
// x/distribution
exports.TYPE_URL_MSG_WITHDRAW_DELEGATOR_REWARD = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward';
// ------------ Chain Constants ------------
// The following are same across different networks / deployments.
exports.GOV_MODULE_ADDRESS = 'dydx10d07y265gmmuvt4z0w9aw880jnsr700jnmapky';
exports.DELAYMSG_MODULE_ADDRESS = 'dydx1mkkvp26dngu6n8rmalaxyp3gwkjuzztq5zx6tr';
exports.MEGAVAULT_MODULE_ADDRESS = 'dydx18tkxrnrkqc2t0lr3zxr5g6a4hdvqksylxqje4r';
// ------------ Market Statistic Day Types ------------
var MarketStatisticDay;
(function (MarketStatisticDay) {
    MarketStatisticDay["ONE"] = "1";
    MarketStatisticDay["SEVEN"] = "7";
    MarketStatisticDay["THIRTY"] = "30";
})(MarketStatisticDay = exports.MarketStatisticDay || (exports.MarketStatisticDay = {}));
// ------------ Order Types ------------
// This should match OrderType in Abacus
var OrderType;
(function (OrderType) {
    OrderType["LIMIT"] = "LIMIT";
    OrderType["MARKET"] = "MARKET";
    OrderType["STOP_LIMIT"] = "STOP_LIMIT";
    OrderType["TAKE_PROFIT_LIMIT"] = "TAKE_PROFIT";
    OrderType["STOP_MARKET"] = "STOP_MARKET";
    OrderType["TAKE_PROFIT_MARKET"] = "TAKE_PROFIT_MARKET";
})(OrderType = exports.OrderType || (exports.OrderType = {}));
// ------------ Order Side ------------
// This should match OrderSide in Abacus
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide = exports.OrderSide || (exports.OrderSide = {}));
// ------------ Order TimeInForce ------------
// This should match OrderTimeInForce in Abacus
var OrderTimeInForce;
(function (OrderTimeInForce) {
    OrderTimeInForce["GTT"] = "GTT";
    OrderTimeInForce["IOC"] = "IOC";
    OrderTimeInForce["FOK"] = "FOK";
})(OrderTimeInForce = exports.OrderTimeInForce || (exports.OrderTimeInForce = {}));
// ------------ Order Execution ------------
// This should match OrderExecution in Abacus
var OrderExecution;
(function (OrderExecution) {
    OrderExecution["DEFAULT"] = "DEFAULT";
    OrderExecution["IOC"] = "IOC";
    OrderExecution["FOK"] = "FOK";
    OrderExecution["POST_ONLY"] = "POST_ONLY";
})(OrderExecution = exports.OrderExecution || (exports.OrderExecution = {}));
// ------------ Order Status ------------
// This should match OrderStatus in Abacus
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["BEST_EFFORT_OPENED"] = "BEST_EFFORT_OPENED";
    OrderStatus["OPEN"] = "OPEN";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["BEST_EFFORT_CANCELED"] = "BEST_EFFORT_CANCELED";
    OrderStatus["CANCELED"] = "CANCELED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var TickerType;
(function (TickerType) {
    TickerType["PERPETUAL"] = "PERPETUAL";
})(TickerType = exports.TickerType || (exports.TickerType = {}));
var PositionStatus;
(function (PositionStatus) {
    PositionStatus["OPEN"] = "OPEN";
    PositionStatus["CLOSED"] = "CLOSED";
    PositionStatus["LIQUIDATED"] = "LIQUIDATED";
})(PositionStatus = exports.PositionStatus || (exports.PositionStatus = {}));
// ----------- Time Period for Sparklines -------------
var TimePeriod;
(function (TimePeriod) {
    TimePeriod["ONE_DAY"] = "ONE_DAY";
    TimePeriod["SEVEN_DAYS"] = "SEVEN_DAYS";
})(TimePeriod = exports.TimePeriod || (exports.TimePeriod = {}));
var PnlTickInterval;
(function (PnlTickInterval) {
    PnlTickInterval["HOUR"] = "hour";
    PnlTickInterval["day"] = "day";
})(PnlTickInterval = exports.PnlTickInterval || (exports.PnlTickInterval = {}));
var TradingRewardAggregationPeriod;
(function (TradingRewardAggregationPeriod) {
    TradingRewardAggregationPeriod["DAILY"] = "DAILY";
    TradingRewardAggregationPeriod["WEEKLY"] = "WEEKLY";
    TradingRewardAggregationPeriod["MONTHLY"] = "MONTHLY";
})(TradingRewardAggregationPeriod = exports.TradingRewardAggregationPeriod || (exports.TradingRewardAggregationPeriod = {}));
// ------------ API Defaults ------------
exports.DEFAULT_API_TIMEOUT = 3000;
exports.MAX_MEMO_CHARACTERS = 256;
exports.SHORT_BLOCK_WINDOW = 20;
exports.SHORT_BLOCK_FORWARD = 3;
// Querying
exports.PAGE_REQUEST = {
    key: new Uint8Array(),
    offset: long_1.default.UZERO,
    limit: long_1.default.MAX_UNSIGNED_VALUE,
    countTotal: true,
    reverse: false,
};
class IndexerConfig {
    constructor(restEndpoint, websocketEndpoint) {
        this.restEndpoint = restEndpoint;
        this.websocketEndpoint = websocketEndpoint;
    }
}
exports.IndexerConfig = IndexerConfig;
class ValidatorConfig {
    constructor(restEndpoint, chainId, denoms, broadcastOptions, defaultClientMemo, useTimestampNonce) {
        this.restEndpoint = (restEndpoint === null || restEndpoint === void 0 ? void 0 : restEndpoint.endsWith('/')) ? restEndpoint.slice(0, -1) : restEndpoint;
        this.chainId = chainId;
        this.denoms = denoms;
        this.broadcastOptions = broadcastOptions;
        this.defaultClientMemo = defaultClientMemo;
        this.useTimestampNonce = useTimestampNonce;
    }
}
exports.ValidatorConfig = ValidatorConfig;
class Network {
    constructor(env, indexerConfig, validatorConfig) {
        this.env = env;
        this.indexerConfig = indexerConfig;
        this.validatorConfig = validatorConfig;
    }
    static testnet() {
        const indexerConfig = new IndexerConfig(IndexerApiHost.TESTNET, IndexerWSHost.TESTNET);
        const validatorConfig = new ValidatorConfig(ValidatorApiHost.TESTNET, exports.TESTNET_CHAIN_ID, {
            CHAINTOKEN_DENOM: 'adv4tnt',
            USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
            USDC_GAS_DENOM: 'uusdc',
            USDC_DECIMALS: 6,
            CHAINTOKEN_DECIMALS: 18,
        }, undefined, 'Client Example');
        return new Network('testnet', indexerConfig, validatorConfig);
    }
    static staging() {
        const indexerConfig = new IndexerConfig(IndexerApiHost.STAGING, IndexerWSHost.STAGING);
        const validatorConfig = new ValidatorConfig(ValidatorApiHost.STAGING, exports.TESTNET_CHAIN_ID, {
            CHAINTOKEN_DENOM: 'adv4tnt',
            USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
            USDC_GAS_DENOM: 'uusdc',
            USDC_DECIMALS: 6,
            CHAINTOKEN_DECIMALS: 18,
        }, undefined, 'Client Example');
        return new Network('staging', indexerConfig, validatorConfig);
    }
    static local() {
        const indexerConfig = new IndexerConfig(IndexerApiHost.LOCAL, IndexerWSHost.LOCAL);
        const validatorConfig = new ValidatorConfig(ValidatorApiHost.LOCAL, exports.LOCAL_CHAIN_ID, {
            CHAINTOKEN_DENOM: 'adv4tnt',
            USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
            USDC_GAS_DENOM: 'uusdc',
            USDC_DECIMALS: 6,
            CHAINTOKEN_DECIMALS: 18,
        }, undefined, 'Client Example');
        return new Network('local', indexerConfig, validatorConfig);
    }
    // For the deployment by DYDX token holders.
    static mainnet() {
        const indexerConfig = new IndexerConfig(IndexerApiHost.MAINNET, IndexerWSHost.MAINNET);
        const validatorConfig = new ValidatorConfig(ValidatorApiHost.MAINNET, exports.MAINNET_CHAIN_ID, {
            CHAINTOKEN_DENOM: 'adydx',
            USDC_DENOM: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
            USDC_GAS_DENOM: 'uusdc',
            USDC_DECIMALS: 6,
            CHAINTOKEN_DECIMALS: 18,
        }, undefined, 'Client Example');
        return new Network('mainnet', indexerConfig, validatorConfig);
    }
    getString() {
        return this.env;
    }
}
exports.Network = Network;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudHMvY29uc3RhbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLGdEQUF3QjtBQUl4QixtREFBaUM7QUFFakM7Ozs7O0dBS0c7QUFFSCxXQUFXO0FBQ0UsUUFBQSxZQUFZLEdBQUcsZ0JBQWdCLENBQUM7QUFDaEMsUUFBQSxnQkFBZ0IsR0FBRyxvQkFBb0IsQ0FBQztBQUN4QyxRQUFBLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDO0FBQ3hDLFFBQUEsY0FBYyxHQUFHLGtCQUFrQixDQUFDO0FBQ2pELDJDQUEyQztBQUM5QixRQUFBLGdCQUFnQixHQUFHLHNCQUFzQixDQUFDO0FBRXZELHFDQUFxQztBQUNyQyxJQUFZLGNBTVg7QUFORCxXQUFZLGNBQWM7SUFDeEIsdURBQXFDLENBQUE7SUFDckMsNkRBQTJDLENBQUE7SUFDM0MsaURBQStCLENBQUE7SUFDL0IsMkNBQTJDO0lBQzNDLHNFQUFvRCxDQUFBO0FBQ3RELENBQUMsRUFOVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQU16QjtBQUVELElBQVksYUFNWDtBQU5ELFdBQVksYUFBYTtJQUN2Qix5REFBd0MsQ0FBQTtJQUN4QywrREFBOEMsQ0FBQTtJQUM5Qyw4Q0FBNkIsQ0FBQTtJQUM3QiwyQ0FBMkM7SUFDM0Msd0VBQXVELENBQUE7QUFDekQsQ0FBQyxFQU5XLGFBQWEsR0FBYixxQkFBYSxLQUFiLHFCQUFhLFFBTXhCO0FBRUQsSUFBWSxhQUVYO0FBRkQsV0FBWSxhQUFhO0lBQ3ZCLDBEQUF5QyxDQUFBO0FBQzNDLENBQUMsRUFGVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQUV4QjtBQUVELElBQVksZ0JBTVg7QUFORCxXQUFZLGdCQUFnQjtJQUMxQix5REFBcUMsQ0FBQTtJQUNyQyxnRUFBNEMsQ0FBQTtJQUM1QyxvREFBZ0MsQ0FB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