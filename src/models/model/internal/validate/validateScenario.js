const validateScenario = ({
  scenarioKey,
  scenarios,
  shouldExist = true,
  toEdit = true
}) => {
  if (!scenarioKey) {
    throw new Error("A scenario key is required.");
  }
  const scenario = scenarios[scenarioKey];
  if (shouldExist && !scenario) {
    throw new Error(`Unknown scenario '${scenarioKey}'.`);
  }
  if (!shouldExist && scenario) {
    throw new Error(`Scenario '${scenarioKey}' already exists.`);
  }
  if (scenario && scenario.isShadow && toEdit) {
    throw new Error(`Shadow scenario '${scenarioKey}' cannot be edited.`);
  }
  return scenario;
};

module.exports = validateScenario;
