const isEmpty = require("./constantsIsEmpty");

const validateFn = ({ fn, constants }) => {
  if (!fn && isEmpty(constants)) {
    throw new Error("No function or constants passed.");
  }
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
};

module.exports = validateFn;
