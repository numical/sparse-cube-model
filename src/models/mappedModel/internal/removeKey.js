const removeKey = (fromMap, toMap, type, key, callMappings) => {
  if (Array.isArray(key)) {
    key.map(key => removeKey(fromMap, toMap, type, key, callMappings));
  } else {
    const mapped = fromMap[type][key];
    delete fromMap[type][key];
    delete toMap[type][mapped];
    callMappings[mapped] = key;
  }
};

module.exports = removeKey;
