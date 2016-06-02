const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.Hydrant = requireSubvert.require('../lib/hydrant');
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('Hydrant Creation', t => {
  t.plan(1);

  const hydrant = new t.context.Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
  t.is(true, hydrant instanceof t.context.Hydrant, 'Unexpected creation.');
});

test('Create New Entity Query', t => {
  t.plan(1);
  const Query = requireSubvert.require('../lib/resources/entityQuery');
  const Hydrant = requireSubvert.require('../lib/hydrant');
  const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

  hydrant.api.query('node');

  t.is(true, hydrant.api.query instanceof Function ,'Unexpected creation.');
});

test('urlBase', t => {
  t.plan(2);
  const hydrant = new t.context.Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
  t.is('http://foo.dev', hydrant.api.content.getBase(), 'Unexpected URL base.');

  hydrant.api.content.setBase('http://foo2.dev');
  t.is('http://foo2.dev', hydrant.api.content.getBase(), 'URL base was not set correctly.');
});

test('credentials', t => {
  t.plan(2);

  const hydrant = new t.context.Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
  t.deepEqual({user: 'a', pass: 'b'}, hydrant.api.content.getCredentials(), 'Unexpected credentials.');

  hydrant.api.content.setCredentials({user: 'c', pass: 'd'});
  t.deepEqual({user: 'c', pass: 'd'}, hydrant.api.content.getCredentials(), 'Credentials object was not set correctly.');
});
