const serializer = require("../../model/internal/serializer");

const comparableUnserialisedForm = ({ model, ignoreIndex = false }) => {
  const [serializedModel, serializedMap] = model.stringify();
  const { row, scenario } = serializer.parse(serializedMap);
  const all = { ...row, ...scenario };
  const unserialised = JSON.parse(
    Object.entries(all).reduce((unmapped, [key, value]) => {
      return unmapped.replace(value, key);
    }, serializedModel)
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
