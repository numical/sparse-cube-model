const R = require("ramda");
const { test, only } = require("tap");
const Model = require('./Model');

test("Model creation", t => {
  const { get, set, unset } = new Model();
  t.type(get, 'function');
  t.type(set, 'function');
  t.end();
});

test("Set and get a function", t => {
  const { get, set } = new Model();
  const value = {};
  const fn = () => value;
  set(1,2, fn);
  t.equals(get(1,2), value);
  t.end();
});


