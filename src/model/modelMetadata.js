const { clone, mergeDeepLeft } = require("ramda");

const defaults = {
  interval: {
    count: 300
  },
  scenarios: {
    defaultScenario: {
      index: 0,
      rows: {}
    }
  }
};

const factory = (custom = {}) => mergeDeepLeft(custom, clone(defaults));
factory.defaultScenario = "defaultScenario";

module.exports = factory;
