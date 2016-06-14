const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.Whaterwheel = requireSubvert.require('../lib/whaterwheel');
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('Whaterwheel Creation', t => {
  t.plan(1);

  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.is(true, whaterwheel instanceof t.context.Whaterwheel, 'Unexpected creation.');
});

test('Create New Entity Query', t => {
  t.plan(1);
  const Query = requireSubvert.require('../lib/resources/entityQuery');
  const Whaterwheel = requireSubvert.require('../lib/whaterwheel');
  const whaterwheel = new Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});

  whaterwheel.api.query('node');

  t.is(true, whaterwheel.api.query instanceof Function ,'Unexpected creation.');
});

test('Get URL Base', t => {
  t.plan(2);
  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.is('http://foo.dev', whaterwheel.api.content.getBase(), 'Unexpected URL base.');

  whaterwheel.api.content.setBase('http://foo2.dev');
  t.is('http://foo2.dev', whaterwheel.api.content.getBase(), 'URL base was not set correctly.');
});

test('Get Credentials', t => {
  t.plan(2);

  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.deepEqual({user: 'a', pass: 'b'}, whaterwheel.api.content.getCredentials(), 'Unexpected credentials.');

  whaterwheel.api.content.setCredentials({user: 'c', pass: 'd'});
  t.deepEqual({user: 'c', pass: 'd'}, whaterwheel.api.content.getCredentials(), 'Credentials object was not set correctly.');
});

test('Add Resources', t => {
  t.plan(3);

  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});

  whaterwheel.addResources({a: {paths: {get: 'ok'}}});
  t.is(true, whaterwheel.api.hasOwnProperty('a'), 'Resource not added.');

  whaterwheel.addResources({b: {base: 'http://foo2.dev', credentials: {user: 'c', pass: 'd'}, paths: {get: 'ok'}}});
  t.is(true, whaterwheel.api.hasOwnProperty('b'), 'Resource not added.');

  whaterwheel.addResources('c');
  t.deepEqual(['content','comment','contentType','file','menu','taxonomyTerm','taxonomyVocabulary','user','query','a','b'], whaterwheel.getResources(), 'Bad resource was added.');
});

test('List Resources', t => {
  t.plan(1);

  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  t.deepEqual(Object.keys(whaterwheel.api), whaterwheel.getResources(), 'Unexpected resources returned.');
});

test('Delete Resources', t => {
  t.plan(3);

  const whaterwheel = new t.context.Whaterwheel('http://foo.dev', {user: 'a', pass: 'b'});
  whaterwheel.removeResources('content');

  t.deepEqual(['comment','contentType','file','menu','taxonomyTerm','taxonomyVocabulary','user','query'], whaterwheel.getResources(), 'Resource not deleted.');

  whaterwheel.removeResources(['contentType', 'menu']);
  t.deepEqual(['comment','file','taxonomyTerm','taxonomyVocabulary','user','query'], whaterwheel.getResources(), 'Resource not deleted.');

  whaterwheel.removeResources('c');
  t.deepEqual(['comment','file','taxonomyTerm','taxonomyVocabulary','user','query'], whaterwheel.getResources());
});
