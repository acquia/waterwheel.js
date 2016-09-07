const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);
const entityTypes = require('./sample/entity.types.json');

test.beforeEach(t => {
  t.context.Waterwheel = requireSubvert.require('../lib/waterwheel');
  t.context.options = {
    base: 'http://foo.dev',
    credentials: {oauth: '123456'},
    methods: {
      'GET': '/comment/{comment}',
      'POST': '/entity/comment',
      'DELETE': '/comment/{comment}',
      'PATCH': '/comment/{comment}'
    },
    more: '/entity/types/comment/{bundle}'
  };
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('Waterwheel Creation', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  t.is(true, waterwheel instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Waterwheel Creation - Missing information', t => {
  t.throws(() => new t.context.Waterwheel({credentials: {oauth: '12345'}}), 'Missing base path.');
  t.throws(() => new t.context.Waterwheel({base: 'http://foo.dev'}), 'Missing credentials.');
  t.throws(() => new t.context.Waterwheel({base: 'http://foo.dev', credentials: {foo: 'bar'}, resources: {}}), 'Incorrect authentication method.');
});

test('Waterwheel Creation - Create with resources', t => {
  const waterwheel = new t.context.Waterwheel({base: 'http://foo.dev', credentials: {oauth: '123456'}, resources: entityTypes});
  t.is(true, waterwheel instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Get URL Base', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.content = new Entity(t.context.options);

  t.is(t.context.options.base, waterwheel.api.content.getBase(), 'Unexpected URL base.');

  waterwheel.api.content.setBase('http://foo2.dev');
  t.is('http://foo2.dev', waterwheel.api.content.getBase(), 'URL base was not set correctly.');
});

test('Get Credentials', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.fakeEntity = new Entity(t.context.options);

  t.deepEqual(t.context.options.credentials, waterwheel.api.fakeEntity.getCredentials(), 'Unexpected credentials.');

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
  t.deepEqual({oauth: '987654321'}, waterwheel.api.fakeEntity.getCredentials(), 'Credentials object was not set correctly.');

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
});

test('Set Bad Credentials', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});

  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.fakeEntity = new Entity(t.context.options);

  waterwheel.api.fakeEntity.setCredentials({oauth: '987654321'});
  t.throws(() => waterwheel.api.fakeEntity.setCredentials({foo: 'bar'}), 'Incorrect authentication method.');
});

test('Add Resources', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  waterwheel.addResources(
    {comment: {
      base: t.context.options.base,
      credentials: t.context.options.credentials,
      methods: t.context.options.methods,
      entity: 'comment',
      bundle: 'comment',
      options: t.context.options.options
    },
    article: {
      base: false,
      credentials: null,
      methods: t.context.options.methods,
      entity: 'comment',
      bundle: 'comment',
      options: t.context.options.options
    }}
  );

  t.truthy(waterwheel.addResources() instanceof Error, 'Error not returned.');
  t.deepEqual(waterwheel.getAvailableResources(), ['article', 'comment'], 'Entity not added correctly.');
});

test('getAvailableResources',t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  const Entity = requireSubvert.require('../lib/entity');
  waterwheel.api.node = {
    article: new Entity(t.context.options),
    page: new Entity(t.context.options)
  };
  t.deepEqual(waterwheel.getAvailableResources(), ['node.article', 'node.page'], 'Entity not added correctly.');
});

test.cb('Fetch Resources', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'resourceSuccess'})
  ));

  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  waterwheel.fetchResources()
    .then(res => {
      t.is(res, 'resourceSuccess', 'Unexpected value returned.');
      t.end();
    });
});

test.cb('Populate Resources', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
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
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  return waterwheel.fetchEmbedded({})
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded - Missing response', t => {
  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  return waterwheel.fetchEmbedded()
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
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

  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
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

  const waterwheel = new t.context.Waterwheel({base: t.context.options.base, credentials: t.context.options.credentials});
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON, ['field_actor', 'revision_uid'])
    .then(res =>{
      t.is(res.length, 4);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});
