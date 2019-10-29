const { test } = require("tap");
const Sparse3DArray = require('./Sparse3DArray');

test("Array creation", t => {
  const { get, set, unset } = new Sparse3DArray();
  t.type(get, 'function');
  t.type(set, 'function');
  t.type(unset, 'function');
  t.end();
});

test("Empty array", t => {
  const { get } = new Sparse3DArray();
  t.type(get(), 'undefined');
  t.type(get(0), 'undefined');
  t.type(get(0, 0), 'undefined');
  t.type(get(0, 0, 0), 'undefined');
  t.type(get(10, 10, 10), 'undefined');
  t.end();
});

test("Single value at (0,0,0)", t => {
  const { get, set } = new Sparse3DArray();
  const value = {};
  t.equal(set(0, 0, value), value);
  t.equal(get(0, 0), value);
  t.equal(get(0,0, 0), value);
  t.type(get(0), 'undefined');
  t.type(get(0, 1), 'undefined');
  t.type(get(0, 0, 1), 'undefined');
  t.end();
});

test("Single value at (10,10,10)", t => {
  const { get, set } = new Sparse3DArray();
  const value = { foo: 'bar'};
  t.equal(set(10, 10, 10, value), value);
  t.equal(get(10, 10, 10), value);
  t.type(get(10, 10, 0), 'undefined');
  t.type(get(10, 0, 10), 'undefined');
  t.type(get(10, 0, 0), 'undefined');
  t.type(get(0, 0, 0), 'undefined');
  t.end();
});

test("Reset single value)", t => {
  const { get, set } = new Sparse3DArray();
  const values = {};
  [1,2].forEach( value => values[value] = { value });
  t.equal(set(5, 5, 5, values[1]), values[1]);
  t.equal(get(5, 5, 5), values[1]);
  t.equal(set(5, 5, 5, values[2]), values[2]);
  t.equal(get(5, 5, 5), values[2]);
  t.end();
});

test("Unset undefined does nothing", t => {
  const { get, set, unset } = new Sparse3DArray();
  unset(5, 5);
  t.type(get(5,5), 'undefined');
  t.end();
});

test("Unset", t => {
  const { get, set, unset } = new Sparse3DArray();
  const value = {};
  set(5,5, value);
  t.equal(get(5,5,0), value);
  unset(5, 5);
  t.type(get(5,5), 'undefined');
  t.end();
});

