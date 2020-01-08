/*
 IF statements with ignored else are for the case of multiple row delete
 */

const unlinkDependentRows = (scenario, rowName, dependsOn) => {
  if (dependsOn) {
    const obj = typeof dependsOn === "string" ? { dependsOn } : dependsOn;
    Object.values(obj).forEach(providerName => {
      const provider = scenario.rows[providerName];
      /* istanbul ignore else */
      if (provider && provider.dependents) {
        const index = provider.dependents.indexOf(rowName);
        /* istanbul ignore else */
        if (index > -1) {
          if (provider.dependents.length === 1) {
            delete provider.dependents;
          } else {
            provider.dependents.splice(index, 1);
          }
        }
      }
    });
  }
};

module.exports = unlinkDependentRows;
