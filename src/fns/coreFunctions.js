const keyPrefix = "core.";

const increment = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index] + 1;
increment.key = `${keyPrefix}increment`;

const interval = (_, interval) => interval;
interval.key = `${keyPrefix}interval`;

const lookup = ({ model, scenario, row, reference }, interval) =>
  model[interval][scenario.rows[reference].index][scenario.index];
lookup.key = `${keyPrefix}lookup`;

const previous = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index];
previous.key = `${keyPrefix}previous`;

const intervalsPerYear = ({ intervals }) => {
  switch (intervals.duration) {
    case "month":
      return 12;
    case "year":
      return 1;
    default:
      throw new Error(`Unknown duration '${intervals.duration}'.`);
  }
};
intervalsPerYear.key = "intervalsPerYear";

module.exports = {
  increment,
  interval,
  intervalsPerYear,
  lookup,
  previous
};
