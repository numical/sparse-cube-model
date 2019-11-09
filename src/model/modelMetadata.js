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

module.exports = (custom = {}) => mergeDeepLeft(custom, clone(defaults));
