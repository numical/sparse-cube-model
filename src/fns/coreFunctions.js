const keyPrefix = "core.";

const increment = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index] + 1;
increment.key = `${keyPrefix}increment`;

const interval = (_, interval) => interval;
interval.key = `${keyPrefix}interval`;

const lookup = ({ model, scenario, row, rowName }, interval) =>
  model[interval][scenario.rows[rowName].index][scenario.index];
lookup.key = `${keyPrefix}lookup`;

module.exports = {
  increment,
  interval,
  lookup
};
