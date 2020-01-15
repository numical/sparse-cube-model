const shadowFunctionWrapper = require("./shadowFunctionWrapper");

const wrapAllShadowFns = scenarios => {
  Object.values(scenarios).forEach(baseScenario => {
    if (baseScenario.shadows) {
      Object.entries(baseScenario.shadows).forEach(
        ([scenarioKey, shadowArgs]) => {
          const scenario = scenarios[scenarioKey];
          Object.values(scenario.rows).forEach(row => {
            row.fn = shadowFunctionWrapper({ ...shadowArgs, baseScenario });
          });
        }
      );
    }
  });
};

module.exports = wrapAllShadowFns;
