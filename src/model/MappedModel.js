const Model = require("./Model");
const uuid = require("./uuid");
const modelMetadata = require("./modelMetadata");
const { defaultScenario } = modelMetadata;

class MappedModel extends Model {}

module.exports = MappedModel;
