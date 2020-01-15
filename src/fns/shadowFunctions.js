const { divide, multiply } = require("../maths/coreOperations");

const keyPrefix = "shadow.";

const identity = ({ value }) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ value, fnArgs = {} }) =>
  multiply(value, fnArgs.multiple || 1);
multiplier.key = `${keyPrefix}multiplier`;

module.exports = {
  identity,
  multiplier
};
