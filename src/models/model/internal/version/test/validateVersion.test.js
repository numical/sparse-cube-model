const { test } = require("tap");
const validateVersion = require("../validateVersion");

test("passes if versions are the same", t => {
  const metaVersion = "0.2.1";
  const modelVersion = metaVersion;
  t.doesNotThrow(() => validateVersion(metaVersion, modelVersion));
  t.end();
});

test("fails if major versions are different - model higher", t => {
  const metaVersion = "1.0.0";
  const modelVersion = "2.0.0";
  t.throws(
    () => validateVersion(metaVersion, modelVersion),
    new Error("Model version 2.0.0 cannot understand data version 1.0.0.")
  );
  t.end();
});

test("fails if major versions are different - meta higher", t => {
  const metaVersion = "2.0.0";
  const modelVersion = "1.0.0";
  t.throws(
    () => validateVersion(metaVersion, modelVersion),
    new Error("Model version 1.0.0 cannot understand data version 2.0.0.")
  );
  t.end();
});

test("fails if meta minor version is higher", t => {
  const metaVersion = "1.2.0";
  const modelVersion = "1.1.0";
  t.throws(
    () => validateVersion(metaVersion, modelVersion),
    new Error("Model version 1.1.0 cannot understand data version 1.2.0")
  );
  t.end();
});

test("passes if meta minor version is lower", t => {
  const metaVersion = "0.2.1";
  const modelVersion = "0.3.0";
  t.doesNotThrow(() => validateVersion(metaVersion, modelVersion));
  t.end();
});

test("ignores patch if minor the same", t => {
  const metaVersion = "0.2.1";
  const modelVersion = "0.2.4";
  t.doesNotThrow(() => validateVersion(metaVersion, modelVersion));
  t.end();
});

test("ignores patch if meta minor version lower", t => {
  const metaVersion = "0.1.1";
  const modelVersion = "0.2.4";
  t.doesNotThrow(() => validateVersion(metaVersion, modelVersion));
  t.end();
});
