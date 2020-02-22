const { multiply } = require("../maths/arithmeticOperations");

const keyPrefix = "shadow.";

const identity = (_, __, value) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ fnArgs }, _, value) =>
  fnArgs.multiple ? multiply(value, fnArgs.multiple) : value;
multiplier.key = `${keyPrefix}multiplier`;

module.exports = {
  identity,
  multiplier
};
