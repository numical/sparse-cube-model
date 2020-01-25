const validateDependsOn = ({ dependsOn }) => {
  if (dependsOn && typeof dependsOn !== "object") {
    throw new Error(`dependsOn '${dependsOn}' must be a dictionary.`);
  }
};

module.exports = validateDependsOn;
