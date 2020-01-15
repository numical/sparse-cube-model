const InteractiveModel = require("../interactiveModel/InteractiveModel");
const serializer = require("../model/serializer");

class PersonalFinanceModel extends InteractiveModel {
  static parse([modelData, personalData], fnsRepo) {
    const modelMeta = serializer.parse(modelData, fnsRepo);
    const personalMeta = serializer.parse(personalData, fnsRepo);
    return new PersonalFinanceModel(modelMeta, personalMeta);
  }

  #products;

  constructor(modelMeta, personalMeta = {}) {
    const { keyMap, products = {} } = personalMeta;
    super(modelMeta, keyMap);
    this.#products = products;
  }

  addSavings() {
    // TODO
  }

  stringify(args) {
    const [modelData, keyMap] = super.stringify(args);
    const personalData = { keyMap, products: this.#products };
    return [modelData, personalData];
  }
}

module.exports = PersonalFinanceModel;
