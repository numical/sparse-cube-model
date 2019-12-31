const constantsIsEmpty = constants => {
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

module.exports = constantsIsEmpty;
