const linkDependentRows = require("./linkDependentRows");

const linkAllDependentRows = scenarios => {
  Object.values(scenarios).forEach(scenario => {
    Object.entries(scenario.rows).forEach(([rowKey, row]) => {
      linkDependentRows(scenario, rowKey, row.dependsOn);
    });
  });
};

module.exports = linkAllDependentRows;
