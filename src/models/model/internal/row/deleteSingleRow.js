const unlinkDependentRows = require("../dependent/unlinkDependentRows");
const { defaultValue } = require("../../modelMetadata");

const deleteSingleRow = (model, scenario, row, rowName) => {
  const { x: lenX, z: lenZ } = model.lengths;
  unlinkDependentRows(scenario, rowName, row.dependsOn);
  delete scenario.rows[rowName];
  if (lenZ === 1) {
    const y = row.index;
    model.delete({ y });
    Object.values(scenario.rows).forEach(row => {
      if (row.index > y) {
        row.index = row.index - 1;
      }
    });
  } else {
    for (let x = 0; x < lenX; x++) {
      model.set(x, row.index, scenario.index, defaultValue);
    }
  }
};

module.exports = deleteSingleRow;
