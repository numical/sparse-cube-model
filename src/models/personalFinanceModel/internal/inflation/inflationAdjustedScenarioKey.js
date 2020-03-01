const keys = require("../keys");
const { defaultScenario } = require("../../../model/modelMetadata");

const inflationAdjustedScenarioKey = (scenarioKey = defaultScenario) => `${scenarioKey}_${keys.inflation.scenario.suffix}`

module.exports = inflationAdjustedScenarioKey;