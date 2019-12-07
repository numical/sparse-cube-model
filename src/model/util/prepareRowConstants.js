const defaultValue = require("./defaultValue");
const getIntervalFromDate = require("./getIntervalFromDate");

const prepareRowConstants = ({
  fn,
  constants,
  start = 0,
  end,
  existingConstants,
  intervals
}) => {
  if (!fn && !constants) {
    throw new Error("No function or constants passed.");
  }
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
  const maxInterval = intervals.count - 1;
  if (!end) {
    end = maxInterval;
  }
  const calcIntervalFromDate = getIntervalFromDate(intervals);
  if (start instanceof Date) {
    start = calcIntervalFromDate(start);
  }
  if (end instanceof Date) {
    end = calcIntervalFromDate(end);
  }
  if (!constants) {
    const rowConstants =
      end < maxInterval
        ? Array(maxInterval + 1)
        : start > 0
        ? Array(start)
        : existingConstants || [];
    if (start > 0) {
      for (let index = 0; index < start; index++) {
        rowConstants[index] = defaultValue;
      }
    }
    if (end < maxInterval) {
      for (let index = end + 1; index <= maxInterval; index++) {
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
  if (constants instanceof Map) {
    constants = Array.from(constants.entries()).reduce(
      (constants, [key, value]) => {
        const index = key instanceof Date ? calcIntervalFromDate(key) : key;
        constants[index] = constants[index] ? constants[index] + value : value;
        return constants;
      },
      {}
    );
  }
  if (!fn) {
    const values = Array.isArray(constants)
      ? constants
      : Object.values(constants);
    if (values.length <= end - start) {
      throw new Error(
        `Row has no function, but less constants than intervals.`
      );
    } else if (values.some(value => value === undefined)) {
      throw new Error(`Row has no function, but undefined constants.`);
    }
  }
  if (Array.isArray(constants)) {
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
    const endDefaultArray = Array(maxInterval - end).fill(defaultValue);
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

  Object.keys(constants).forEach(key => {
    if (Number.isNaN(Number.parseInt(key))) {
      throw new Error(`Constant key '${key}' must be an integer.`);
    } else if (key > end) {
      throw new Error(`Constant index ${key} must be ${end} or less.`);
    } else if (key < start) {
      throw new Error(`Constant index ${key} must be ${start} or more.`);
    }
  });
  const rowConstants = existingConstants || [
    ...Array(start).fill(defaultValue),
    ...Array(end + 1 - start),
    ...Array(maxInterval - end).fill(defaultValue)
  ];
  const startInterval = Object.entries(constants).reduce(
    (min, [index, value]) => {
      rowConstants[index] = value;
      return index < min ? index : min;
    },
    existingConstants ? maxInterval : start
  );
  return {
    rowConstants,
    startInterval,
    endInterval: end
  };
};

module.exports = prepareRowConstants;
