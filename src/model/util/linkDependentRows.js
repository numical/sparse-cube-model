const linkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    if (!Array.isArray(dependsOn)) {
      dependsOn = [dependsOn];
    }
    dependsOn.forEach(providerName => {
      const provider = scenario.rows[providerName];
      if (!provider) {
        throw new Error(`Depends on unknown row '${rowName}'`);
      } else {
        if (provider.dependents && !provider.dependents.includes(rowName)) {
          provider.dependents.push(rowName);
        } else {
          provider.dependents = [rowName];
        }
      }
    });
  }
};

module.exports = linkDependentRows;
