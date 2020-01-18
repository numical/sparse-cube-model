const getModelVersion = require("./getModelVersion");

const parseToSemVer = version =>
  version.split(".").map(s => Number.parseInt(s, 10));

const isCompatible = (metaVersion, modelVersion) => {
  const meta = parseToSemVer(metaVersion);
  const model = parseToSemVer(modelVersion);
  return meta[0] === model[0] && meta[1] <= model[1];
};

const validateVersion = (metaVersion, modelVersion = getModelVersion()) => {
  if (metaVersion === modelVersion) {
    return;
  } else if (isCompatible(metaVersion, modelVersion)) {
    return;
  } else {
    throw new Error(
      `Model version ${modelVersion} cannot understand data version ${metaVersion}.`
    );
  }
};

module.exports = validateVersion;
