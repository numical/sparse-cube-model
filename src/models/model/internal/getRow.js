const getRow = (rowName, scenarioName, scenarios) => {
  const scenario = scenarios[scenarioName];
  if (!scenario) {
    throw new Error(`Unknown scenario '${scenarioName}'`);
  }
  const row = scenario.rows[rowName];
  if (!row) {
    throw new Error(`Unknown row '${rowName}'`);
  }
  return { row, scenario };
};

module.exports = getRow;
