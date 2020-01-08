const validateFn = ({ fn }) => {
  if (fn) {
    if (typeof fn !== "function") {
      throw new Error(`Function '${fn}' must be a function.`);
    }
    if (!fn.key) {
      throw new Error(`Function '${fn.name}' must have a 'key' property.`);
    }
  }
};

module.exports = validateFn;
