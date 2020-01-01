const validateFn = ({ fn, constants }) => {
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
};

module.exports = validateFn;
