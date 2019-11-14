module.exports = rowName => (model, scenario) => (x, y, z) =>
  model[x][scenario.rows[rowName].index][z];
