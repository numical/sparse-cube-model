const isEmpty = constants => {
  if (constants) {
    if (Array.isArray(constants)) {
      return constants.length === 0;
    } else if (constants instanceof Map) {
      return constants.keys().length === 0;
    } else if (typeof constants === "object") {
      return Object.keys(constants).length === 0;
    } else {
      throw new Error("Constants must be an array or a dictionary or a map.");
    }
  } else {
    return true;
  }
};

const validateConstants = ({ fn, constants }) => {
  const empty = isEmpty(constants);
  if (!fn && empty) {
    throw new Error("No function or constants passed.");
  }
};

module.exports = {
  isEmpty,
  validateConstants
};
