const mapKey = (fromMap, type, doNotMap, key, callMappings) => {
  if (key) {
    if (key === doNotMap) {
      return key;
    } else if (Array.isArray(key)) {
      return key.map(key => mapKey(fromMap, type, doNotMap, key, callMappings));
    } else if (typeof key === "object") {
      return Object.entries(key).reduce((mapped, [key, value]) => {
        // keep unmapped values for error messages
        mapped[key] = fromMap[type][value] ? fromMap[type][value] : value;
        return mapped;
      }, {});
    } else {
      const mapped = fromMap[type][key];
      if (!mapped) {
        throw new Error(`Unknown ${type} '${key}'`);
      }
      if (callMappings) {
        callMappings[mapped] = key;
      }
      return mapped;
    }
  }
};

module.exports = mapKey;
