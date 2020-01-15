const unlinkDependentRows = require("../dependent/unlinkDependentRows");
const { defaultValue } = require("../../modelMetadata");

const deleteRowAndShadows = (
  model,
  scenarios,
  scenario,
  { key, dependsOn, index }
) => {
  const { x: lenX, z: lenZ } = model.lengths;
  unlinkDependentRows(scenario, key, dependsOn);
  const shadowRows = Object.keys(scenario.shadows || {}).reduce(
    (shadowRows, shadowScenarioName) => {
      const shadowScenario = scenarios[shadowScenarioName];
      const shadowRow = shadowScenario.rows[key];
      shadowRows.push(
        // shadows cannot have shadows
        deleteRowAndShadows(model, scenarios, shadowScenario, shadowRow).row
      );
      return shadowRows;
    },
    []
  );
  const deletedRows = { row: scenario.rows[key], shadowRows };
  delete scenario.rows[key];
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
