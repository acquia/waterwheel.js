const test = require('ava');
let requireSubvert = require('require-subvert')(__dirname);

test.afterEach.cb(t => {
  requireSubvert.cleanUp();
  t.end();
});

// Creation
test.cb('Creation', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  t.is(entityQuery instanceof EntityQuery, true, 'Incorrect creation');
  t.end();
});

// Request
test.cb('Request', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'foo'})
  ));

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.get()
    .then(res => {
      t.is('foo', res, 'Unexpected body returned.');
      t.end();
    });
});

test.cb('Range', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.range(0, 5);

  t.is('range[start]=0&range[length]=5', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
  t.end();

});

test.cb('Contion', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.condition('field_foo', 'bar');

  t.is('condition_0[field]=field_foo&condition_0[value]=bar&condition_0[operator]=EQ', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
  t.end();

});

test.cb('Sort', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.sort('ASC');

  t.is('sort_0[field]=ASC&sort_0[direction]=ASC', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
  t.end();

});

test.cb('Exists', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.exists('foo');

  t.is('exists_0[field]=foo&exists_0[condition]=TRUE', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
  t.end();

});

test.cb('Not Exists', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.notExists('foo');

  t.is('exists_0[field]=foo&exists_0[condition]=FALSE', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
  t.end();

});

test.cb('AND Condition Group', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.andConditionGroup();

  t.deepEqual({type: 'group', conjunction: 'AND', children: []}, entityQuery.andConditionGroup(), 'Unexpected response.');
  t.end();

});

test.cb('OR Condition Group', t => {
  t.plan(1);

  const EntityQuery = requireSubvert.require('../lib/resources/entityQuery');
  const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

  entityQuery.andConditionGroup();

  t.deepEqual({type: 'group', conjunction: 'OR', children: []}, entityQuery.orConditionGroup(), 'Unexpected response.');
  t.end();
});
