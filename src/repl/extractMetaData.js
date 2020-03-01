/* istanbul ignore file */

/*
 Note: uses internal knowledge of Model serialization and metadata structure.
 */

const { invertObj } = require("ramda");
const { defaultScenario } = require("../models/model/modelMetadata");
const MappedModel = require("../models/mappedModel/MappedModel");
const PersonalFinanceModel = require("../models/personalFinanceModel/PersonalFinanceModel");

const extractModelMetaData = (model, scenarioKey) => {
  const serialized = model.stringify();
  const meta = JSON.parse(serialized);
  const { intervals, scenarios } = meta;
  const rowKeys = Object.keys(scenarios[scenarioKey].rows);
  return { intervals, rowKeys, scenarios };
};

const extractMappedModelMetaData = (model, scenarioKey) => {
  const serialized = model.stringify();
  const meta = JSON.parse(serialized[0]);
  const map = JSON.parse(serialized[1]);
  const rowMap = invertObj(map.row);
  const scenarioMap = invertObj(map.scenario);
  const { intervals, scenarios } = meta;
  const scenario =
    scenarioKey === defaultScenario
      ? scenarios[defaultScenario]
      : scenarios[scenarioMap[scenarioKey]];
  const rowKeys = Object.keys(scenario.rows).map(key => rowMap[key]);
  return { intervals, rowKeys, scenarios };
};

const extractPersonalFinanceModelMetaData = (model, scenarioKey) => {
  const serialized = model.stringify();
  const meta = JSON.parse(serialized[0]);
  const pfm = JSON.parse(serialized[1]);
  const map = JSON.parse(pfm.serialisedKeyMap);
  const rowMap = invertObj(map.row);
  const scenarioMap = map.scenario;
  const { intervals, scenarios } = meta;
  const scenario =
    scenarioKey === defaultScenario
      ? scenarios[defaultScenario]
      : scenarios[scenarioMap[scenarioKey]];
  const rowKeys = Object.keys(scenario.rows).map(key => rowMap[key]);
  return { intervals, rowKeys, scenarios };
};

const extractMetaData = (model, scenarioKey = defaultScenario) =>
  model instanceof PersonalFinanceModel
    ? extractPersonalFinanceModelMetaData(model, scenarioKey)
    : model instanceof MappedModel
    ? extractMappedModelMetaData(model, scenarioKey)
    : extractModelMetaData(model, scenarioKey);

module.exports = extractMetaData;
