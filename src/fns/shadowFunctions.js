const { divide, multiply } = require("../maths/coreOperations");

const keyPrefix = "shadow.";

const identity = ({ value }) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ value, fnArgs = { multiple: 1 } }) =>
  multiply(value, fnArgs.multiple);
multiplier.key = `${keyPrefix}multiplier`;

module.exports = {
  identity,
  multiplier
};
