const linkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    const obj = typeof dependsOn === "string" ? { dependsOn } : dependsOn;
    // const array = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
    Object.values(obj).forEach(providerName => {
      const provider = scenario.rows[providerName];
      if (!provider) {
        throw new Error(`Depends on unknown row '${providerName}'`);
      } else {
        if (provider.dependents) {
          provider.dependents.push(rowName);
        } else {
          provider.dependents = [rowName];
        }
      }
    });
  }
};

module.exports = linkDependentRows;
