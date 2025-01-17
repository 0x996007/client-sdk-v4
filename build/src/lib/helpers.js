"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeJson = exports.ByteArrayEncoding = exports.bigIntToBytes = exports.stripHexPrefix = exports.convertPartialTransactionOptionsToFull = void 0;
const encoding_1 = require("@cosmjs/encoding");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const long_1 = __importDefault(require("long"));
const constants_1 = require("./constants");
/**
 * @description Either return undefined or insert default sequence value into
 * `partialTransactionOptions` if it does not exist.
 *
 * @returns undefined or full TransactionOptions.
 */
function convertPartialTransactionOptionsToFull(partialTransactionOptions) {
    if (partialTransactionOptions === undefined) {
        return undefined;
    }
    return {
        sequence: constants_1.DEFAULT_SEQUENCE,
        ...partialTransactionOptions,
    };
}
exports.convertPartialTransactionOptionsToFull = convertPartialTransactionOptionsToFull;
/**
 * @description Strip '0x' prefix from input string. If there is no '0x' prefix, return the original
 * input.
 *
 * @returns input without '0x' prefix or original input if no prefix.
 */
function stripHexPrefix(input) {
    if (input.indexOf('0x') === 0) {
        return input.slice(2);
    }
    return input;
}
exports.stripHexPrefix = stripHexPrefix;
function toBigInt(u) {
    if (u.length <= 1) {
        return BigInt(0);
    }
    // eslint-disable-next-line no-bitwise
    const negated = (u[0] & 1) === 1;
    const hex = Buffer.from(u.slice(1)).toString('hex');
    const abs = BigInt(`0x${hex}`);
    return negated ? -abs : abs;
}
function bigIntToBytes(value) {
    const absoluteValue = value < 0 ? value * BigInt(-1) : value;
    const nonPaddedHexValue = absoluteValue.toString(16);
    const paddedHexValue = nonPaddedHexValue.length % 2 === 0 ? nonPaddedHexValue : `0${nonPaddedHexValue}`;
    const numberBytes = Buffer.from(paddedHexValue, 'hex');
    const signedBytes = Uint8Array.of(value < 0 ? 3 : 2, ...numberBytes);
    return signedBytes;
}
exports.bigIntToBytes = bigIntToBytes;
var ByteArrayEncoding;
(function (ByteArrayEncoding) {
    ByteArrayEncoding["HEX"] = "hex";
    ByteArrayEncoding["BIGINT"] = "bigint";
})(ByteArrayEncoding = exports.ByteArrayEncoding || (exports.ByteArrayEncoding = {}));
function encodeJson(object, byteArrayEncoding = ByteArrayEncoding.HEX) {
    // eslint-disable-next-line prefer-arrow-callback
    return JSON.stringify(object, function replacer(_key, value) {
        // Even though we set the an UInt8Array as the value,
        // it comes in here as an object with UInt8Array as the buffer property.
        if (value instanceof bignumber_js_1.default) {
            return value.toString();
        }
        if (typeof value === 'bigint') {
            return value.toString();
        }
        if (value instanceof long_1.default) {
            return value.toString();
        }
        if ((value === null || value === void 0 ? void 0 : value.buffer) instanceof Uint8Array) {
            if (byteArrayEncoding === ByteArrayEncoding.HEX) {
                return (0, encoding_1.toHex)(value.buffer);
            }
            else {
                return toBigInt(value.buffer).toString();
            }
        }
        else if (value instanceof Uint8Array) {
            if (byteArrayEncoding === ByteArrayEncoding.HEX) {
                return (0, encoding_1.toHex)(value);
            }
            else {
                return toBigInt(value).toString();
            }
        }
        return value;
    });
}
exports.encodeJson = encodeJson;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSwrQ0FBeUM7QUFDekMsZ0VBQXFDO0FBQ3JDLGdEQUF3QjtBQUd4QiwyQ0FBK0M7QUFFL0M7Ozs7O0dBS0c7QUFDSCxTQUFnQixzQ0FBc0MsQ0FDcEQseUJBQXFEO0lBRXJELElBQUkseUJBQXlCLEtBQUssU0FBUyxFQUFFO1FBQzNDLE9BQU8sU0FBUyxDQUFDO0tBQ2xCO0lBRUQsT0FBTztRQUNMLFFBQVEsRUFBRSw0QkFBZ0I7UUFDMUIsR0FBRyx5QkFBeUI7S0FDN0IsQ0FBQztBQUNKLENBQUM7QUFYRCx3RkFXQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFDLEtBQWE7SUFDMUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNmLENBQUM7QUFORCx3Q0FNQztBQUVELFNBQVMsUUFBUSxDQUFDLENBQWE7SUFDN0IsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNqQixPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNsQjtJQUNELHNDQUFzQztJQUN0QyxNQUFNLE9BQU8sR0FBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUMsTUFBTSxHQUFHLEdBQVcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVELE1BQU0sR0FBRyxHQUFXLE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFD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