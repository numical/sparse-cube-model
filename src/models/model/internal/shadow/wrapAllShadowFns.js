const shadowFunctionWrapper = require("./shadowFunctionWrapper");

const wrapAllShadowFns = scenarios => {
  Object.values(scenarios).forEach(baseScenario => {
    if (baseScenario.shadows) {
      Object.entries(baseScenario.shadows).forEach(([scenarioKey, shadow]) => {
        const scenario = scenarios[scenarioKey];
        Object.values(scenario.rows).forEach(row => {
          row.fn = shadowFunctionWrapper({ ...shadow, baseScenario });
        });
      });
    }
  });
};

module.exports = wrapAllShadowFns;
