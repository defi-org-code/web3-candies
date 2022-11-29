const { codegenForEvents, codegenForEventsDeclarations, codegenForEventsOnceFns } = require("./events");
const { codegenForFunctions } = require("./functions");

exports.codegen = (contract) => {
  const typesPath = contract.path.length ? `${new Array(contract.path.length).fill("..").join("/")}/types` : "./types";

  return `
  import type BigNumber from "bignumber.js";
  import type { ContractOptions } from "web3-eth-contract";
  import type { EventLog } from "web3-core";
  import type { EventEmitter } from "events";
  import type { Callback, PayableTransactionObject, NonPayableTransactionObject, BlockType, ContractEventLog, BaseContract } from "${typesPath}";
  export interface EventOptions {
    filter?: object;
    fromBlock?: BlockType;
    topics?: string[];
  }
  ${codegenForEventsDeclarations(contract.events)}
  export interface ${contract.name} extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): ${contract.name};
    clone(): ${contract.name};
    methods: {
      ${codegenForFunctions(contract.functions)}
    };
    events: {
      ${codegenForEvents(contract.events)}
      allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    ${codegenForEventsOnceFns(contract.events)}
  }
  `;
};
