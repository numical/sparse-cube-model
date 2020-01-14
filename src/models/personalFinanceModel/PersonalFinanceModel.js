const InteractiveModel = require("../interactiveModel/InteractiveModel");
const serializer = require("../model/serializer");

class PersonalFinanceModel extends InteractiveModel {
  static parse([serializedModel, serializedMap], fnsRepo) {
    const meta = serializer.parse(serializedModel, fnsRepo);
    const map = serializer.parse(serializedMap, fnsRepo);
    return new PersonalFinanceModel(meta, map);
  }

  addSavings() {
    // TODO
  }
}

module.exports = PersonalFinanceModel;
