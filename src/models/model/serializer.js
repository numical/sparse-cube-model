const fnsDictionary = require("../../fns/functionsDictionary");

const defaultReplacer = (key, value) =>
  key === "fn"
    ? value
      ? value.key
      : undefined
    : key === "dependents"
    ? undefined
    : value;

const defaultReviver = (fnsRepo, key, value) => {
  if (key === "fn") {
    if (fnsRepo[value]) {
      return fnsRepo[value];
    } else {
      throw new Error(`Missing function key '${value}'.`);
    }
  } else {
    return value;
  }
};

const stringify = (
  obj,
  { pretty = false, replacer = defaultReplacer } = {}
) => {
  const space = pretty ? 2 : 0;
  return JSON.stringify(obj, replacer, space);
};

const parse = (serialized, fnsRepo = fnsDictionary) => {
  return JSON.parse(serialized, defaultReviver.bind(null, fnsRepo));
};

module.exports = { stringify, parse };
