const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

test.afterEach.cb(t => {
  requireSubvert.cleanUp();
  t.end();
});

// Request
test.cb('Request Success', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'foo'})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', '/entity/1', '12345')
    .then(res => {
      t.is('foo', res, 'Unexpected body returned.');
      t.end();
    });
});
test.cb('Request Failure', t => {
  t.plan(3);

  requireSubvert.subvert('axios', () => (
    Promise.reject({data: {message: 'bar'}, status: 404})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', '/entity/1', '12345')
    .catch(err => {
      t.is(true, err instanceof Error, 'Unxpected response.');
      t.is(404, err.status, 'Unxpected response.');
      t.is('bar', err.message, 'Unxpected response.');
      t.end();
    });
});
test.cb('Request No Leading Slash', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'foo'})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', 'entity/1', '12345')
    .then(res => {
      t.is('foo', res, 'Unexpected body returned.');
      t.end();
    });
});

// CSRF Tokens
test.cb('CSRF Success', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'foo'})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.getXCSRFToken()
    .then(res => {
      t.is(res, 'foo', 'Unexpected response.');
      t.end();
    });
});
test.cb('CSRF Failure', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.reject('bar')
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.getXCSRFToken()
    .catch(err => {
      t.is(err, 'bar', 'Unexpected response.');
      t.end();
    });
});

test.cb('CSRF Cache', t => {
  t.plan(1);

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.csrfToken = '1234';

  request.getXCSRFToken()
    .then(res => {
      t.is(res, '1234', 'Unexpected response.');
      t.end();
    });
});

// Headers
test.cb('Empty Headers', t => {
  t.plan(1);

  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options.headers})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', '/entity/1', '12345', {})
    .then(res => {
      t.deepEqual({}, res, 'Unexpected headers returned.');
      t.end();
    });

});
test.cb('Custom Headers', t => {
  t.plan(1);

  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options.headers})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', '/entity/1', '34567', {'foo': 'bar'})
    .then(res => {
      t.deepEqual({'foo': 'bar'}, res, 'Unexpected headers set.');
      t.end();
    });
});
