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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEvents = exports.deployArtifact = exports.contract = void 0;
const network_1 = require("./network");
function contract(abi, address, options) {
    const c = new (network_1.web3().eth.Contract)(abi, address, options);
    c.handleRevert = true;
    return c;
}
exports.contract = contract;
function deployArtifact(contractName, opts, constructorArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        const _artifact = network_1.artifact(contractName);
        const deployed = yield contract(_artifact.abi, "")
            .deploy({ data: _artifact.bytecode, arguments: constructorArgs })
            .send(opts);
        console.log("deployed", contractName, deployed.options.address, "deployer", opts.from);
        network_1.tag(deployed.options.address, contractName);
        return contract(_artifact.abi, deployed.options.address, deployed.options);
    });
}
exports.deployArtifact = deployArtifact;
function parseEvents(c, tx) {
    require("web3-parse-receipt-events")(c.options.jsonInterface, c.options.address, tx);
}
exports.parseEvents = parseEvents;
