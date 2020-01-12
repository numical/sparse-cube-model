const { divide, multiply } = require("../maths/coreOperations");

const keyPrefix = "shadow.";

const identity = ({ value }) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ value, multiple = 1 }) => multiply(value, multiple);
multiplier.key = `${keyPrefix}multiplier`;

module.exports = {
  identity,
  multiplier
};
