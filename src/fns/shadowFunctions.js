const { multiply } = require("../maths/coreOperations");

const keyPrefix = "shadow.";

const identity = (_, __, value) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ fnArgs = { multiple: 1 } }, _, value) =>
  multiply(value, fnArgs.multiple);
multiplier.key = `${keyPrefix}multiplier`;

module.exports = {
  identity,
  multiplier
};
