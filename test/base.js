const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);
const entityTypes = require('./sample/entity.types.json');

test.beforeEach(t => {
  t.context.Waterwheel = requireSubvert.require('../lib/waterwheel');
  t.context.methods = {
    'GET': '/comment/{comment}',
    'POST': '/entity/comment',
    'DELETE': '/comment/{comment}',
    'PATCH': '/comment/{comment}'
  };
  t.context.credentials = {oauth: '123456'};
  t.context.base = 'http://foo.dev';
  t.context.options = '/entity/types/comment/{bundle}';
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('Waterwheel Creation', t => {
  t.plan(1);

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  t.is(true, waterwheel instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Waterwheel Creation - Missing informations', t => {
  t.plan(3);

  t.throws(() => new t.context.Waterwheel(null, {oauth: '12345'}), 'Missing base path.');
  t.throws(() => new t.context.Waterwheel(null, {oauth: '12345'}, {}), 'Missing base path.');
  t.throws(() => new t.context.Waterwheel('http://foo.dev', {foo: 'bar'}, {}), 'Incorrect authentication method.');
});

test('Waterwheel Creation - Create with resources', t => {
  t.plan(1);
  const waterwheel = new t.context.Waterwheel('http://foo.dev', {oauth: '123456'}, entityTypes);
  t.is(true, waterwheel instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Get URL Base', t => {
  t.plan(2);
  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.content = new Entity(t.context.base, t.context.credentials, t.context.methods,'', '', t.context.options);

  t.is(t.context.base, waterwheel.api.content.getBase(), 'Unexpected URL base.');

  waterwheel.api.content.setBase('http://foo2.dev');
  t.is('http://foo2.dev', waterwheel.api.content.getBase(), 'URL base was not set correctly.');
});

test('Get Credentials', t => {
  t.plan(2);

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.fakeEntity = new Entity(t.context.base, t.context.credentials, t.context.methods,'', '', t.context.options);

  t.deepEqual(t.context.credentials, waterwheel.api.fakeEntity.getCredentials(), 'Unexpected credentials.');

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
  t.deepEqual({oauth: '987654321'}, waterwheel.api.fakeEntity.getCredentials(), 'Credentials object was not set correctly.');

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
});

test('Set Bad Credentials', t => {
  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.fakeEntity = new Entity(t.context.base, t.context.credentials, t.context.methods,'', '', t.context.options);

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
  t.throws(() => waterwheel.api.fakeEntity.setCredentials({foo: 'bar'}), 'Incorrect authentication method.');
});

test('Add Resources', t => {
  t.plan(2);

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  waterwheel.addResources(
    {comment: {
      base: t.context.base,
      credentials: t.context.credentials,
      methods: t.context.methods,
      entityType: 'comment',
      bundle: 'comment',
      options: t.context.options
    },
    article: {
      base: false,
      credentials: null,
      methods: t.context.methods,
      entityType: 'comment',
      bundle: 'comment',
      options: t.context.options
    }}
  );

  t.truthy(waterwheel.addResources() instanceof Error, 'Error not returned.');
  t.deepEqual(waterwheel.getAvailableResources(), ['article', 'comment'], 'Entity not added correctly.');
});

test('getAvailableResources',t => {
  t.plan(1);

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.node = {
    article: new Entity(t.context.base, t.context.credentials, t.context.methods, 'node', 'article', t.context.options),
    page: new Entity(t.context.base, t.context.credentials, t.context.methods, 'node', 'page', t.context.options)
  };
  t.deepEqual(waterwheel.getAvailableResources(), ['node.article', 'node.page'], 'Entity not added correctly.');
});

test.cb('Fetch Resources', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'resourceSuccess'})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  waterwheel.fetchResources()
    .then(res => {
      t.is(res, 'resourceSuccess', 'Unexpected value returned.');
      t.end();
    });
});

test.cb('Populate Resources', t => {
  t.plan(1);

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  waterwheel.fetchResources = () => Promise.resolve(entityTypes);

  waterwheel.populateResources()
    .then(res => {
      t.deepEqual(
        res,
        [
          'comment',
          'file',
          'menu',
          'node.article',
          'node.page',
          'node_type.content_type',
          'taxonomy_term.tags',
          'taxonomy_vocabulary',
          'user'
        ],
        'Unexpected Response.');
      t.end();
    });
});

test('Fetch Embedded - Missing _embedded key', t => {
  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  return waterwheel.fetchEmbedded({})
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded - Missing response', t => {
  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  return waterwheel.fetchEmbedded()
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON)
    .then(res =>{
      t.is(res.length, 4);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});

test('Fetch Embedded - Single Field', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON, 'field_actor')
    .then(res =>{
      t.is(res.length, 3);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});

test('Fetch Embedded - Multiple Fields', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.base, t.context.credentials);
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON, ['field_actor', 'revision_uid'])
    .then(res =>{
      t.is(res.length, 4);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});
