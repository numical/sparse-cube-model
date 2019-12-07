const defaultValue = require("./defaultValue");

const prepareRowConstants = ({
  fn,
  constants,
  start = 0,
  end,
  maxInterval,
  existingConstants
}) => {
  if (!end) {
    end = maxInterval;
  }
  if (!fn && !constants) {
    throw new Error("No function or constants passed.");
  }
  if (fn && !fn.key) {
    throw new Error(`function '${fn.name}' must have a 'key' property.`);
  }
  if (!constants) {
    const rowConstants =
      end < maxInterval
        ? Array(maxInterval + 1)
        : start > 0
        ? Array(start)
        : [];
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
  const isArray = Array.isArray(constants);
  if (!fn) {
    const values = isArray
      ? constants
      : constants instanceof Map
      ? Array.from(constants.values())
      : Object.values(constants);
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
  const keys =
    constants instanceof Map
      ? Array.from(constants.keys())
      : Object.keys(constants);
  keys.forEach(key => {
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
  const entries =
    constants instanceof Map
      ? Array.from(constants.entries())
      : Object.entries(constants);
  const startInterval = entries.reduce(
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
