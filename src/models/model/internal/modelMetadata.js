const { clone, mergeDeepLeft } = require("ramda");

const defaults = {
  intervals: {
    count: 300,
    epoch: 1577836800000, // 01/01/2020 00:00:00
    duration: "month"
  },
  scenarios: {
    defaultScenario: {
      index: 0,
      rows: {}
    }
  }
};

const factory = (custom = {}) => mergeDeepLeft(custom, clone(defaults));
factory.defaults = defaults;
factory.defaultScenario = "defaultScenario";

module.exports = factory;