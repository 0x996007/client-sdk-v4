"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
const rest_1 = __importDefault(require("./rest"));
/**
 * @description REST endpoints for data related to a particular address.
 */
class AccountClient extends rest_1.default {
    // ------ Subaccount ------ //
    async getSubaccounts(address, limit) {
        const uri = `/v4/addresses/${address}`;
        return this.get(uri, { limit });
    }
    async getSubaccount(address, subaccountNumber) {
        const uri = `/v4/addresses/${address}/subaccountNumber/${subaccountNumber}`;
        return this.get(uri);
    }
    async getParentSubaccount(address, parentSubaccountNumber) {
        const uri = `/v4/addresses/${address}/subaccountNumber/${parentSubaccountNumber}`;
        return this.get(uri);
    }
    // ------ Positions ------ //
    async getSubaccountPerpetualPositions(address, subaccountNumber, status, limit, createdBeforeOrAtHeight, createdBeforeOrAt) {
        const uri = '/v4/perpetualPositions';
        return this.get(uri, {
            address,
            subaccountNumber,
            status,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
        });
    }
    async getSubaccountAssetPositions(address, subaccountNumber, status, limit, createdBeforeOrAtHeight, createdBeforeOrAt) {
        const uri = '/v4/assetPositions';
        return this.get(uri, {
            address,
            subaccountNumber,
            status,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
        });
    }
    // ------ Transfers ------ //
    async getTransfersBetween(sourceAddress, sourceSubaccountNumber, recipientAddress, recipientSubaccountNumber, createdBeforeOrAtHeight, createdBeforeOrAt) {
        const uri = '/v4/transfers/between';
        return this.get(uri, {
            sourceAddress,
            sourceSubaccountNumber,
            recipientAddress,
            recipientSubaccountNumber,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
        });
    }
    async getSubaccountTransfers(address, subaccountNumber, limit, createdBeforeOrAtHeight, createdBeforeOrAt, page) {
        const uri = '/v4/transfers';
        return this.get(uri, {
            address,
            subaccountNumber,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            page,
        });
    }
    async getParentSubaccountNumberTransfers(address, parentSubaccountNumber, limit, createdBeforeOrAtHeight, createdBeforeOrAt, page) {
        const uri = '/v4/transfers/parentSubaccountNumber';
        return this.get(uri, {
            address,
            parentSubaccountNumber,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            page,
        });
    }
    // ------ Orders ------ //
    async getSubaccountOrders(address, subaccountNumber, ticker, tickerType = constants_1.TickerType.PERPETUAL, side, status, type, limit, goodTilBlockBeforeOrAt, goodTilBlockTimeBeforeOrAt, returnLatestOrders) {
        const uri = '/v4/orders';
        return this.get(uri, {
            address,
            subaccountNumber,
            ticker,
            tickerType,
            side,
            status,
            type,
            limit,
            goodTilBlockBeforeOrAt,
            goodTilBlockTimeBeforeOrAt,
            returnLatestOrders,
        });
    }
    async getParentSubaccountNumberOrders(address, parentSubaccountNumber, ticker, side, status, type, limit, goodTilBlockBeforeOrAt, goodTilBlockTimeBeforeOrAt, returnLatestOrders) {
        const uri = '/v4/orders/parentSubaccountNumber';
        return this.get(uri, {
            address,
            parentSubaccountNumber,
            ticker,
            side,
            status,
            type,
            limit,
            goodTilBlockBeforeOrAt,
            goodTilBlockTimeBeforeOrAt,
            returnLatestOrders,
        });
    }
    async getOrder(orderId) {
        const uri = `/v4/orders/${orderId}`;
        return this.get(uri);
    }
    // ------ Fills ------ //
    async getSubaccountFills(address, subaccountNumber, ticker, tickerType = constants_1.TickerType.PERPETUAL, limit, createdBeforeOrAtHeight, createdBeforeOrAt, page) {
        const uri = '/v4/fills';
        return this.get(uri, {
            address,
            subaccountNumber,
            ticker,
            tickerType,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            page,
        });
    }
    async getParentSubaccountNumberFills(address, parentSubaccountNumber, ticker, tickerType = constants_1.TickerType.PERPETUAL, limit, createdBeforeOrAtHeight, createdBeforeOrAt, page) {
        const uri = '/v4/fills/parentSubaccountNumber';
        return this.get(uri, {
            address,
            parentSubaccountNumber,
            ticker,
            tickerType,
            limit,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            page,
        });
    }
    // ------ Pnl ------ //
    async getSubaccountHistoricalPNLs(address, subaccountNumber, createdBeforeOrAtHeight, createdBeforeOrAt, createdOnOrAfterHeight, createdOnOrAfter, limit, page) {
        const uri = '/v4/historical-pnl';
        return this.get(uri, {
            address,
            subaccountNumber,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            createdOnOrAfterHeight,
            createdOnOrAfter,
            limit,
            page,
        });
    }
    async getParentSubaccountNumberHistoricalPNLs(address, parentSubaccountNumber, createdBeforeOrAtHeight, createdBeforeOrAt, createdOnOrAfterHeight, createdOnOrAfter, limit, page) {
        const uri = '/v4//historical-pnl/parentSubaccount';
        return this.get(uri, {
            address,
            parentSubaccountNumber,
            createdBeforeOrAtHeight,
            createdBeforeOrAt,
            createdOnOrAfterHeight,
            createdOnOrAfter,
            limit,
            page,
        });
    }
    // ------ Rewards ------ //
    async getHistoricalTradingRewardsAggregations(address, period, limit, startingBeforeOrAt, startingBeforeOrAtHeight) {
        const uri = `/v4/historicalTradingRewardAggregations/${address}`;
        return this.get(uri, { period, limit, startingBeforeOrAt, startingBeforeOrAtHeight });
    }
    async getHistoricalBlockTradingRewards(address, limit, startingBeforeOrAt, startingBeforeOrAtHeight) {
        const uri = `/v4/historicalBlockTradingRewards/${address}`;
        return this.get(uri, { limit, startingBeforeOrAt, startingBeforeOrAtHeight });
    }
}
exports.default = AccountClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRzL21vZHVsZXMvYWNjb3VudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQU9zQjtBQUV0QixrREFBZ0M7QUFFaEM7O0dBRUc7QUFDSCxNQUFxQixhQUFjLFNBQVEsY0FBVTtJQUNuRCw4QkFBOEI7SUFFOUIsS0FBSyxDQUFDLGNBQWMsQ0FBQyxPQUFlLEVBQUUsS0FBYztRQUNsRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsT0FBTyxFQUFFLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELEtBQUssQ0FBQyxhQUFhLENBQUMsT0FBZSxFQUFFLGdCQUF3QjtRQUMzRCxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsT0FBTyxxQkFBcUIsZ0JBQWdCLEVBQUUsQ0FBQztRQUM1RSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxPQUFlLEVBQUUsc0JBQThCO1FBQ3ZFLE1BQU0sR0FBRyxHQUFHLGlCQUFpQixPQUFPLHFCQUFxQixzQkFBc0IsRUFBRSxDQUFDO1FBQ2xGLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsNkJBQTZCO0lBRTdCLEtBQUssQ0FBQywrQkFBK0IsQ0FDbkMsT0FBZSxFQUNmLGdCQUF3QixFQUN4QixNQUE4QixFQUM5QixLQUFxQixFQUNyQix1QkFBdUMsRUFDdkMsaUJBQWlDO1FBRWpDLE1BQU0sR0FBRyxHQUFHLHdCQUF3QixDQUFDO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixNQUFNO1lBQ04sS0FBSztZQUNMLHVCQUF1QjtZQUN2QixpQkFBaUI7U0FDbEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQywyQkFBMkIsQ0FDL0IsT0FBZSxFQUNmLGdCQUF3QixFQUN4QixNQUE4QixFQUM5QixLQUFxQixFQUNyQix1QkFBdUMsRUFDdkMsaUJBQWlDO1FBRWpDLE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixNQUFNO1lBQ04sS0FBSztZQUNMLHVCQUF1QjtZQUN2QixpQkFBaUI7U0FDbEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDZCQUE2QjtJQUU3QixLQUFLLENBQUMsbUJBQW1CLENBQ3ZCLGFBQXFCLEVBQ3JCLHNCQUE4QixFQUM5QixnQkFBd0IsRUFDeEIseUJBQWlDLEVBQ2pDLHVCQUF1QyxFQUN2QyxpQkFBaUM7UUFFakMsTUFBTSxHQUFHLEdBQUcsdUJBQXVCLENBQUM7UUFDcEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNuQixhQUFhO1lBQ2Isc0JBQXNCO1lBQ3RCLGdCQUFnQjtZQUNoQix5QkFBeUI7WUFDekIsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtTQUNsQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLHNCQUFzQixDQUMxQixPQUFlLEVBQ2YsZ0JBQXdCLEVBQ3hCLEtBQXFCLEVBQ3JCLHVCQUF1QyxFQUN2QyxpQkFBaUMsRUFDakMsSUFBb0I7UUFFcEIsTUFBTSxHQUFHLEdBQUcsZUFBZSxDQUFDO1FBQzVCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsT0FBTztZQUNQLGdCQUFnQjtZQUNoQixLQUFLO1lBQ0wsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUNqQixJQUFJO1NBQ0wsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxrQ0FBa0MsQ0FDdEMsT0FBZSxFQUNmLHNCQUE4QixFQUM5QixLQUFxQixFQUNyQix1QkFBdUMsRUFDdkMsaUJBQWlDLEVBQ2pDLElBQW9CO1FBRXBCLE1BQU0sR0FBRyxHQUFHLHNDQUFzQyxDQUFDO1FBQ25ELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsT0FBTztZQUNQLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUNqQixJQUFJO1NBQ0wsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDBCQUEwQjtJQUUxQixLQUFLLENBQUMsbUJBQW1CLENBQ3ZCLE9BQWUsRUFDZixnQkFBd0IsRUFDeEIsTUFBc0IsRUFDdEIsYUFBeUIsc0JBQVUsQ0FBQyxTQUFTLEVBQzdDLElBQXVCLEVBQ3ZCLE1BQTJCLEVBQzNCLElBQXVCLEVBQ3ZCLEtBQXFCLEVBQ3JCLHNCQUFzQyxFQUN0QywwQkFBMEMsRUFDMUMsa0JBQW1DO1FBRW5DLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQztRQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87WUFDUCxnQkFBZ0I7WUFDaEIsTUFBTTtZQUNOLFVBQVU7WUFDVixJQUFJO1lBQ0osTUFBTTtZQUNOLElBQUk7WUFDSixLQUFLO1lBQ0wsc0JBQXNCO1lBQ3RCLDBCQUEwQjtZQUMxQixrQkFBa0I7U0FDbkIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQywrQkFBK0IsQ0FDbkMsT0FBZSxFQUNmLHNCQUE4QixFQUM5QixNQUFzQixFQUN0QixJQUF1QixFQUN2QixNQUEyQixFQUMzQixJQUF1QixFQUN2QixLQUFxQixFQUNyQixzQkFBc0MsRUFDdEMsMEJBQTBDLEVBQzFDLGtCQUFtQztRQUVuQyxNQUFNLEdBQUcsR0FBRyxtQ0FBbUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87WUFDUCxzQkFBc0I7WUFDdEIsTUFBTTtZQUNOLElBQUk7WUFDSixNQUFNO1lBQ04sSUFBSTtZQUNKLEtBQUs7WUFDTCxzQkFBc0I7WUFDdEIsMEJBQTBCO1lBQzFCLGtCQUFrQjtTQUNuQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFlO1FBQzVCLE1BQU0sR0FBRyxHQUFHLGNBQWMsT0FBTyxFQUFFLENBQUM7UUFDcEMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCx5QkFBeUI7SUFFekIsS0FBSyxDQUFDLGtCQUFrQixDQUN0QixPQUFlLEVBQ2YsZ0JBQXdCLEVBQ3hCLE1BQXNCLEVBQ3RCLGFBQXlCLHNCQUFVLENBQUMsU0FBUyxFQUM3QyxLQUFxQixFQUNyQix1QkFBdUMsRUFDdkMsaUJBQWlDLEVBQ2pDLElBQW9CO1FBRXBCLE1BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87WUFDUCxnQkFBZ0I7WUFDaEIsTUFBTTtZQUNOLFVBQVU7WUFDVixLQUFLO1lBQ0wsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUNqQixJQUFJO1NBQ0wsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyw4QkFBOEIsQ0FDbEMsT0FBZSxFQUNmLHNCQUE4QixFQUM5QixNQUFzQixFQUN0QixhQUF5QixzQkFBVSxDQUFDLFNBQVMsRUFDN0MsS0FBcUIsRUFDckIsdUJBQXVDLEVBQ3ZDLGlCQUFpQyxFQUNqQyxJQUFvQjtRQUVwQixNQUFNLEdBQUcsR0FBRyxrQ0FBa0MsQ0FBQztRQUMvQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87WUFDUCxzQkFBc0I7WUFDdEIsTUFBTTtZQUNOLFVBQVU7WUFDVixLQUFLO1lBQ0wsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUNqQixJQUFJO1NBQ0wsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHVCQUF1QjtJQUV2QixLQUFLLENBQUMsMkJBQTJCLENBQy9CLE9BQWUsRUFDZixnQkFBd0IsRUFDeEIsdUJBQXVDLEVBQ3ZDLGlCQUFpQyxFQUNqQyxzQkFBc0MsRUFDdEMsZ0JBQWdDLEVBQ2hDLEtBQXFCLEVBQ3JCLElBQW9CO1FBRXBCLE1BQU0sR0FBRyxHQUFHLG9CQUFvQixDQUFDO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDbkIsT0FBTztZQUNQLGdCQUFnQjtZQUNoQix1QkFBdUI7WUFDdkIsaUJBQWlCO1lBQ2pCLHNCQUFzQjtZQUN0QixnQkFBZ0I7WUFDaEIsS0FBSztZQUNMLElBQUk7U0FDTCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLHVDQUF1QyxDQUMzQyxPQUFlLEVBQ2Ysc0JBQThCLEVBQzlCLHVCQUF1QyxFQUN2QyxpQkFBaUMsRUFDakMsc0JBQXNDLEVBQ3RDLGdCQUFnQyxFQUNoQyxLQUFxQixFQUNyQixJQUFvQjtRQUVwQixNQUFNLEdBQUcsR0FBRyxzQ0FBc0MsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ25CLE9BQU87WUFDUCxzQkFBc0I7WUFDdEIsdUJBQXVCO1lBQ3ZCLGlCQUFpQjtZQUNqQixzQkFBc0I7WUFDdEIsZ0JBQWdCO1lBQ2hCLEtBQUs7WUFDTCxJQUFJO1NBQ0wsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDJCQUEyQjtJQUUzQixLQUFLLENBQUMsdUNBQXVDLENBQzNDLE9BQWUsRUFDZixNQUFzQyxFQUN0QyxLQUFjLEVBQ2Qsa0JBQTJCLEVBQzNCLHdCQUFpQztRQUVqQyxNQUFNLEdBQUcsR0FBRywyQ0FBMkMsT0FBTyxFQUFFLENBQUM7UUFDakUsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRCxLQUFLLENBQUMsZ0NBQWdDLENBQ3BDLE9BQWUsRUFDZixLQUFjLEVBQ2Qsa0JBQTJCLEVBQzNCLHdCQUFpQztRQUVqQyxNQUFNLEdBQUcsR0FBRyxxQ0FBcUMsT0FBTyxFQUFFLENBQUM7UUFDM0QsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSx3QkFBd0IsRUFBRSxDQUFDLENBQUM7SUFDaEYsQ0FBQztDQUNGO0FBMVNELGdDQTBTQyJ9