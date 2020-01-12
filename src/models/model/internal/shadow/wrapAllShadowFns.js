const shadowFunctionWrapper = require("./shadowFunctionWrapper");

const wrapAllShadowFns = scenarios => {
  Object.values(scenarios).forEach(baseScenario => {
    if (baseScenario.shadows) {
      Object.entries(baseScenario.shadows).forEach(
        ([scenarioName, shadowArgs]) => {
          const scenario = scenarios[scenarioName];
          Object.values(scenario.rows).forEach(row => {
            row.fn = shadowFunctionWrapper({ ...shadowArgs, baseScenario });
          });
        }
      );
    }
  });
};

module.exports = wrapAllShadowFns;
