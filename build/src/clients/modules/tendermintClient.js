"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TendermintClient = void 0;
const encoding_1 = require("@cosmjs/encoding");
const math_1 = require("@cosmjs/math");
const stargate_1 = require("@cosmjs/stargate");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const utils_1 = require("@cosmjs/utils");
const errors_1 = require("../lib/errors");
class TendermintClient {
    constructor(baseClient, broadcastOptions) {
        this.baseClient = baseClient;
        this.broadcastOptions = broadcastOptions;
    }
    /**
     * @description Get a specific block if height is specified. Otherwise, get the most recent block.
     *
     * @returns Information about the block queried.
     */
    async getBlock(height) {
        const response = await this.baseClient.block(height);
        return {
            id: (0, encoding_1.toHex)(response.blockId.hash).toUpperCase(),
            header: {
                version: {
                    block: new math_1.Uint53(response.block.header.version.block).toString(),
                    app: new math_1.Uint53(response.block.header.version.app).toString(),
                },
                height: response.block.header.height,
                chainId: response.block.header.chainId,
                time: (0, tendermint_rpc_1.toRfc3339WithNanoseconds)(response.block.header.time),
            },
            txs: response.block.txs,
        };
    }
    /**
     * @description Broadcast a signed transaction with a specific mode.
     * @throws BroadcastErrorObject when result code is not zero. TypeError when mode is invalid.
     * @returns Differs depending on the BroadcastMode used.
     * See https://docs.cosmos.network/master/run-node/txs.html for more information.
     */
    async broadcastTransaction(tx, mode) {
        switch (mode) {
            case tendermint_rpc_1.Method.BroadcastTxAsync:
                return this.broadcastTransactionAsync(tx);
            case tendermint_rpc_1.Method.BroadcastTxSync:
                return this.broadcastTransactionSync(tx);
            case tendermint_rpc_1.Method.BroadcastTxCommit:
                return this.broadcastTransactionCommit(tx);
            default:
                throw new TypeError('broadcastTransaction: invalid BroadcastMode');
        }
    }
    /**
     * @description Broadcast a signed transaction.
     * @returns The transaction hash.
     */
    broadcastTransactionAsync(tx) {
        return this.baseClient.broadcastTxAsync({ tx });
    }
    /**
     * @description Broadcast a signed transaction and await the response.
     * @throws BroadcastErrorObject when result code is not zero.
     * @returns The response from the node once the transaction is processed by `CheckTx`.
     */
    async broadcastTransactionSync(tx) {
        const result = await this.baseClient.broadcastTxSync({ tx });
        if (result.code !== 0) {
            throw new errors_1.BroadcastErrorObject(`Broadcasting transaction failed: ${result.log}`, result);
        }
        return result;
    }
    /**
     * @description Broadcast a signed transaction and await for it to be included in the blockchain.
     * @throws BroadcastErrorObject when result code is not zero.
     * @returns The result of the transaction once included in the blockchain.
     */
    async broadcastTransactionCommit(tx) {
        const result = await this.broadcastTransactionSync(tx);
        return this.queryHash(result.hash);
    }
    /**
     * @description Using tx method, query for a transaction on-chain with retries specified by
     * the client BroadcastOptions.
     *
     * @throws TimeoutError if the transaction is not committed on-chain within the timeout limit.
     * @returns An indexed transaction containing information about the transaction when committed.
     */
    async queryHash(hash, time = 0) {
        const now = Date.now();
        const transactionId = (0, encoding_1.toHex)(hash).toUpperCase();
        if (time >= this.broadcastOptions.broadcastTimeoutMs) {
            throw new stargate_1.TimeoutError(`Transaction with hash [${hash}] was submitted but was not yet found on the chain. You might want to check later. Query timed out after ${this.broadcastOptions.broadcastTimeoutMs / 1000} seconds.`, transactionId);
        }
        await (0, utils_1.sleep)(this.broadcastOptions.broadcastPollIntervalMs);
        // If the transaction is not found, the tx method will throw an Internal Error.
        try {
            const tx = await this.baseClient.tx({ hash });
            return {
                height: tx.height,
                hash: (0, encoding_1.toHex)(tx.hash).toUpperCase(),
                code: tx.result.code,
                rawLog: tx.result.log !== undefined ? tx.result.log : '',
                tx: tx.tx,
                txIndex: tx.index,
                gasUsed: tx.result.gasUsed,
                gasWanted: tx.result.gasWanted,
                // Convert stargate events to tendermint events.
                events: tx.result.events.map((event) => {
                    return {
                        ...event,
                        attributes: event.attributes.map((attr) => {
                            return {
                                ...attr,
                                key: Buffer.from(attr.key).toString(),
                                value: Buffer.from(attr.value).toString(),
                            };
                        }),
                    };
                }),
                // @ts-ignore
                msgResponses: [],
            };
        }
        catch (error) {
            return this.queryHash(hash, time + Date.now() - now);
        }
    }
    /**
     * @description Set the broadcast options for this module.
     */
    setBroadcastOptions(broadcastOptions) {
        this.broadcastOptions = broadcastOptions;
    }
}
exports.TendermintClient = TendermintClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVuZGVybWludENsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRzL21vZHVsZXMvdGVuZGVybWludENsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQ0FBeUM7QUFDekMsdUNBQXNDO0FBQ3RDLCtDQUFrRTtBQUNsRSwyREFBOEY7QUFTOUYseUNBQXNDO0FBRXRDLDBDQUFxRDtBQUdyRCxNQUFhLGdCQUFnQjtJQUkzQixZQUFZLFVBQThCLEVBQUUsZ0JBQWtDO1FBQzVFLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztJQUMzQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBZTtRQUM1QixNQUFNLFFBQVEsR0FBa0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRSxPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUEsZ0JBQUssRUFBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRTtZQUM5QyxNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFO29CQUNQLEtBQUssRUFBRSxJQUFJLGFBQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxFQUFFO29CQUNqRSxHQUFHLEVBQUUsSUFBSSxhQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRTtpQkFDOUQ7Z0JBQ0QsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU07Z0JBQ3BDLE9BQU8sRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPO2dC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