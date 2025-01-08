import { PageRequest } from '@dydxprotocol/v4-proto/src/codegen/cosmos/base/query/v1beta1/pagination';
import { BroadcastOptions, DenomConfig } from './types';
export * from '../lib/constants';
/**
 * Disclaimer: Note that as of the date hereof, the testnet and dYdX Chain deployment by DYDX
 * token holders are the only known deployments of the dYdX v4 software, and other deployment
 * options may be added.
 * For more information, please see https://dydx.exchange/dydx-chain-front-end-options
 */
export declare const DEV_CHAIN_ID = "orderstory-dev";
export declare const STAGING_CHAIN_ID = "orderstory-staging";
export declare const TESTNET_CHAIN_ID = "orderstory-testnet";
export declare const LOCAL_CHAIN_ID = "orderstory-local";
export declare const MAINNET_CHAIN_ID = "dydxprotocol-testnet";
export declare enum IndexerApiHost {
    TESTNET = "http://18.179.86.26:3002/",
    STAGING = "https://indexer.orderstory.xyz/",
    LOCAL = "http://localhost:3002",
    MAINNET = "https://indexer.v4testnet.dydx.exchange/"
}
export declare enum IndexerWSHost {
    TESTNET = "ws://18.179.86.26:3003/v4/ws",
    STAGING = "wss://indexer.orderstory.xyz/v4/ws",
    LOCAL = "ws://localhost:3003",
    MAINNET = "wss://indexer.v4testnet.dydx.exchange/v4/ws"
}
export declare enum FaucetApiHost {
    TESTNET = "https://faucet.orderstory.xyz"
}
export declare enum ValidatorApiHost {
    TESTNET = "http://18.179.86.26:26657",
    STAGING = "https://validator.orderstory.xyz",
    LOCAL = "http://localhost:26657",
    MAINNET = "https://test-dydx-rpc.kingnodes.com"
}
export declare enum NetworkId {
    TESTNET = "orderstory-testnet-1",
    MAINNET = "dydx-testnet-4"
}
export declare const NETWORK_ID_TESTNET: string;
export declare const NETWORK_ID_MAINNET: string;
export declare enum SelectedGasDenom {
    NATIVE = "NATIVE",
    USDC = "USDC"
}
export declare const TYPE_URL_MSG_SEND = "/cosmos.bank.v1beta1.MsgSend";
export declare const TYPE_URL_MSG_SUBMIT_PROPOSAL = "/cosmos.gov.v1.MsgSubmitProposal";
export declare const TYPE_URL_MSG_PLACE_ORDER = "/dydxprotocol.clob.MsgPlaceOrder";
export declare const TYPE_URL_MSG_CANCEL_ORDER = "/dydxprotocol.clob.MsgCancelOrder";
export declare const TYPE_URL_BATCH_CANCEL = "/dydxprotocol.clob.MsgBatchCancel";
export declare const TYPE_URL_MSG_CREATE_CLOB_PAIR = "/dydxprotocol.clob.MsgCreateClobPair";
export declare const TYPE_URL_MSG_UPDATE_CLOB_PAIR = "/dydxprotocol.clob.MsgUpdateClobPair";
export declare const TYPE_URL_MSG_DELAY_MESSAGE = "/dydxprotocol.delaymsg.MsgDelayMessage";
export declare const TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS = "/dydxprotocol.listing.MsgCreateMarketPermissionless";
export declare const TYPE_URL_MSG_CREATE_PERPETUAL = "/dydxprotocol.perpetuals.MsgCreatePerpetual";
export declare const TYPE_URL_MSG_CREATE_ORACLE_MARKET = "/dydxprotocol.prices.MsgCreateOracleMarket";
export declare const TYPE_URL_MSG_CREATE_TRANSFER = "/dydxprotocol.sending.MsgCreateTransfer";
export declare const TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT = "/dydxprotocol.sending.MsgWithdrawFromSubaccount";
export declare const TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT = "/dydxprotocol.sending.MsgDepositToSubaccount";
export declare const TYPE_URL_MSG_REGISTER_AFFILIATE = "/dydxprotocol.affiliates.MsgRegisterAffiliate";
export declare const TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT = "/dydxprotocol.vault.MsgDepositToMegavault";
export declare const TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT = "/dydxprotocol.vault.MsgWithdrawFromMegavault";
export declare const TYPE_URL_MSG_DELEGATE = "/cosmos.staking.v1beta1.MsgDelegate";
export declare const TYPE_URL_MSG_UNDELEGATE = "/cosmos.staking.v1beta1.MsgUndelegate";
export declare const TYPE_URL_MSG_WITHDRAW_DELEGATOR_REWARD = "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward";
export declare const GOV_MODULE_ADDRESS = "dydx10d07y265gmmuvt4z0w9aw880jnsr700jnmapky";
export declare const DELAYMSG_MODULE_ADDRESS = "dydx1mkkvp26dngu6n8rmalaxyp3gwkjuzztq5zx6tr";
export declare const MEGAVAULT_MODULE_ADDRESS = "dydx18tkxrnrkqc2t0lr3zxr5g6a4hdvqksylxqje4r";
export declare enum MarketStatisticDay {
    ONE = "1",
    SEVEN = "7",
    THIRTY = "30"
}
export declare enum OrderType {
    LIMIT = "LIMIT",
    MARKET = "MARKET",
    STOP_LIMIT = "STOP_LIMIT",
    TAKE_PROFIT_LIMIT = "TAKE_PROFIT",
    STOP_MARKET = "STOP_MARKET",
    TAKE_PROFIT_MARKET = "TAKE_PROFIT_MARKET"
}
export declare enum OrderSide {
    BUY = "BUY",
    SELL = "SELL"
}
export declare enum OrderTimeInForce {
    GTT = "GTT",
    IOC = "IOC",
    FOK = "FOK"
}
export declare enum OrderExecution {
    DEFAULT = "DEFAULT",
    IOC = "IOC",
    FOK = "FOK",
    POST_ONLY = "POST_ONLY"
}
export declare enum OrderStatus {
    BEST_EFFORT_OPENED = "BEST_EFFORT_OPENED",
    OPEN = "OPEN",
    FILLED = "FILLED",
    BEST_EFFORT_CANCELED = "BEST_EFFORT_CANCELED",
    CANCELED = "CANCELED"
}
export declare enum TickerType {
    PERPETUAL = "PERPETUAL"
}
export declare enum PositionStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    LIQUIDATED = "LIQUIDATED"
}
export declare enum TimePeriod {
    ONE_DAY = "ONE_DAY",
    SEVEN_DAYS = "SEVEN_DAYS"
}
export declare enum PnlTickInterval {
    HOUR = "hour",
    day = "day"
}
export declare enum TradingRewardAggregationPeriod {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY"
}
export declare const DEFAULT_API_TIMEOUT: number;
export declare const MAX_MEMO_CHARACTERS: number;
export declare const SHORT_BLOCK_WINDOW: number;
export declare const SHORT_BLOCK_FORWARD: number;
export declare const PAGE_REQUEST: PageRequest;
export declare class IndexerConfig {
    restEndpoint: string;
    websocketEndpoint: string;
    constructor(restEndpoint: string, websocketEndpoint: string);
}
export declare class ValidatorConfig {
    restEndpoint: string;
    chainId: string;
    denoms: DenomConfig;
    broadcastOptions?: BroadcastOptions;
    defaultClientMemo?: string;
    useTimestampNonce?: boolean;
    constructor(restEndpoint: string, chainId: string, denoms: DenomConfig, broadcastOptions?: BroadcastOptions, defaultClientMemo?: string, useTimestampNonce?: boolean);
}
export declare class Network {
    env: string;
    indexerConfig: IndexerConfig;
    validatorConfig: ValidatorConfig;
    constructor(env: string, indexerConfig: IndexerConfig, validatorConfig: ValidatorConfig);
    static testnet(): Network;
    static staging(): Network;
    static local(): Network;
    static mainnet(): Network;
    getString(): string;
}
