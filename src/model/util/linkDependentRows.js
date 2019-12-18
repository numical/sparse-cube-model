const linkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    const array = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
    array.forEach(providerName => {
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
