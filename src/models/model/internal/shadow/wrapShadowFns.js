const shadowFunctionWrapper = require("./shadowFunctionWrapper");

const wrapShadowFns = (scenario, fn, baseScenario) => {
  Object.values(scenario.rows).forEach(row => {
    row.fn = shadowFunctionWrapper(fn, baseScenario);
  });
};

module.exports = wrapShadowFns;
