"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fmt6 = exports.fmt8 = exports.fmt9 = exports.fmt12 = exports.fmt18 = exports.bn6 = exports.bn8 = exports.bn9 = exports.bn12 = exports.bn18 = exports.bn = exports.bscChainId = exports.ethChainId = exports.max = exports.ether = exports.zero = void 0;
const web3_1 = __importDefault(require("web3"));
const bn_js_1 = __importDefault(require("bn.js"));
const lodash_1 = __importDefault(require("lodash"));
exports.zero = bn("0");
exports.ether = bn18("1");
exports.max = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
exports.ethChainId = 0x1;
exports.bscChainId = 0x38;
function bn(n) {
    if (!n)
        return exports.zero;
    return new bn_js_1.default(n, 10);
}
exports.bn = bn;
/**
 * assuming 18 decimals, uncommify (support "1,000")
 */
function bn18(n) {
    return bn(web3_1.default.utils.toWei(n.split(",").join(""), "ether"));
}
exports.bn18 = bn18;
/**
 * assuming 12 decimals, uncommify (support "1,000")
 */
function bn12(n) {
    return bn(web3_1.default.utils.toWei(n.split(",").join(""), "szabo"));
}
exports.bn12 = bn12;
/**
 * assuming 9 decimals (gwei), uncommify (support "1,000")
 */
function bn9(n) {
    return bn(web3_1.default.utils.toWei(n.split(",").join(""), "gwei"));
}
exports.bn9 = bn9;
/**
 * assuming 8 decimals, uncommify (support "1,000")
 */
function bn8(n) {
    return bn9(n).divn(10);
}
exports.bn8 = bn8;
/**
 * assuming 6 decimals, uncommify (support "1,000")
 */
function bn6(e) {
    return bn(web3_1.default.utils.toWei(e.split(",").join(""), "lovelace"));
}
exports.bn6 = bn6;
/**
 * formats from wei, assuming 18 decimals
 */
function fmt18(ether) {
    return commify(web3_1.default.utils.fromWei(bn(ether), "ether"));
}
exports.fmt18 = fmt18;
/**
 * formats from wei, assuming 12 decimals
 */
function fmt12(ether) {
    return commify(web3_1.default.utils.fromWei(bn(ether), "szabo"));
}
exports.fmt12 = fmt12;
/**
 * formats from wei, assuming 9 decimals
 */
function fmt9(ether) {
    return commify(web3_1.default.utils.fromWei(bn(ether), "gwei"));
}
exports.fmt9 = fmt9;
/**
 * formats from wei, assuming 8 decimals
 */
function fmt8(n) {
    return fmt9(bn(n).muln(10));
}
exports.fmt8 = fmt8;
/**
 * formats from wei, assuming 6 decimals
 */
function fmt6(ether) {
    return commify(web3_1.default.utils.fromWei(bn(ether), "lovelace"));
}
exports.fmt6 = fmt6;
function commify(num) {
    const parts = lodash_1.default.split(num, ".");
    const upper = lodash_1.default.chain(parts[0].split(""))
        .reverse()
        .chunk(3)
        .map((c) => c.reverse().join(""))
        .reverse()
        .join(",")
        .value();
    const lower = parts[1];
    if (lower)
        return `${upper}.${lower}`;
    else
        return upper;
}
