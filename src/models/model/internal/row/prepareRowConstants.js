const { defaultValue } = require("../../modelMetadata");
const getIntervalFromDate = require("../date/getIntervalFromDate");

const validateConstantsType = constants => {
  if (Array.isArray(constants)) {
    return true;
  } else if (constants instanceof Map) {
    return true;
  } else if (typeof constants === "object") {
    return true;
  } else if (typeof constants === "number") {
    return true;
  } else {
    throw new Error(
      "Constants must be a number or an array or a dictionary or a map."
    );
  }
};

const convertToIndex = (key, start, end) => {
  const index = Number.parseInt(key);
  if (Number.isNaN(index)) {
    throw new Error(`Constant key '${key}' must be an integer.`);
  } else if (index > end) {
    throw new Error(`Constant index ${key} must be ${end} or less.`);
  } else if (index < start) {
    throw new Error(`Constant index ${key} must be ${start} or more.`);
  }
  return index;
};

const lowestIndex = array => {
  for (let index = 0; index < array.length; index++) {
    if (array[index] !== undefined) {
      return index;
    }
  }
};

const defaultValuesArray = ({ start, end, maxInterval }) => {
  const array = [];
  for (let i = 0; i < start; i++) {
    array[i] = defaultValue;
  }
  for (let i = end + 1; i <= maxInterval; i++) {
    array[i] = defaultValue;
  }
  return array;
};

/*
Two special cases here:
 - the 'start' is added as partial row addition assumes the array start there (absolute
   indices of dictionaries and maps do not)
 - undefined values do *not* overwite as this case occures only during patch operations
 */
const mergeArrays = ({ constants, initial, start, startInterval }) =>
  constants.reduce(
    ({ rowConstants, startInterval }, value, key) => {
      if (value !== undefined) {
        const index = key + start;
        if (index < startInterval) {
          startInterval = index;
        }
        rowConstants[key + start] = value;
      }
      return { rowConstants, startInterval };
    },
    { rowConstants: initial, startInterval }
  );

const convertDictionaryToArray = ({
  constants,
  start,
  end,
  initial,
  startInterval
}) =>
  Object.entries(constants).reduce(
    ({ rowConstants, startInterval }, [key, value]) => {
      const index = convertToIndex(key, start, end);
      if (index < startInterval) {
        startInterval = index;
      }
      rowConstants[index] = value;
      return { rowConstants, startInterval };
    },
    { rowConstants: initial, startInterval }
  );

const convertMapToArray = ({
  constants,
  start,
  end,
  calcIntervalFromDate,
  initial: rowConstants,
  startInterval
}) => {
  for ([key, value] of constants.entries()) {
    if (key instanceof Date) {
      const index = calcIntervalFromDate(key);
      if (index < startInterval) {
        startInterval = index;
      }
      rowConstants[index] = rowConstants[index]
        ? rowConstants[index] + value
        : value;
    } else {
      const index = convertToIndex(key, start, end);
      if (index < startInterval) {
        startInterval = index;
      }
      rowConstants[index] = value;
    }
  }
  return { rowConstants, startInterval };
};

const prepareRowConstants = ({
  constants,
  existingConstants,
  start = 0,
  end,
  intervals
}) => {
  const maxInterval = intervals.count;
  const calcIntervalFromDate = getIntervalFromDate(intervals);
  if (start instanceof Date) {
    start = calcIntervalFromDate(start);
  }
  if (end instanceof Date) {
    end = calcIntervalFromDate(end);
  } else if (!end) {
    end = maxInterval;
  }
  let initial;
  let startInterval;
  if (existingConstants) {
    initial = existingConstants;
    startInterval = lowestIndex(existingConstants);
  } else {
    initial = defaultValuesArray({ start, end, maxInterval });
    startInterval = start;
  }
  if (constants !== undefined) {
    validateConstantsType(constants);
    const args = {
      constants: typeof constants === "number" ? [constants] : constants,
      initial,
      startInterval,
      start,
      end,
      calcIntervalFromDate
    };
    return Array.isArray(constants)
      ? mergeArrays(args)
      : constants instanceof Map
      ? convertMapToArray(args)
      : convertDictionaryToArray(args);
  } else {
    // if no constants then function must non-null so must recalc from start
    return { rowConstants: initial, startInterval: 0 };
  }
};

module.exports = prepareRowConstants;
