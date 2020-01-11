const unlinkDependentRows = require("../dependent/unlinkDependentRows");
const { defaultValue } = require("../../modelMetadata");

const deleteRowAndShadows = (
  model,
  scenarios,
  scenario,
  { name, dependsOn, index }
) => {
  const { x: lenX, z: lenZ } = model.lengths;
  unlinkDependentRows(scenario, name, dependsOn);
  const shadowRows = Object.keys(scenario.shadows || {}).reduce(
    (shadowRows, shadowScenarioName) => {
      const shadowScenario = scenarios[shadowScenarioName];
      const shadowRow = shadowScenarioName.rows[name];
      shadowRows.push(
        ...deleteRowAndShadows(model, scenarios, shadowScenario, shadowRow)
      );
      return shadowRows;
    },
    []
  );
  const deletedRows = { row: scenario.rows[name], shadowRows };
  delete scenario.rows[name];
  if (lenZ === 1 + shadowRows.length) {
    model.delete({ y: index });
    Object.values(scenario.rows).forEach(row => {
      if (row.index > index) {
        row.index = row.index - 1;
      }
    });
  } else {
    for (let x = 0; x < lenX; x++) {
      model.set(x, index, scenario.index, defaultValue);
    }
  }
  return deletedRows;
};

module.exports = deleteRowAndShadows;
