const { values } = require("lodash");
const { getFullSignatureAsSymbolForEvent, getFullSignatureForEvent } = require("typechain");

const { codegenOutputType } = require("./types");

exports.codegenForEventsDeclarations = (events) => {
  return values(events)
    .map((e) => {
      if (e.length === 1) {
        return codegenEventDeclaration(e[0]);
      } else {
        return codegenEventDeclarationWithOverloads(e);
      }
    })
    .join("\n");
};

exports.codegenForEvents = (events) => {
  return values(events)
    .filter((e) => !e[0].isAnonymous)
    .map((events) => {
      if (events.length === 1) {
        return codegenForSingleEvent(events[0]);
      } else {
        return codegenForOverloadedEvent(events);
      }
    })
    .join("\n");
};

exports.codegenForEventsOnceFns = (events) => {
  return values(events)
    .filter((e) => e.length === 1) // ignore overloaded events as it seems like Web3v1 doesnt support them in this context
    .map((e) => e[0])
    .filter((e) => !e.isAnonymous)
    .map(
      (e) => `
    once(event: '${e.name}', cb: Callback<${e.name}>): void;
    once(event: '${e.name}', options: EventOptions, cb: Callback<${e.name}>): void;
    `
    )
    .join("\n");
};

function codegenForOverloadedEvent(events) {
  return events.map((e) => codegenForSingleEvent(e, `"${getFullSignatureForEvent(e)}"`, getFullSignatureAsSymbolForEvent(e))).join("\n");
}

function codegenForSingleEvent(event, overloadedName, overloadedTypeName) {
  return `
    ${overloadedName ?? event.name}(cb?: Callback<${overloadedTypeName ?? event.name}>): EventEmitter;
    ${overloadedName ?? event.name}(options?: EventOptions, cb?: Callback<${overloadedTypeName ?? event.name}>): EventEmitter;
  `;
}

function codegenEventDeclarationWithOverloads(events) {
  return events.map((e) => codegenEventDeclaration(e, getFullSignatureAsSymbolForEvent(e))).join("\n");
}

function codegenEventDeclaration(event, overloadedName) {
  return `export type ${overloadedName ?? event.name} = ContractEventLog<${codegenOutputTypesForEvents(event.inputs)}>`;
}

function codegenOutputTypesForEvents(outputs) {
  return `{
    ${outputs.map((t) => t.name && `${t.name}: ${codegenOutputType(t.type)}, `).join("")}
    ${outputs.map((t, i) => `${i}: ${codegenOutputType(t.type)}`).join(", ")}
  }`;
}
