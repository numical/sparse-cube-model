const { clone, mergeDeepLeft } = require("ramda");
const getModelVersion = require("../model/internal/version/getModelVersion");

const defaults = {
  version: getModelVersion(),
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
factory.defaultValue = 0;

module.exports = factory;
