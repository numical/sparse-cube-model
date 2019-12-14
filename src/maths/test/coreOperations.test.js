const { test } = require("tap");
const { add, subtract, multiply, divide, power } = require("../coreOperations");

test("trivial add", t => {
  t.same(add(3, 2), 5);
  t.end();
});

test("trivial subtract", t => {
  t.same(subtract(3, 2), 1);
  t.end();
});

test("trivial multiply", t => {
  t.same(multiply(3, 2), 6);
  t.end();
});

test("trivial divide", t => {
  t.same(divide(3, 2), 1.5);
  t.end();
});

test("trivial power", t => {
  t.same(power(3, 2), 9);
  t.end();
});
