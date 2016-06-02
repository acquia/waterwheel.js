const test = require('ava');
let requireSubvert = require('require-subvert')(__dirname);

test.afterEach.cb(t => {
  requireSubvert.cleanUp();
  t.end();
});

// Get
test.cb('Get Success', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'getSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity('http://foo.dev', {user: 'b', pass: 'b'}, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'});

  entity.get(1, 'json')
    .then(res => {
      t.is('getSuccess', res, 'Unexpected response.');
      requireSubvert.cleanUp();
      t.end();
    });
});

// Set
test.cb('Set Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'setSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity('http://foo.dev', {user: 'a', pass: 'b'}, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'});

  entity.set(1, 'json', {foo: 'bar'})
    .then(function (res) {
      t.is('setSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});
test.cb('Set Non-Object Body', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'setNonObjectBody'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity('http://foo.dev', {user: 'a', pass: 'b'}, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'});

  entity.set(1, 'json', '')
    .then(res => {
      t.is('setNonObjectBody', res, 'Unexpected body returned.');
      t.end();
    });
});

// Create
test.cb('Create Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'createSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity('http://foo.dev', {user: 'a', pass: 'b'}, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'});

  entity.create('json', {foo: 'bar'})
    .then(res => {
      t.is('createSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});

// Delete
test.cb('Delete Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'deleteSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity('http://foo.dev', {user: 'a', pass: 'b'}, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'});

  entity.delete(1)
    .then(res => {
      t.is('deleteSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});
