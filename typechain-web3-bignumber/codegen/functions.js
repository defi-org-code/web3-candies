const { values } = require("lodash");
const { getSignatureForFn } = require("typechain");

const { codegenInputTypes, codegenOutputTypes } = require("./types");

exports.codegenForFunctions = (fns) => {
  return values(fns)
    .map((fns) => {
      if (fns.length === 1) {
        return codegenForSingleFunction(fns[0]);
      } else {
        return codegenForOverloadedFunctions(fns);
      }
    })
    .join("\n");
};

function codegenForOverloadedFunctions(fns) {
  return fns.map((f) => codegenForSingleFunction(f, `"${getSignatureForFn(f)}"`)).join("\n");
}

function codegenForSingleFunction(fn, overloadedName) {
  return `
  ${generateFunctionDocumentation(fn.documentation)}
  ${overloadedName ?? fn.name}(${codegenInputTypes(fn.inputs)}): ${getTransactionObject(fn)}<${codegenOutputTypes(fn.outputs)}>;
`;
}

function getTransactionObject(fn) {
  return fn.stateMutability === "payable" ? "PayableTransactionObject" : "NonPayableTransactionObject";
}

function generateFunctionDocumentation(doc) {
  if (!doc) return "";

  let docString = "/**";
  if (doc.details) docString += `\n * ${doc.details}`;
  if (doc.notice) docString += `\n * ${doc.notice}`;

  const params = Object.entries(doc.params || {});
  if (params.length) {
    params.forEach(([key, value]) => {
      docString += `\n * @param ${key} ${value}`;
    });
  }

  if (doc.return) docString += `\n * @returns ${doc.return}`;

  docString += "\n */";

  return docString;
}
