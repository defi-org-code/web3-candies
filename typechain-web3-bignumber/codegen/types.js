exports.codegenInputTypes = (input) => {
  if (input.length === 0) {
    return "";
  }
  return input.map((input, index) => `${input.name || `arg${index}`}: ${exports.codegenInputType(input.type)}`).join(", ") + ", ";
};

exports.codegenOutputTypes = (outputs) => {
  if (outputs.length === 1) {
    return exports.codegenOutputType(outputs[0].type);
  } else {
    return `{
      ${outputs.map((t) => t.name && `${t.name}: ${exports.codegenOutputType(t.type)}, `).join("")}
      ${outputs.map((t, i) => `${i}: ${exports.codegenOutputType(t.type)}`).join(", ")}
    }`;
  }
};

exports.codegenInputType = (evmType) => {
  switch (evmType.type) {
    case "integer":
    case "uinteger":
      return "number | string | BN | BigNumber";
    case "address":
      return "string";
    case "bytes":
    case "dynamic-bytes":
      return "string | number[]";
    case "array":
      return `(${exports.codegenInputType(evmType.itemType)})[]`;
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "tuple":
      return exports.codegenTupleType(evmType, exports.codegenInputType);
    case "unknown":
      return "any";
  }
};

exports.codegenOutputType = (evmType) => {
  switch (evmType.type) {
    case "integer":
      return "string";
    case "uinteger":
      return "string";
    case "address":
      return "string";
    case "void":
      return "void";
    case "bytes":
    case "dynamic-bytes":
      return "string";
    case "array":
      return `(${exports.codegenOutputType(evmType.itemType)})[]`;
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    case "tuple":
      return exports.codegenTupleType(evmType, exports.codegenOutputType);
    case "unknown":
      return "any";
  }
};

exports.codegenTupleType = (tuple, generator) => {
  return "[" + tuple.components.map((component) => generator(component.type)).join(", ") + "]";
};
