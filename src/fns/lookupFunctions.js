const keyPrefix = "lookup.";

const increment = ({ model, scenario, row, fnArgs = { step: 1 } }, interval) =>
  model[interval - 1][row.index][scenario.index] + fnArgs.step;
increment.key = `${keyPrefix}increment`;

const interval = (_, interval) => interval;
interval.key = `${keyPrefix}interval`;

const lookup = ({ model, scenario, row, dependsOn = {} }, interval) => {
  if (!dependsOn.lookup) {
    throw new Error("Missing 'lookup' dependsOn arg.");
  } else if (scenario.rows[dependsOn.lookup]) {
    return model[interval][scenario.rows[dependsOn.lookup].index][
      scenario.index
    ];
  } else {
    throw new Error(`Unknown row '${dependsOn.lookup}'`);
  }
};
lookup.key = `${keyPrefix}lookup`;

const previous = ({ model, scenario, row }, interval) =>
  model[interval - 1][row.index][scenario.index];
previous.key = `${keyPrefix}previous`;

const lookupPrevious = (rowContext, interval) =>
  lookup(rowContext, interval - 1);
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
