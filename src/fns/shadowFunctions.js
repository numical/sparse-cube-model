const { divide, multiply } = require("../maths/coreOperations");

const keyPrefix = "shadow.";

const identity = ({ value }) => value;
identity.key = `${keyPrefix}identity`;

const multiplier = ({ value, multiple }) => multiply(value, multiple);
multiplier.key = `${keyPrefix}multiplier`;

const applyPercentage = ({ value, percent }) =>
  multiply(value, divide(percent, 100));
applyPercentage.key = `${keyPrefix}applyPercentage`;

module.exports = {
  identity,
  multiplier
};
