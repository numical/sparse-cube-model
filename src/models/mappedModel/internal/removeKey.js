const removeKey = (fromMap, toMap, type, key, callMappings) => {
  const mapped = fromMap[type][key];
  delete fromMap[type][key];
  delete toMap[type][mapped];
  callMappings[mapped] = key;
};

module.exports = removeKey;
