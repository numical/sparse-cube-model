const msg = "Row has no function, but less constants than intervals.";

const ensureAllConstantsDefined = (constants, intervals) => {
  const numRequired = intervals.count + 1;
  const values = Array.isArray(constants)
    ? constants
    : constants instanceof Map
    ? Array.from(constants.values())
    : Object.values(constants);
  if (values.length !== numRequired) {
    throw new Error(msg);
  }
  for (let i = 0; i < numRequired; i++) {
    if (values[i] === undefined) {
      throw new Error(msg);
    }
  }
};

module.exports = ensureAllConstantsDefined;
