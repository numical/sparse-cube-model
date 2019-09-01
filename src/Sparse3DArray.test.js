const { test } = require("tap");
const Sparse3DArray = require('./Sparse3DArray');

test("Model creation", t => {
  const { element } = new Sparse3DArray();
  t.type(element, 'function');
  t.end();
});

test("Empty model", t => {
  const { element } = new Sparse3DArray();
  t.type(element(), 'undefined');
  t.type(element({}), 'undefined');
  t.type(element({x: 0}), 'undefined');
  t.type(element({y: 0}), 'undefined');
  t.type(element({z: 0}), 'undefined');
  t.type(element({x: 0, y: 0}), 'undefined');
  t.type(element({x: 0, y: 0, z: 0}), 'undefined');
  t.type(element({x: 10, y: 10, z: 10}), 'undefined');
  t.end();
});

test("Single value at (0,0,0)", t => {
  const { element } = new Sparse3DArray();
  const value = {};
  t.equal(element({x: 0, y:0}, value), value);
  t.equal(element({x: 0, y:0}), value);
  t.equal(element({x: 0, y:0, z:0 }), value);
  t.type(element({x: 0, y: 0, z: 1}), 'undefined');
  t.type(element({x: 0, y: 1, z: 0}), 'undefined');
  t.type(element({x: 1, y: 0, z: 0}), 'undefined');
  t.end();
});

test("Single value at (10,10,0)", t => {
  const { element } = new Sparse3DArray();
  const value = {};
  t.equal(element({x: 10, y:10}, value), value);
  t.equal(element({x: 10, y:10}), value);
  t.equal(element({x: 10, y:10, z:0 }), value);
  t.type(element({x: 0, y: 0, z: 0}), 'undefined');
  t.end();
});

