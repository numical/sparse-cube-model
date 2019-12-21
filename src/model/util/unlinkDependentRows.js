const unlinkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    const array = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
    array.forEach(providerName => {
      const provider = scenario.rows[providerName];
      if (provider && provider.dependents) {
        const count = provider.dependents[rowName];
        if (count && count > 1) {
          provider.dependents[rowName] = count - 1;
        } else {
          delete provider.dependents[rowName];
          if (Object.keys(provider.dependents).length === 0) {
            delete provider.dependents;
          }
        }
      }
    });
  }
};

module.exports = unlinkDependentRows;
