const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.Waterwheel = requireSubvert.require('../lib/waterwheel');
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('Waterwheel Creation', t => {
  t.plan(1);

  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.is(true, waterwheel instanceof t.context.Waterwheel, 'Unexpected creation.');
});

test('Create New Entity Query', t => {
  t.plan(1);
  const Query = requireSubvert.require('../lib/resources/entityQuery');
  const Waterwheel = requireSubvert.require('../lib/waterwheel');
  const waterwheel = new Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});

  waterwheel.api.query('node');

  t.is(true, waterwheel.api.query instanceof Function ,'Unexpected creation.');
});

test('Get URL Base', t => {
  t.plan(2);
  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.is('http://foo.dev', waterwheel.api.content.getBase(), 'Unexpected URL base.');

  waterwheel.api.content.setBase('http://foo2.dev');
  t.is('http://foo2.dev', waterwheel.api.content.getBase(), 'URL base was not set correctly.');
});

test('Get Credentials', t => {
  t.plan(2);

  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.deepEqual({user: 'a', pass: 'b'}, waterwheel.api.content.getCredentials(), 'Unexpected credentials.');

  waterwheel.api.content.setCredentials({user: 'c', pass: 'd'});
  t.deepEqual({user: 'c', pass: 'd'}, waterwheel.api.content.getCredentials(), 'Credentials object was not set correctly.');
});

test('Add Resources', t => {
  t.plan(3);

  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});

  waterwheel.addResources({a: {paths: {get: 'ok'}}});
  t.is(true, waterwheel.api.hasOwnProperty('a'), 'Resource not added.');

  waterwheel.addResources({b: {base: 'http://foo2.dev', credentials: {user: 'c', pass: 'd'}, paths: {get: 'ok'}}});
  t.is(true, waterwheel.api.hasOwnProperty('b'), 'Resource not added.');

  waterwheel.addResources('c');
  t.deepEqual(['content','comment','contentType','file','menu','taxonomyTerm','taxonomyVocabulary','user','query','a','b'], waterwheel.getResources(), 'Bad resource was added.');
});

test('List Resources', t => {
  t.plan(1);

  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.deepEqual(Object.keys(waterwheel.api), waterwheel.getResources(), 'Unexpected resources returned.');
});

test('Delete Resources', t => {
  t.plan(3);

  const waterwheel = new t.context.Waterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  waterwheel.removeResources('content');

  t.deepEqual(['comment','contentType','file','menu','taxonomyTerm','taxonomyVocabulary','user','query'], waterwheel.getResources(), 'Resource not deleted.');

  waterwheel.removeResources(['contentType', 'menu']);
  t.deepEqual(['comment','file','taxonomyTerm','taxonomyVocabulary','user','query'], waterwheel.getResources(), 'Resource not deleted.');

  waterwheel.removeResources('c');
  t.deepEqual(['comment','file','taxonomyTerm','taxonomyVocabulary','user','query'], waterwheel.getResources());
});
