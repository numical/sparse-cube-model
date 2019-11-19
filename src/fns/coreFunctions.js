const keyPrefix = "core.";

const identity = require("./identity");
identity.key = `${keyPrefix}identity`;

const increment = require("./increment");
increment.key = `${keyPrefix}increment`;

const interval = require("./interval");
interval.key = `${keyPrefix}interval`;

const lookup = require("./lookup");
lookup.key = `${keyPrefix}lookup`;

module.exports = {
  identity,
  increment,
  interval,
  lookup
};
