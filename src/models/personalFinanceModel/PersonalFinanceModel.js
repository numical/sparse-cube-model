const InteractiveModel = require("../interactiveModel/InteractiveModel");
const inflation = require("./internal/inflation");
const savings = require("./internal/savings");
const serializer = require("../model/serializer");

class PersonalFinanceModel extends InteractiveModel {
  static parse([model, personal], fnsRepo) {
    const meta = serializer.parse(model, fnsRepo);
    const { serialisedKeyMap, products } = serializer.parse(personal, fnsRepo);
    const keyMap = serializer.parse(serialisedKeyMap, fnsRepo);
    return new PersonalFinanceModel(meta, keyMap, products);
  }

  #products;

  constructor(meta, keyMap, products = []) {
    super(meta, keyMap);
    this.#products = products;
  }

  setInflation(rate) {
    inflation.set(this, rate);
  }

  addSavings(args = {}) {
    savings.checkMandatoryFields(args);
    const { name } = args;
    const productIndex = this.#products.push(name) - 1;
    savings.add({ model: this, productIndex, ...args });
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
