const addToRowDependents = require("./addToRowDependents");

const addToAllRowDependents = scenarios => {
  Object.values(scenarios).forEach(scenario => {
    Object.entries(scenario.rows).forEach(([rowKey, row]) => {
      addToRowDependents(scenario, rowKey, row.dependsOn);
    });
  });
};

module.exports = addToAllRowDependents;
