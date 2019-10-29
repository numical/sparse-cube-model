const { test, only } = require("tap");
const Model = require('./Model');
const identity = require('./fns/identity');

test("Model creation", t => {
  const { get, set, unset } = new Model();
  t.type(get, 'function');
  t.type(set, 'function');
  t.end();
});

test("Set and get a single function", t => {
  const { get, set, debug } = new Model();
  const value = { foo: 'bar' };
  const fn = identity(value);
  set(1,2, fn);
  t.equals(get(1,2), value);
  t.end();
});

test( "set and get multiple functions in single dimension", t => {
  const { get, set } = new Model();
  const indices = new Array(10).map((_, index) => index);
  const value = { foo: 'bar' };
  const fn = identity( value);
  set(indices, 0, fn);
  indices.forEach(index => {
    t.equals(get(index, 0), value);
  })
  t.end();
});

test( "set and get multiple functions in three dimensions", t => {
  const { get, set } = new Model();
  const indices = Array.from({ length: 8 }, (_, index) => index );
  const value = { foo: 'bar' };
  const fn = identity( value);
  set(indices, indices, indices, fn);
  indices.forEach(x => {
    indices.forEach(y => {
      indices.forEach(z => {
        t.equals(get(x, y, z), value);
      })
    })
  });
  t.end();
});

test("returns 0 for unset value", t => {
  const { get } = new Model();
  t.equals(get(0,1,2), 0);
  t.end();
});

test("set only accepts a function", t => {
  const { get, set } = new Model();
  t.throws( () => set(1,2,3, 10), "'10' is not a function");
  t.end();
});
