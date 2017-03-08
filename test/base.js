const test = require('ava');
const rs = require('require-subvert')(__dirname);
const swaggerData = require('./sample/swagger.example.json');

test.beforeEach(t => {
  t.context.initData = {
    base: 'http://drupal.localhost',
    resources: swaggerData,
    oauth: {
      grant_type: 'password',
      client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
      client_secret: 'password',
      username: 'admin',
      password: 'password',
      scope: 'administrator'
    }
  };
  t.context.Waterwheel = rs.require('../lib/waterwheel');
});

test.afterEach(t => {
  rs.cleanUp();
});

test('Waterwheel Creation', t => {
  t.is(true, new t.context.Waterwheel(t.context.initData) instanceof t.context.Waterwheel, 'Unexpected creation.');

  delete t.context.initData.resources;
  t.is(true, new t.context.Waterwheel(t.context.initData) instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Waterwheel Creation - No Validation', t => {

  t.is(true, new t.context.Waterwheel({
    base: 'http://drupal.localhost',
    validation: false
  }) instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Get URL Base', t => {
  const waterwheel = new t.context.Waterwheel(t.context.initData);
  t.is(t.context.initData.base, waterwheel.getBase(), 'Unexpected URL base.');

  waterwheel.setBase('http://foo2.dev');
  t.is('http://foo2.dev', waterwheel.getBase(), 'URL base was not set correctly.');
});

test('getAvailableResources',t => {
  const waterwheel = new t.context.Waterwheel(t.context.initData);
  t.deepEqual(waterwheel.getAvailableResources(), ['node:article','node:page', 'user'], 'Entity not added correctly.');
});

test.cb('Populate Resources', t => {
  rs.subvert('../lib/helpers/oauth', rs.require('./stubs/oauth'));

  rs.subvert('axios', () => {
    return Promise.resolve({data: swaggerData});
  });

  const Waterwheel = rs.require('../lib/waterwheel');
  const waterwheel = new Waterwheel(t.context.initData);

  waterwheel.populateResources('/swagger')
    .then(() => {
      t.deepEqual(waterwheel.getAvailableResources(), ['node:article','node:page', 'user']);
      t.end();
    });
});

test('Fetch Embedded - Missing embedded key', t => {
  const waterwheel = new t.context.Waterwheel(t.context.initData);
  return waterwheel.fetchEmbedded({})
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded - Missing response', t => {
  const waterwheel = new t.context.Waterwheel(t.context.initData);
  return waterwheel.fetchEmbedded()
    .catch(err =>{
      t.is(err, 'This is probably not HAL+JSON');
    });
});

test('Fetch Embedded', t => {
  rs.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.initData);
  return waterwheel.fetchEmbedded(require('./sample/hal.example.json'))
    .then(res =>{
      t.is(res.length, 4);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});

test('Fetch Embedded - Single Field', t => {
  rs.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.initData);
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON, 'field_actor')
    .then(res =>{
      t.is(res.length, 3);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});

test('Fetch Embedded - Multiple Fields', t => {
  rs.subvert('axios', () => (
    Promise.resolve({data: {halExample: 'Some HAL+JSON'}})
  ));

  const waterwheel = new t.context.Waterwheel(t.context.initData);
  const halJSON = require('./sample/hal.example.json');
  return waterwheel.fetchEmbedded(halJSON, ['field_actor', 'revision_uid'])
    .then(res =>{
      t.is(res.length, 4);
      t.deepEqual(res[1], {halExample: 'Some HAL+JSON'});
    });
});
