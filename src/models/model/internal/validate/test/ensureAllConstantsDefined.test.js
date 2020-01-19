const { test } = require("tap");
const ensureAllConstantsDefined = require("../ensureAllConstantsDefined");

const intervals = {
  count: 2
};

test("ensureAllConstantsDefined passes for dense array", t => {
  const constants = [1, 2, 3];
  t.doesNotThrow(() => ensureAllConstantsDefined(constants, intervals));
  t.end();
});

test("ensureAllConstantsDefined fails for sparse array", t => {
  const constants = [1, undefined, 3];
  t.throws(
    () => ensureAllConstantsDefined(constants, intervals),
    new Error("Row has no function, but less constants than intervals.")
  );
  t.end();
});

test("ensureAllConstantsDefined passes for dense dictionary", t => {
  const constants = {
    0: 1,
    1: 2,
    2: 3
  };
  t.doesNotThrow(() => ensureAllConstantsDefined(constants, intervals));
  t.end();
});

test("ensureAllConstantsDefined fails for sparse dictionary", t => {
  const constants = {
    0: 1,
    1: 2,
    2: undefined
  };
  t.throws(
    () => ensureAllConstantsDefined(constants, intervals),
    new Error("Row has no function, but less constants than intervals.")
  );
  t.end();
});

test("ensureAllConstantsDefined passes for dense dictionary", t => {
  const constants = new Map();
  constants.set(0, 1);
  constants.set(1, 2);
  constants.set(2, 3);
  t.doesNotThrow(() => ensureAllConstantsDefined(constants, intervals));
  t.end();
});

test("ensureAllConstantsDefined fails for sparse dictionary", t => {
  const constants = new Map();
  constants.set(0, 1);
  constants.set(1, 2);
  constants.set(2, undefined);
  t.throws(
    () => ensureAllConstantsDefined(constants, intervals),
    new Error("Row has no function, but less constants than intervals.")
  );
  t.end();
});
