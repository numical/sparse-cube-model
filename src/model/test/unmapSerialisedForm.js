const serializer = require("../util/serializer");

const unmapSerialisedForm = ([serializedModel, serializedMap]) => {
  const { row, scenario } = serializer.parse(serializedMap);
  const all = { ...row, ...scenario };
  return Object.entries(all).reduce((unmapped, [key, value]) => {
    return serializedModel.replace(value, key);
  }, serializedModel);
};

module.exports = unmapSerialisedForm;
