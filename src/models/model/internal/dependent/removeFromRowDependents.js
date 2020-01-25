/*
 IF statements with ignored else are for the case of multiple row delete
 */

const removeFromRowDependents = (
  scenario,
  key,
  dependsOn,
  dependentType = "row"
) => {
  if (dependsOn) {
    const type = `${dependentType}s`;
    Object.values(dependsOn).forEach(providerName => {
      const provider = scenario.rows[providerName];
      /* istanbul ignore else */
      if (provider && provider.dependents && provider.dependents[type]) {
        const index = provider.dependents[type].indexOf(key);
        /* istanbul ignore else */
        if (index > -1) {
          if (provider.dependents[type].length === 1) {
            delete provider.dependents;
          } else {
            provider.dependents[type].splice(index, 1);
          }
        }
      }
    });
  }
};

module.exports = removeFromRowDependents;
