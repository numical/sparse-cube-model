const validateScenario = ({ scenarioName, scenarios, shouldExist = true }) => {
  if (!scenarioName) {
    throw new Error("A scenario name is required.");
  }
  const scenario = scenarios[scenarioName];
  if (shouldExist && !scenario) {
    throw new Error(`Unknown scenario '${scenarioName}'.`);
  }
  if (!shouldExist && scenario) {
    throw new Error(`Scenario '${scenarioName}' already exists.`);
  }
  return scenario;
};

module.exports = validateScenario;
