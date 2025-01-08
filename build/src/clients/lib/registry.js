"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRegistry = exports.registry = void 0;
const proto_signing_1 = require("@cosmjs/proto-signing");
const stargate_1 = require("@cosmjs/stargate");
const tx_1 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/affiliates/tx");
const tx_2 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/clob/tx");
const tx_3 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/delaymsg/tx");
const tx_4 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/listing/tx");
const tx_5 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/perpetuals/tx");
const tx_6 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/prices/tx");
const transfer_1 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/transfer");
const tx_7 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/sending/tx");
const tx_8 = require("@dydxprotocol/v4-proto/src/codegen/dydxprotocol/vault/tx");
const constants_1 = require("../constants");
exports.registry = [];
function generateRegistry() {
    return new proto_signing_1.Registry([
        // clob
        [constants_1.TYPE_URL_MSG_PLACE_ORDER, tx_2.MsgPlaceOrder],
        [constants_1.TYPE_URL_MSG_CANCEL_ORDER, tx_2.MsgCancelOrder],
        [constants_1.TYPE_URL_BATCH_CANCEL, tx_2.MsgBatchCancel],
        [constants_1.TYPE_URL_MSG_CREATE_CLOB_PAIR, tx_2.MsgCreateClobPair],
        [constants_1.TYPE_URL_MSG_UPDATE_CLOB_PAIR, tx_2.MsgUpdateClobPair],
        // delaymsg
        [constants_1.TYPE_URL_MSG_DELAY_MESSAGE, tx_3.MsgDelayMessage],
        // listing
        [constants_1.TYPE_URL_MSG_CREATE_MARKET_PERMISSIONLESS, tx_4.MsgCreateMarketPermissionless],
        // perpetuals
        [constants_1.TYPE_URL_MSG_CREATE_PERPETUAL, tx_5.MsgCreatePerpetual],
        // prices
        [constants_1.TYPE_URL_MSG_CREATE_ORACLE_MARKET, tx_6.MsgCreateOracleMarket],
        // vaults
        [constants_1.TYPE_URL_MSG_DEPOSIT_TO_MEGAVAULT, tx_8.MsgDepositToMegavault],
        [constants_1.TYPE_URL_MSG_WITHDRAW_FROM_MEGAVAULT, tx_8.MsgWithdrawFromMegavault],
        // sending
        [constants_1.TYPE_URL_MSG_CREATE_TRANSFER, tx_7.MsgCreateTransfer],
        [constants_1.TYPE_URL_MSG_WITHDRAW_FROM_SUBACCOUNT, transfer_1.MsgWithdrawFromSubaccount],
        [constants_1.TYPE_URL_MSG_DEPOSIT_TO_SUBACCOUNT, transfer_1.MsgDepositToSubaccount],
        // affiliates
        [constants_1.TYPE_URL_MSG_REGISTER_AFFILIATE, tx_1.MsgRegisterAffiliate],
        // default types
        ...stargate_1.defaultRegistryTypes,
    ]);
}
exports.generateRegistry = generateRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2xpZW50cy9saWIvcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseURBQWdFO0FBQ2hFLCtDQUF3RDtBQUN4RCxzRkFBcUc7QUFDckcsZ0ZBTWlFO0FBQ2pFLG9GQUE4RjtBQUM5RixtRkFBMkc7QUFDM0csc0ZBQW1HO0FBQ25HLGtGQUFrRztBQUNsRywrRkFHMEU7QUFDMUUsbUZBQStGO0FBQy9GLGlGQUdrRTtBQUVsRSw0Q0FnQnNCO0FBRVQsUUFBQSxRQUFRLEdBQTJDLEVBQUUsQ0FBQztBQUNuRSxTQUFnQixnQkFBZ0I7SUFDOUIsT0FBTyxJQUFJLHdCQUFRLENBQUM7UUFDbEIsT0FBTztRQUNQLENBQUMsb0NBQXdCLEVBQUUsa0JBQThCLENBQUM7UUFDMUQsQ0FBQyxxQ0FBeUIsRUFBRSxtQkFBK0IsQ0FBQztRQUM1RCxDQUFDLGlDQUFxQixFQUFFLG1CQUErQixDQUFDO1FBQ3hELENBQUMseUNBQTZCLEVBQUUsc0JBQWtDLENBQUM7UUFDbkUsQ0FBQyx5Q0FBNkIsRUFBRSxzQkFBa0MsQ0FBQztRQUVuRSxXQUFXO1FBQ1gsQ0FBQyxzQ0FBMEIsRUFBRSxvQkFBZ0MsQ0FBQztRQUU5RCxVQUFVO1FBQ1YsQ0FBQyxxREFBeUMsRUFBRSxrQ0FBOEMsQ0FBQztRQUUzRixhQUFhO1FBQ2IsQ0FBQyx5Q0FBNkIsRUFBRSx1QkFBbUMsQ0FBQztRQUVwRSxTQUFTO1FBQ1QsQ0FBQyw2Q0FBaUMsRUFBRSwwQkFBc0MsQ0FBQztRQUUzRSxTQUFTO1FBQ1QsQ0FBQyw2Q0FBaUMsRUFBRSwwQkFBc0MsQ0FBQztRQUMzRSxDQUFDLGdEQUFvQyxFQUFFLDZCQUF5QyxDQUFDO1FBRWpGLFVBQVU7UUFDVixDQUFDLHdDQUE0QixFQUFFLHNCQUFrQyxDQUFDO1FBQ2xFLENBQUMsaURBQXFDLEVBQUUsb0NBQTBDLENBQUM7UUFDbkYsQ0FBQyw4Q0FBa0MsRUFBRSxpQ0FBdUMsQ0FBQztRQUU3RSxhQUFhO1FBQ2IsQ0FBQywyQ0FBK0IsRUFBRSx5QkFBcUMsQ0FBQztRQUV4RSxnQkFBZ0I7UUFDaEIsR0FBRywrQkFBb0I7S0FDeEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQXBDRCw0Q0FvQ0MifQ==