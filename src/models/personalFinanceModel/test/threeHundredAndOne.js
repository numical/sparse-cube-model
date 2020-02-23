const { defaults } = require("../../model/modelMetadata");

const newArray = () => Array(defaults.intervals.count + 1);
const zeroes = newArray().fill(0);
const ones = newArray().fill(1);

module.exports = {
  zeroes,
  ones
};
