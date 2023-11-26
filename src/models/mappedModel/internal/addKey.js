const { nanoid } = require("nanoid/non-secure");
const mappingGenerator = nanoid.bind(null, 10);

const addKey = (fromMap, toMap, type, doNotMap, key, callMappings) => {
  if (!key) {
    throw new Error(`A ${type} key is required.`);
  } else if (fromMap[type][key]) {
    const mapped = fromMap[type][key];
    callMappings[mapped] = key;
    return mapped;
  } else {
    const mapped = key === doNotMap ? key : mappingGenerator();
    fromMap[type][key] = mapped;
    toMap[type][mapped] = key;
    callMappings[mapped] = key;
    return mapped;
  }
};

module.exports = addKey;
