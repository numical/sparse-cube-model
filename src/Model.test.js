const { test, only } = require("tap");
const Model = require('./Model');
const identity = require('./fns/identity');

const generateSequenceArray = length => Array.from({ length }, (_, i) => i );

test("Model creation", t => {
  const { get, set, unset } = new Model();
  t.type(get, 'function');
  t.type(set, 'function');
  t.type(unset, 'function');
  t.end();
});

only("Set and get a single number", t => {
  const { get, set, debug } = new Model();
  const value = 102;
  set(1,2, value);
  t.equals(get(1,2), value);
  t.end();
});

only("Set and get a single function", t => {
  const { get, set, debug } = new Model();
  const value = { foo: 'bar' };
  const fn = identity(value);
  set(1,2, fn);
  t.equals(get(1,2), value);
  t.end();
});

test( "set and get multiple numbers in single dimension", t => {
  const { get, set } = new Model();
  const indices =  generateSequenceArray(10);
  const value = 345;
  set(indices, 0, value);
  indices.forEach(index => {
    t.equals(get(index, 0), value);
  })
  t.end();
});

test( "set and get multiple functions in single dimension", t => {
  const { get, set } = new Model();
  const indices =  generateSequenceArray(10);
  const value = { foo: 'bar' };
  const fn = identity( value);
  set(indices, 0, fn);
  indices.forEach(index => {
    t.equals(get(index, 0), value);
  })
  t.end();
});

test( "set and get multiple numbers in three dimensions", t => {
  const { get, set } = new Model();
  const indices =  generateSequenceArray(10);
  const value = 78;
  set(indices, indices, indices, value);
  indices.forEach(x => {
    indices.forEach(y => {
      indices.forEach(z => {
        t.equals(get(x, y, z), value);
      })
    })
  });
  t.end();
});

test( "set and get multiple functions in three dimensions", t => {
  const { get, set } = new Model();
  const indices =  generateSequenceArray(10);
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

test("set only accepts functions and numbers", t => {
  const { get, set } = new Model();
  set(0, 1, 2, () => 2);
  set(0,1, 2,4);
  t.throws( () => set(0,1,2, 'hello'), "'hello' is not a function");
  t.throws( () => set(0,1,2, {}), "'[object Object]' is not a function");
  t.end();
});

test("returns 0 for unset value", t => {
  const { get } = new Model();
  t.equals(get(0,1,2), 0);
  t.end();
});

test('unset works for a single element', t => {
  const { get, set, unset } = new Model();
  set(10, 20, 30, 40);
  t.equals(get(10,20,30), 40);
  unset(10, 20, 30);
  t.equals(get(10,20,30), 0);
  t.end();
});

test('unset defaults z value', t => {
  const { get, set, unset } = new Model();
  set(10, 20, 0, 40);
  t.equals(get(10,20,0), 40);
  unset(10, 20);
  t.equals(get(10,20,30), 0);
  t.end();
});

only('unset works for a multiple elements', t => {
  const { get, set, unset } = new Model();
  const indices =  generateSequenceArray(10);
  const fn = () => 'wibble';
  set(indices, indices, indices, fn);
  indices.forEach(x => {
    indices.forEach(y => {
      indices.forEach(z => {
        t.equals(get(x, y, z), 'wibble');
      })
    })
  });
  unset(indices, indices, indices);
  indices.forEach(x => {
    indices.forEach(y => {
      indices.forEach(z => {
        t.equals(get(x, y, z), 0);
      })
    })
  });
  t.end();
});

test('does not override a constant value', t => {
  const { get, set, unset } = new Model();
  const value = 5
  set(1,1,1, value);
  t.notOk(set(1, 1, 1, () => 'wibble'));
  t.equal(get(1, 1, 1), value);
  t.end();
});
