const validateScenario = ({
  scenarioName,
  scenarios,
  shouldExist = true,
  toEdit = true
}) => {
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
  if (scenario && scenario.isShadow && toEdit) {
    throw new Error(`Shadow scenario '${scenarioName}' cannot be edited.`);
  }
  return scenario;
};

module.exports = validateScenario;
