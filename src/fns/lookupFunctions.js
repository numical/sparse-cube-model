const keyPrefix = "lookup.";

const increment = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index] + 1;
increment.key = `${keyPrefix}increment`;

const interval = (_, interval) => interval;
interval.key = `${keyPrefix}interval`;

const lookup = ({ model, scenario, row, dependsOn }, interval) => {
  if (scenario.rows[dependsOn]) {
    return model[interval][scenario.rows[dependsOn].index][scenario.index];
  } else {
    throw new Error(`Unknown row '${dependsOn}'`);
  }
};
lookup.key = `${keyPrefix}lookup`;

const previous = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index];
previous.key = `${keyPrefix}previous`;

const lookupPrevious = ({ model, scenario, row, dependsOn }, interval) => {
  if (scenario.rows[dependsOn]) {
    return model[interval - 1][scenario.rows[dependsOn].index][scenario.index];
  } else {
    throw new Error(`Unknown row '${dependsOn}'`);
  }
};
lookupPrevious.key = `${keyPrefix}lookupPrevious`;

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
  lookupPrevious,
  previous
};
