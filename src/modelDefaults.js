const R = require("ramda");

const defaults = {
  interval: {
    number: 300
  },
  scenarios: {
    defaultScenario: 0
  }
};

module.exports = () => R.clone(defaults);
