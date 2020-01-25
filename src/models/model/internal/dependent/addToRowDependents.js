const addToRowDependents = (
  scenario,
  key,
  dependsOn,
  dependentType = "row"
) => {
  if (dependsOn) {
    const type = `${dependentType}s`;
    Object.values(dependsOn).forEach(providerName => {
      const provider = scenario.rows[providerName];
      if (!provider) {
        throw new Error(`Depends on unknown row '${providerName}'`);
      } else {
        if (provider.dependents) {
          if (provider.dependents[type]) {
            provider.dependents[type].push(key);
          } else {
            provider.dependents[type] = [key];
          }
        } else {
          provider.dependents = {
            [type]: [key]
          };
        }
      }
    });
  }
};

module.exports = addToRowDependents;
