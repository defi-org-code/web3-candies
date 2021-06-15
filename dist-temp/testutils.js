"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectRevert = exports.useChaiBN = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const chai_1 = require("chai");
const chai_bn_1 = __importDefault(require("chai-bn"));
function useChaiBN() {
    chai_1.use(chai_bn_1.default(bn_js_1.default));
}
exports.useChaiBN = useChaiBN;
function expectRevert(fn) {
    return __awaiter(this, void 0, void 0, function* () {
        let err = null;
        try {
            yield fn();
        }
        catch (e) {
            err = e;
        }
        chai_1.expect(!!err, "expected to revert").true;
    });
}
exports.expectRevert = expectRevert;
