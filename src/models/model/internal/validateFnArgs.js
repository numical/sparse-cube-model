const validateFnArgs = ({ fn, fnArgs }) => {
  if (!fn && fnArgs) {
    throw new Error("Function args passed but no function.");
  }
};

module.exports = validateFnArgs;
