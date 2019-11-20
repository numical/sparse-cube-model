const keyPrefix = "core.";

const increment = ({ model, x, y, z }) => model[x - 1][y][z] + 1;
increment.key = `${keyPrefix}increment`;

const interval = ({ x }) => x;
interval.key = `${keyPrefix}interval`;

const lookup = ({ model, scenario, x, y, z, rowName }) =>
  model[x][scenario.rows[rowName].index][z];
lookup.key = `${keyPrefix}lookup`;

module.exports = {
  increment,
  interval,
  lookup
};
