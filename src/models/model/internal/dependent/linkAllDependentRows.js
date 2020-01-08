const linkDependentRows = require("./linkDependentRows");

const linkAllDependentRows = scenarios => {
  Object.values(scenarios).forEach(scenario => {
    Object.entries(scenario.rows).forEach(([rowName, row]) => {
      linkDependentRows(scenario, rowName, row.dependsOn);
    });
  });
};

module.exports = linkAllDependentRows;
