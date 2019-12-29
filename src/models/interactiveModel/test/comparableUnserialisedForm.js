const serializer = require("../../model/internal/serializer");

const replaceAll = (s, toReplace, replaceWith) => {
  while (s.indexOf(toReplace) > -1) {
    s = s.replace(toReplace, replaceWith);
  }
  return s;
};

const comparableUnserialisedForm = ({ model, ignoreIndex = false }) => {
  const [serializedModel, serializedMap] = model.stringify();
  const { row, scenario } = serializer.parse(serializedMap);
  const all = { ...row, ...scenario };
  const unserialised = JSON.parse(
    Object.entries(all).reduce(
      (unmapped, [key, value]) => replaceAll(unmapped, value, key),
      serializedModel
    )
  );
  if (ignoreIndex) {
    Object.values(unserialised.scenarios).forEach(scenario => {
      delete scenario.index;
      Object.values(scenario.rows).forEach(row => {
        delete row.index;
      });
    });
  }
  return unserialised;
};

module.exports = comparableUnserialisedForm;
