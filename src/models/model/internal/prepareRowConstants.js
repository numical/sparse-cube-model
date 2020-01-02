const defaultValue = require("./defaultValue");
const getIntervalFromDate = require("./getIntervalFromDate");

const validateConstantsType = constants => {
  if (Array.isArray(constants)) {
    return true;
  } else if (constants instanceof Map) {
    return true;
  } else if (typeof constants === "object") {
    return true;
  } else {
    throw new Error("Constants must be an array or a dictionary or a map.");
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
const mergeArrays = ({ constants, initial, start }) =>
  constants.reduce((array, value, key) => {
    if (value !== undefined) {
      array[key + start] = value;
    }
    return array;
  }, initial);

const convertDictionaryToArray = ({ constants, start, end, initial }) =>
  Object.entries(constants).reduce((array, [key, value]) => {
    const index = convertToIndex(key, start, end);
    array[index] = value;
    return array;
  }, initial);

const convertMapToArray = ({
  constants,
  start,
  end,
  calcIntervalFromDate,
  initial: array
}) => {
  for ([key, value] of constants.entries()) {
    if (key instanceof Date) {
      const index = calcIntervalFromDate(key);
      array[index] = array[index] ? array[index] + value : value;
    } else {
      const index = convertToIndex(key, start, end);
      array[index] = value;
    }
  }
  return array;
};

const prepareRowConstants = ({
  constants,
  existingConstants,
  start = 0,
  end,
  intervals
}) => {
  const maxInterval = intervals.count - 1;
  const calcIntervalFromDate = getIntervalFromDate(intervals);
  if (start instanceof Date) {
    start = calcIntervalFromDate(start);
  }
  if (end instanceof Date) {
    end = calcIntervalFromDate(end);
  } else if (!end) {
    end = maxInterval;
  }
  const initial =
    existingConstants || defaultValuesArray({ start, end, maxInterval });
  if (constants) {
    validateConstantsType(constants);
    const args = { constants, initial, start, end, calcIntervalFromDate };
    return Array.isArray(constants)
      ? mergeArrays(args)
      : constants instanceof Map
      ? convertMapToArray(args)
      : convertDictionaryToArray(args);
  } else {
    return initial;
  }
};

module.exports = prepareRowConstants;
