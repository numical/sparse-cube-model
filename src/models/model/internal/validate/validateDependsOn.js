const validateDependsOn = ({ dependsOn }) => {
  if (dependsOn && typeof dependsOn !== "object") {
    throw new Error(`dependsOn invalid: '${dependsOn}'`);
  }
};

module.exports = validateDependsOn;
