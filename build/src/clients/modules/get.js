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
exports.Get = void 0;
const stargate_1 = require("@cosmjs/stargate");
const AuthModule = __importStar(require("cosmjs-types/cosmos/auth/v1beta1/query"));
const BankModule = __importStar(require("cosmjs-types/cosmos/bank/v1beta1/query"));
const long_1 = __importDefault(require("long"));
const protobufjs_1 = __importDefault(require("protobufjs"));
const helpers_1 = require("../../lib/helpers");
const constants_1 = require("../constants");
const errors_1 = require("../lib/errors");
const proto_includes_1 = require("./proto-includes");
// Required for encoding and decoding queries that are of type Long.
// Must be done once but since the individal modules should be usable without
// dYdXClient - must be set in each module that encounters encoding/decoding Longs.
// Reference: https://github.com/protobufjs/protobuf.js/issues/921
protobufjs_1.default.util.Long = long_1.default;
protobufjs_1.default.configure();
class Get {
    constructor(tendermintClient, stargateQueryClient) {
        this.tendermintClient = tendermintClient;
        this.stargateQueryClient = stargateQueryClient;
    }
    /**
     * @description Get latest block
     *
     * @returns last block structure
     */
    async latestBlock() {
        return this.tendermintClient.getBlock();
    }
    /**
     * @description Get latest block height
     *
     * @returns last height
     */
    async latestBlockHeight() {
        const block = await this.latestBlock();
        return block.header.height;
    }
    /**
     * @description Get all fee tier params.
     *
     * @returns All fee tier params.
     */
    async getFeeTiers() {
        const requestData = Uint8Array.from(proto_includes_1.FeeTierModule.QueryPerpetualFeeParamsRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.feetiers.Query/PerpetualFeeParams', requestData);
        return proto_includes_1.FeeTierModule.QueryPerpetualFeeParamsResponse.decode(data);
    }
    /**
     * @description Get fee tier the user belongs to
     *
     * @returns the fee tier user belongs to.
     */
    async getUserFeeTier(address) {
        const requestData = Uint8Array.from(proto_includes_1.FeeTierModule.QueryUserFeeTierRequest.encode({ user: address }).finish());
        const data = await this.sendQuery('/dydxprotocol.feetiers.Query/UserFeeTier', requestData);
        return proto_includes_1.FeeTierModule.QueryUserFeeTierResponse.decode(data);
    }
    /**
     * @description Get get trading stats
     *
     * @returns return the user's taker and maker volume
     */
    async getUserStats(address) {
        const requestData = Uint8Array.from(proto_includes_1.StatsModule.QueryUserStatsRequest.encode({ user: address }).finish());
        const data = await this.sendQuery('/dydxprotocol.stats.Query/UserStats', requestData);
        return proto_includes_1.StatsModule.QueryUserStatsResponse.decode(data).stats;
    }
    /**
     * @description Get all balances for an account.
     *
     * @returns Array of Coin balances for all tokens held by an account.
     */
    async getAccountBalances(address) {
        const requestData = Uint8Array.from(BankModule.QueryAllBalancesRequest.encode({ address }).finish());
        const data = await this.sendQuery('/cosmos.bank.v1beta1.Query/AllBalances', requestData);
        return BankModule.QueryAllBalancesResponse.decode(data).balances;
    }
    /**
     * @description Get balances of one denom for an account.
     *
     * @returns Coin balance for denom tokens held by an account.
     */
    async getAccountBalance(address, denom) {
        const requestData = Uint8Array.from(BankModule.QueryBalanceRequest.encode({
            address,
            denom,
        }).finish());
        const data = await this.sendQuery('/cosmos.bank.v1beta1.Query/Balance', requestData);
        const coin = BankModule.QueryBalanceResponse.decode(data).balance;
        return coin;
    }
    /**
     * @description Get all subaccounts
     *
     * @returns All subaccounts
     */
    async getSubaccounts() {
        const requestData = Uint8Array.from(proto_includes_1.SubaccountsModule.QueryAllSubaccountRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.subaccounts.Query/SubaccountAll', requestData);
        return proto_includes_1.SubaccountsModule.QuerySubaccountAllResponse.decode(data);
    }
    /**
     * @description Get a specific subaccount for an account.
     *
     * @returns Subaccount for account with given accountNumber or default subaccount if none exists.
     */
    async getSubaccount(address, accountNumber) {
        const requestData = Uint8Array.from(proto_includes_1.SubaccountsModule.QueryGetSubaccountRequest.encode({
            owner: address,
            number: accountNumber,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.subaccounts.Query/Subaccount', requestData);
        return proto_includes_1.SubaccountsModule.QuerySubaccountResponse.decode(data);
    }
    /**
     * @description Get the params for the rewards module.
     *
     * @returns Params for the rewards module.
     */
    async getRewardsParams() {
        const requestData = Uint8Array.from(proto_includes_1.RewardsModule.QueryParamsRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.rewards.Query/Params', requestData);
        return proto_includes_1.RewardsModule.QueryParamsResponse.decode(data);
    }
    /**
     * @description Get all Clob Pairs.
     *
     * @returns Information on all Clob Pairs.
     */
    async getAllClobPairs() {
        const requestData = Uint8Array.from(proto_includes_1.ClobModule.QueryAllClobPairRequest.encode({ pagination: constants_1.PAGE_REQUEST }).finish());
        const data = await this.sendQuery('/dydxprotocol.clob.Query/ClobPairAll', requestData);
        return proto_includes_1.ClobModule.QueryClobPairAllResponse.decode(data);
    }
    /**
     * @description Get Clob Pair for an Id or the promise is rejected if no pair exists.
     *
     * @returns Clob Pair for a given Clob Pair Id.
     */
    async getClobPair(pairId) {
        const requestData = Uint8Array.from(proto_includes_1.ClobModule.QueryGetClobPairRequest.encode({ id: pairId }).finish());
        const data = await this.sendQuery('/dydxprotocol.clob.Query/ClobPair', requestData);
        return proto_includes_1.ClobModule.QueryClobPairResponse.decode(data);
    }
    /**
     * @description Get all Prices across markets.
     *
     * @returns Prices across all markets.
     */
    async getAllPrices() {
        const requestData = Uint8Array.from(proto_includes_1.PricesModule.QueryAllMarketPricesRequest.encode({ pagination: constants_1.PAGE_REQUEST }).finish());
        const data = await this.sendQuery('/dydxprotocol.prices.Query/AllMarketPrices', requestData);
        return proto_includes_1.PricesModule.QueryAllMarketPricesResponse.decode(data);
    }
    /**
     * @description Get Price for a clob Id or the promise is rejected if none exists.
     *
     * @returns Price for a given Market Id.
     */
    async getPrice(marketId) {
        const requestData = Uint8Array.from(proto_includes_1.PricesModule.QueryMarketPriceRequest.encode({ id: marketId }).finish());
        const data = await this.sendQuery('/dydxprotocol.prices.Query/MarketPrice', requestData);
        return proto_includes_1.PricesModule.QueryMarketPriceResponse.decode(data);
    }
    /**
     * @description Get all Perpetuals.
     *
     * @returns Information on all Perpetual pairs.
     */
    async getAllPerpetuals() {
        const requestData = Uint8Array.from(proto_includes_1.PerpetualsModule.QueryAllPerpetualsRequest.encode({ pagination: constants_1.PAGE_REQUEST }).finish());
        const data = await this.sendQuery('/dydxprotocol.perpetuals.Query/AllPerpetuals', requestData);
        return proto_includes_1.PerpetualsModule.QueryAllPerpetualsResponse.decode(data);
    }
    /**
     * @description Get Perpetual for an Id or the promise is rejected if none exists.
     *
     * @returns The Perpetual for a given Perpetual Id.
     */
    async getPerpetual(perpetualId) {
        const requestData = Uint8Array.from(proto_includes_1.PerpetualsModule.QueryPerpetualRequest.encode({ id: perpetualId }).finish());
        const data = await this.sendQuery('/dydxprotocol.perpetuals.Query/Perpetual', requestData);
        return proto_includes_1.PerpetualsModule.QueryPerpetualResponse.decode(data);
    }
    /**
     * @description Get Account for an address or the promise is rejected if the account
     * does not exist on-chain.
     *
     * @throws UnexpectedClientError if a malformed response is returned with no GRPC error.
     * @returns An account for a given address.
     */
    async getAccount(address) {
        const requestData = Uint8Array.from(AuthModule.QueryAccountRequest.encode({ address }).finish());
        const data = await this.sendQuery('/cosmos.auth.v1beta1.Query/Account', requestData);
        const rawAccount = AuthModule.QueryAccountResponse.decode(data).account;
        // The promise should have been rejected if the rawAccount was undefined.
        if (rawAccount === undefined) {
            throw new errors_1.UnexpectedClientError();
        }
        return (0, stargate_1.accountFromAny)(rawAccount);
    }
    /**
     * @description Get equity tier limit configuration.
     *
     * @returns Information on all equity tiers that are configured.
     */
    async getEquityTierLimitConfiguration() {
        const requestData = Uint8Array.from(proto_includes_1.ClobModule.QueryEquityTierLimitConfigurationRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.clob.Query/EquityTierLimitConfiguration', requestData);
        return proto_includes_1.ClobModule.QueryEquityTierLimitConfigurationResponse.decode(data);
    }
    /**
     *
     * @description Get all delegations from a delegator.
     *
     * @returns All delegations from a delegator.
     */
    async getDelegatorDelegations(delegatorAddr) {
        const requestData = Uint8Array.from(proto_includes_1.StakingModule.QueryDelegatorDelegationsRequest.encode({
            delegatorAddr,
            pagination: constants_1.PAGE_REQUEST,
        }).finish());
        const data = await this.sendQuery('/cosmos.staking.v1beta1.Query/DelegatorDelegations', requestData);
        return proto_includes_1.StakingModule.QueryDelegatorDelegationsResponse.decode(data);
    }
    /**
     *
     * @description Get all unbonding delegations from a delegator.
     *
     * @returns All unbonding delegations from a delegator.
     */
    async getDelegatorUnbondingDelegations(delegatorAddr) {
        const requestData = Uint8Array.from(proto_includes_1.StakingModule.QueryDelegatorUnbondingDelegationsRequest.encode({
            delegatorAddr,
            pagination: constants_1.PAGE_REQUEST,
        }).finish());
        const data = await this.sendQuery('/cosmos.staking.v1beta1.Query/DelegatorUnbondingDelegations', requestData);
        return proto_includes_1.StakingModule.QueryDelegatorUnbondingDelegationsResponse.decode(data);
    }
    /**
     *
     * @description Get all unbonding delegations from a delegator.
     *
     * @returns All unbonding delegations from a delegator.
     */
    async getDelegationTotalRewards(delegatorAddress) {
        const requestData = Uint8Array.from(proto_includes_1.DistributionModule.QueryDelegationTotalRewardsRequest.encode({
            delegatorAddress,
        }).finish());
        const data = await this.sendQuery('/cosmos.distribution.v1beta1.Query/DelegationTotalRewards', requestData);
        return proto_includes_1.DistributionModule.QueryDelegationTotalRewardsResponse.decode(data);
    }
    /**
     * @description Get all delayed complete bridge messages, optionally filtered by address.
     *
     * @returns Information on all delayed complete bridge messages.
     */
    async getDelayedCompleteBridgeMessages(address = '') {
        const requestData = Uint8Array.from(proto_includes_1.BridgeModule.QueryDelayedCompleteBridgeMessagesRequest.encode({ address }).finish());
        const data = await this.sendQuery('/dydxprotocol.bridge.Query/DelayedCompleteBridgeMessages', requestData);
        return proto_includes_1.BridgeModule.QueryDelayedCompleteBridgeMessagesResponse.decode(data);
    }
    /**
     * @description Get all validators of a status.
     *
     * @returns all validators of a status.
     */
    async getAllValidators(status = '') {
        const requestData = Uint8Array.from(proto_includes_1.StakingModule.QueryValidatorsRequest.encode({
            status,
            pagination: constants_1.PAGE_REQUEST,
        }).finish());
        const data = await this.sendQuery('/cosmos.staking.v1beta1.Query/Validators', requestData);
        return proto_includes_1.StakingModule.QueryValidatorsResponse.decode(data);
    }
    /**
     * @description Get all gov proposals.
     *
     * @param proposalStatus Status of the proposal to filter by.
     * @param voter Voter to filter by.
     * @param depositor Depositor to filter by.
     *
     * @returns All gov proposals that match the filters above.
     */
    async getAllGovProposals(proposalStatus = proto_includes_1.ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, voter = '', depositor = '') {
        const requestData = Uint8Array.from(proto_includes_1.GovV1Module.QueryProposalsRequest.encode({
            proposalStatus,
            voter,
            depositor,
            pagination: constants_1.PAGE_REQUEST,
        }).finish());
        const data = await this.sendQuery('/cosmos.gov.v1.Query/Proposals', requestData);
        return proto_includes_1.GovV1Module.QueryProposalsResponse.decode(data);
    }
    async getWithdrawalAndTransferGatingStatus(perpetualId) {
        const requestData = Uint8Array.from(proto_includes_1.SubaccountsModule.QueryGetWithdrawalAndTransfersBlockedInfoRequest.encode({
            perpetualId,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.subaccounts.Query/GetWithdrawalAndTransfersBlockedInfo', requestData);
        return proto_includes_1.SubaccountsModule.QueryGetWithdrawalAndTransfersBlockedInfoResponse.decode(data);
    }
    async getWithdrawalCapacityByDenom(denom) {
        const requestData = Uint8Array.from(proto_includes_1.RateLimitModule.QueryCapacityByDenomRequest.encode({
            denom,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.ratelimit.Query/CapacityByDenom', requestData);
        return proto_includes_1.RateLimitModule.QueryCapacityByDenomResponse.decode(data);
    }
    async getMegavaultOwnerShares(address) {
        const requestData = Uint8Array.from(proto_includes_1.VaultModule.QueryMegavaultOwnerSharesRequest.encode({
            address,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.vault.Query/MegavaultOwnerShares', requestData);
        return proto_includes_1.VaultModule.QueryMegavaultOwnerSharesResponse.decode(data);
    }
    async getMegavaultWithdrawalInfo(sharesToWithdraw) {
        const requestData = Uint8Array.from(proto_includes_1.VaultModule.QueryMegavaultWithdrawalInfoRequest.encode({
            sharesToWithdraw: {
                numShares: (0, helpers_1.bigIntToBytes)(sharesToWithdraw),
            },
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.vault.Query/MegavaultWithdrawalInfo', requestData);
        return proto_includes_1.VaultModule.QueryMegavaultWithdrawalInfoResponse.decode(data);
    }
    async getAffiliateInfo(address) {
        const requestData = Uint8Array.from(proto_includes_1.AffiliateModule.AffiliateInfoRequest.encode({
            address,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.affiliates.Query/AffiliateInfo', requestData);
        return proto_includes_1.AffiliateModule.AffiliateInfoResponse.decode(data);
    }
    async getReferredBy(address) {
        const requestData = Uint8Array.from(proto_includes_1.AffiliateModule.ReferredByRequest.encode({
            address,
        }).finish());
        const data = await this.sendQuery('/dydxprotocol.affiliates.Query/ReferredBy', requestData);
        return proto_includes_1.AffiliateModule.ReferredByResponse.decode(data);
    }
    async getAllAffiliateTiers() {
        const requestData = Uint8Array.from(proto_includes_1.AffiliateModule.AllAffiliateTiersRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.affiliates.Query/AllAffiliateTiers', requestData);
        return proto_includes_1.AffiliateModule.AllAffiliateTiersResponse.decode(data);
    }
    async getAffiliateWhitelist() {
        const requestData = Uint8Array.from(proto_includes_1.AffiliateModule.AffiliateWhitelistRequest.encode({}).finish());
        const data = await this.sendQuery('/dydxprotocol.affiliates.Query/AffiliateWhitelist', requestData);
        return proto_includes_1.AffiliateModule.AffiliateWhitelistResponse.decode(data);
    }
    async sendQuery(requestUrl, requestData) {
        // eslint-disable-next-line max-len
        const resp = await this.stargateQueryClient.queryAbci(requestUrl, requestData);
        return resp.value;
    }
}
exports.Get = Get;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudHMvbW9kdWxlcy9nZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSwrQ0FPMEI7QUFDMUIsbUZBQXFFO0FBQ3JFLG1GQUFxRTtBQUVyRSxnREFBd0I7QUFDeEIsNERBQWtDO0FBRWxDLCtDQUFrRDtBQUNsRCw0Q0FBNEM7QUFDNUMsMENBQXNEO0FBQ3RELHFEQWdCMEI7QUFHMUIsb0VBQW9FO0FBQ3BFLDZFQUE2RTtBQUM3RSxtRkFBbUY7QUFDbkYsa0VBQWtFO0FBQ2xFLG9CQUFRLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxjQUFJLENBQUM7QUFDMUIsb0JBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUVyQixNQUFhLEdBQUc7SUFJZCxZQUNFLGdCQUFrQyxFQUNsQyxtQkFBc0Q7UUFFdEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxXQUFXO1FBQ2YsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsaUJBQWlCO1FBQ3JCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDN0IsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsV0FBVztRQUNmLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQ2pDLDhCQUFhLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNqRSxDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyxpREFBaUQsRUFDakQsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDhCQUFhLENBQUMsK0JBQStCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFlO1FBQ2xDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQ2pDLDhCQUFhLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ3pFLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLDBDQUEwQyxFQUMxQyxXQUFXLENBQ1osQ0FBQztRQUNGLE9BQU8sOEJBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUNoQixPQUFlO1FBRWYsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDakMsNEJBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDckUsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0MscUNBQXFDLEVBQ3JDLFdBQVcsQ0FDWixDQUFDO1FBQ0YsT0FBTyw0QkFBVyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsa0JBQWtCLENBQUMsT0FBZTtRQUN0QyxNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxVQUFVLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDaEUsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0Msd0NBQXdDLEVBQ3hDLFdBQVcsQ0FDWixDQUFDO1FBQ0YsT0FBTyxVQUFVLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxPQUFlLEVBQUUsS0FBYTtRQUNwRCxNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxVQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDO1lBQ3BDLE9BQU87WUFDUCxLQUFLO1NBQ04sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNaLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLG9DQUFvQyxFQUNwQyxXQUFXLENBQ1osQ0FBQztRQUNGLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2xFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsY0FBYztRQUNsQixNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxrQ0FBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ2hFLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLCtDQUErQyxFQUMvQyxXQUFXLENBQ1osQ0FBQztRQUNGLE9BQU8sa0NBQWlCLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGFBQWEsQ0FDakIsT0FBZSxFQUNmLGFBQXFCO1FBRXJCLE1BQU0sV0FBVyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQzdDLGtDQUFpQixDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQztZQUNqRCxLQUFLLEVBQUUsT0FBTztZQUNkLE1BQU0sRUFBRSxhQUFhO1NBQ3RCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyw0Q0FBNEMsRUFDNUMsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLGtDQUFpQixDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxnQkFBZ0I7UUFDcEIsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyw4QkFBYSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTFGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0Msb0NBQW9DLEVBQ3BDLFdBQVcsQ0FDWixDQUFDO1FBQ0YsT0FBTyw4QkFBYSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxlQUFlO1FBQ25CLE1BQU0sV0FBVyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQzdDLDJCQUFVLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUFFLHdCQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNqRixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyxzQ0FBc0MsRUFDdEMsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDJCQUFVLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFjO1FBQzlCLE1BQU0sV0FBVyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQzdDLDJCQUFVLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ25FLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsbUNBQW1DLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDaEcsT0FBTywyQkFBVSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxZQUFZO1FBQ2hCLE1BQU0sV0FBVyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQzdDLDZCQUFZLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLEVBQUUsVUFBVSxFQUFFLHdCQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUN2RixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyw0Q0FBNEMsRUFDNUMsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDZCQUFZLENBQUMsNEJBQTRCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFnQjtRQUM3QixNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3Qyw2QkFBWSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUN2RSxDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyx3Q0FBd0MsRUFDeEMsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDZCQUFZLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLGdCQUFnQjtRQUNwQixNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxpQ0FBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLEVBQUUsd0JBQVksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ3pGLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLDhDQUE4QyxFQUM5QyxXQUFXLENBQ1osQ0FBQztRQUNGLE9BQU8saUNBQWdCLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBQyxXQUFtQjtRQUNwQyxNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxpQ0FBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDNUUsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0MsMENBQTBDLEVBQzFDLFdBQVcsQ0FDWixDQUFDO1FBQ0YsT0FBTyxpQ0FBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBZTtRQUM5QixNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3QyxVQUFVLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDNUQsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0Msb0NBQW9DLEVBQ3BDLFdBQVcsQ0FDWixDQUFDO1FBQ0YsTUFBTSxVQUFVLEdBQW9CLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDO1FBRXpGLHlFQUF5RTtRQUN6RSxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7WUFDNUIsTUFBTSxJQUFJLDhCQUFxQixFQUFFLENBQUM7U0FDbkM7UUFDRCxPQUFPLElBQUEseUJBQWMsRUFBQyxVQUFVLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQywrQkFBK0I7UUFDbkMsTUFBTSxXQUFXLEdBQWUsVUFBVSxDQUFDLElBQUksQ0FDN0MsMkJBQVUsQ0FBQyx3Q0FBd0MsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ3hFLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLHVEQUF1RCxFQUN2RCxXQUFXLENBQ1osQ0FBQztRQUNGLE9BQU8sMkJBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLHVCQUF1QixDQUMzQixhQUFxQjtRQUVyQixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyw4QkFBYSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQztZQUNwRCxhQUFhO1lBQ2IsVUFBVSxFQUFFLHdCQUFZO1NBQ3pCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQyxvREFBb0QsRUFDcEQsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDhCQUFhLENBQUMsaUNBQWlDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxnQ0FBZ0MsQ0FDcEMsYUFBcUI7UUFFckIsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDakMsOEJBQWEsQ0FBQyx5Q0FBeUMsQ0FBQyxNQUFNLENBQUM7WUFDN0QsYUFBYTtZQUNiLFVBQVUsRUFBRSx3QkFBWTtTQUN6QixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ1osQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0MsNkRBQTZELEVBQzdELFdBQVcsQ0FDWixDQUFDO1FBQ0YsT0FBTyw4QkFBYSxDQUFDLDBDQUEwQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMseUJBQXlCLENBQzdCLGdCQUF3QjtRQUV4QixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxtQ0FBa0IsQ0FBQyxrQ0FBa0MsQ0FBQyxNQUFNLENBQUM7WUFDM0QsZ0JBQWdCO1NBQ2pCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQywyREFBMkQsRUFDM0QsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLG1DQUFrQixDQUFDLG1DQUFtQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxnQ0FBZ0MsQ0FDcEMsVUFBa0IsRUFBRTtRQUVwQixNQUFNLFdBQVcsR0FBZSxVQUFVLENBQUMsSUFBSSxDQUM3Qyw2QkFBWSxDQUFDLHlDQUF5QyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQ3BGLENBQUM7UUFFRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQzNDLDBEQUEwRCxFQUMxRCxXQUFXLENBQ1osQ0FBQztRQUNGLE9BQU8sNkJBQVksQ0FBQywwQ0FBMEMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRTtRQUN4QyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyw4QkFBYSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQztZQUMxQyxNQUFNO1lBQ04sVUFBVSxFQUFFLHdCQUFZO1NBQ3pCLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQWUsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMzQywwQ0FBMEMsRUFDMUMsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLDhCQUFhLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUNILEtBQUssQ0FBQyxrQkFBa0IsQ0FDdEIsaUJBQWlDLCtCQUFjLENBQUMsNkJBQTZCLEVBQzdFLFFBQWdCLEVBQUUsRUFDbEIsWUFBb0IsRUFBRTtRQUV0QixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyw0QkFBVyxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztZQUN2QyxjQUFjO1lBQ2QsS0FBSztZQUNMLFNBQVM7WUFDVCxVQUFVLEVBQUUsd0JBQVk7U0FDekIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNaLENBQUM7UUFDRixNQUFNLElBQUksR0FBZSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDN0YsT0FBTyw0QkFBVyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsS0FBSyxDQUFDLG9DQUFvQyxDQUN4QyxXQUFtQjtRQUVuQixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxrQ0FBaUIsQ0FBQyxnREFBZ0QsQ0FBQyxNQUFNLENBQUM7WUFDeEUsV0FBVztTQUNaLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUMvQixzRUFBc0UsRUFDdEUsV0FBVyxDQUNaLENBQUM7UUFFRixPQUFPLGtDQUFpQixDQUFDLGlEQUFpRCxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBRUQsS0FBSyxDQUFDLDRCQUE0QixDQUNoQyxLQUFhO1FBRWIsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDakMsZ0NBQWUsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUM7WUFDakQsS0FBSztTQUNOLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLCtDQUErQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sZ0NBQWUsQ0FBQyw0QkFBNEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVELEtBQUssQ0FBQyx1QkFBdUIsQ0FDM0IsT0FBZTtRQUVmLE1BQU0sV0FBVyxHQUFlLFVBQVUsQ0FBQyxJQUFJLENBQzdDLDRCQUFXLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDO1lBQ2xELE9BQU87U0FDUixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ1osQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0MsZ0RBQWdELEVBQ2hELFdBQVcsQ0FDWixDQUFDO1FBRUYsT0FBTyw0QkFBVyxDQUFDLGlDQUFpQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRUQsS0FBSyxDQUFDLDBCQUEwQixDQUM5QixnQkFBd0I7UUFFeEIsTUFBTSxXQUFXLEdBQWUsVUFBVSxDQUFDLElBQUksQ0FDN0MsNEJBQVcsQ0FBQyxtQ0FBbUMsQ0FBQyxNQUFNLENBQUM7WUFDckQsZ0JBQWdCLEVBQUU7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFBLHVCQUFhLEVBQUMsZ0JBQWdCLENBQUM7YUFDM0M7U0FDRixDQUFDLENBQUMsTUFBTSxFQUFFLENBQ1osQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFlLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDM0MsbURBQW1ELEVBQ25ELFdBQVcsQ0FDWixDQUFDO1FBRUYsT0FBTyw0QkFBVyxDQUFDLG9DQUFvQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLE9BQWU7UUFDcEMsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FDakMsZ0NBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUM7WUFDMUMsT0FBTztTQUNSLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDWixDQUFDO1FBRUYsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRS9GLE9BQU8sZ0NBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBZTtRQUNqQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxnQ0FBZSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQztZQUN2QyxPQUFPO1NBQ1IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUNaLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsMkNBQTJDLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFNUYsT0FBTyxnQ0FBZSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsS0FBSyxDQUFDLG9CQUFvQjtRQUN4QixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxnQ0FBZSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDN0QsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDL0Isa0RBQWtELEVBQ2xELFdBQVcsQ0FDWixDQUFDO1FBRUYsT0FBTyxnQ0FBZSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsS0FBSyxDQUFDLHFCQUFxQjtRQUN6QixNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUNqQyxnQ0FBZSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FDOUQsQ0FBQztRQUVGLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FDL0IsbURBQW1ELEVBQ25ELFdBQVcsQ0FDWixDQUFDO1FBRUYsT0FBTyxnQ0FBZSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFrQixFQUFFLFdBQXVCO1FBQ2pFLG1DQUFtQztRQUNuQyxNQUFNLElBQUksR0FBc0IsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUN0RSxVQUFVLEVBQ1YsV0FBVyxDQUNaLENBQUM7UUFDRixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBaGtCRCxrQkFna0JDIn0=