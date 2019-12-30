const fnsDictionary = require("./functionsDictionary");

const replacer = (key, value) =>
  key === "fn"
    ? value
      ? value.key
      : undefined
    : key === "dependents"
    ? undefined
    : value;

const reviver = (fnsRepo, key, value) =>
  key === "fn" ? fnsRepo[value] : value === null ? undefined : value;

const stringify = (obj, { pretty = false } = {}) => {
  const space = pretty ? 2 : 0;
  return JSON.stringify(obj, replacer, space);
};

const parse = (serialized, fnsRepo = fnsDictionary) => {
  return JSON.parse(serialized, reviver.bind(null, fnsRepo));
};

module.exports = { stringify, parse };