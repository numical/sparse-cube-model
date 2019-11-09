const R = require("ramda");

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

module.exports = () => R.clone(defaults);
