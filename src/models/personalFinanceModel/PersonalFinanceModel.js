const InteractiveModel = require("../interactiveModel/InteractiveModel");
const serializer = require("../model/serializer");

class PersonalFinanceModel extends InteractiveModel {
  static parse([model, personal], fnsRepo) {
    const meta = serializer.parse(model, fnsRepo);
    const { serialisedKeyMap, products } = serializer.parse(personal, fnsRepo);
    const keyMap = serializer.parse(serialisedKeyMap, fnsRepo);
    return new PersonalFinanceModel(meta, keyMap, products);
  }

  #products;

  constructor(meta, keyMap, products = {}) {
    super(meta, keyMap);
    this.#products = products;
  }

  addSavings() {
    // TODO
  }

  stringify(args) {
    const [model, map] = super.stringify(args);
    const personal = serializer.stringify(
      { serialisedKeyMap: map, products: this.#products },
      { ...args, replacer: null }
    );
    return [model, personal];
  }
}

module.exports = PersonalFinanceModel;
