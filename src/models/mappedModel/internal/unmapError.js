const unmapMessage = (fromMap, callMappings, message) =>
  Object.entries(fromMap).reduce(
    (message, [key, mapped]) => message.replace(mapped, key),
    Object.entries(callMappings).reduce(
      (message, [mapped, key]) => message.replace(mapped, key),
      message
    )
  );

const unmapError = (fromMap, fn) => {
  const callMappings = {};
  try {
    return fn(callMappings);
  } catch (error) {
    error.message = unmapMessage(fromMap, callMappings, error.message);
    throw error;
  }
};

module.exports = unmapError;
