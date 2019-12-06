const defaultValue = require("./defaultValue");

const prepareRowConstants = (
  fn,
  constants,
  start,
  end,
  intervals,
  existingConstants
) => {
  if (!fn && !constants) {
    throw new Error("No function or constants passed.");
  }
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
  if (!constants) {
    const rowConstants =
      end < intervals.count - 1
        ? Array(intervals.count)
        : start > 0
        ? Array(start)
        : [];
    if (start > 0) {
      for (let index = 0; index < start; index++) {
        rowConstants[index] = defaultValue;
      }
    }
    if (end < intervals.count - 1) {
      for (let index = end + 1; index < intervals.count; index++) {
        rowConstants[index] = defaultValue;
      }
    }
    return {
      rowConstants,
      startInterval: start,
      endInterval: end
    };
  }
  if (typeof constants !== "object") {
    throw new Error("Constants must be an array or an object.");
  }
  const isArray = Array.isArray(constants);
  if (!fn) {
    const values = isArray ? constants : Object.values(constants);
    if (values.length < end - start) {
      throw new Error(
        `Row has no function, but less constants than intervals.`
      );
    } else if (values.some(value => value === undefined)) {
      throw new Error(`Row has no function, but undefined constants.`);
    }
  }
  if (isArray) {
    const startInterval =
      start > 0
        ? start
        : existingConstants
        ? constants.reduce(
            (min, value, index) =>
              value !== undefined ? (index < min ? index : min) : min,
            constants.length
          )
        : 0;
    const startDefaultArray = Array(start).fill(defaultValue);
    const calculatedValuesArray = Array(end + 1 - constants.length - start);
    const endDefaultArray = Array(intervals.count - 1 - end).fill(defaultValue);
    const rowConstants = [
      ...startDefaultArray,
      ...constants,
      ...calculatedValuesArray,
      ...endDefaultArray
    ];
    return {
      rowConstants,
      startInterval,
      endInterval: end
    };
  }
  Object.keys(constants).forEach(constant => {
    if (Number.isNaN(Number.parseInt(constant))) {
      throw new Error(`Constant key '${constant}' must be an integer.`);
    } else if (constant > end) {
      throw new Error(`Constant index ${constant} must be ${end} or less.`);
    } else if (constant < start) {
      throw new Error(`Constant index ${constant} must be ${start} or more.`);
    }
  });
  const rowConstants = existingConstants || [
    ...Array(start).fill(defaultValue),
    ...Array(end + 1 - start),
    ...Array(intervals.count - 1 - end).fill(defaultValue)
  ];
  const startInterval = Object.entries(constants).reduce(
    (min, [index, value]) => {
      rowConstants[index] = value;
      return index < min ? index : min;
    },
    existingConstants ? intervals.count : start
  );
  return {
    rowConstants,
    startInterval,
    endInterval: end
  };
};

module.exports = prepareRowConstants;
