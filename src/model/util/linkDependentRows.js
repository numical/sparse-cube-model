const linkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    const array = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
    array.forEach(providerName => {
      const provider = scenario.rows[providerName];
      if (!provider) {
        throw new Error(`Depends on unknown row '${rowName}'`);
      } else {
        if (provider.dependents) {
          const count = provider.dependents[rowName];
          const incrementedCount = count ? count + 1 : 1;
          provider.dependents[rowName] = incrementedCount;
        } else {
          provider.dependents = {};
          provider.dependents[rowName] = 1;
        }
      }
    });
  }
};

module.exports = linkDependentRows;
