const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

const methods = require('../lib/helpers/methods');

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
    Promise.reject({
      response: {
        data: {
          message: 'bar'
        },
        status: 404
      }
    })
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
test.cb('Request Failure - No message', t => {
  t.plan(3);

  requireSubvert.subvert('axios', () => (
    Promise.reject({
      response: {
        data: {},
        status: 404
      }
    })
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  request.issueRequest('GET', '/entity/1', '12345')
    .catch(err => {
      t.is(true, err instanceof Error, 'Unxpected response.');
      t.is(404, err.status, 'Unxpected response.');
      t.is('Unknown error.', err.message, 'Unxpected response.');
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
  t.plan(2);

  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  const expectedResult = [
    {
      method: 'GET',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {foo: 'bar'}
    },
    {
      method: 'GET',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {'X-CSRF-Token': 'mycustomtoken'}
    }
  ];

  Promise.all([
    request.issueRequest('GET', '/entity/1', '34567', {'foo': 'bar'}),
    request.issueRequest('GET', '/entity/1', '34567', {'X-CSRF-Token': 'mycustomtoken'})
  ])
    .then(res => {
      t.deepEqual(expectedResult, res, 'Unexpected result.');
      t.is(2, res.length, 'Unexpected amount of promises returned.');
      t.end();
    });
});

test.cb('Options', t => {
  t.plan(2);

  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

  const expectedResult = [
    {
      method: 'GET',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {}
    },
    {
      method: 'GET',
      url: 'http://dev.foo/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {other: 'header'}
    },
    {
      method: 'PATCH',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {'X-CSRF-Token': '34567', foo: 'bar'},
      data: {body: 'content'}
    },
    {
      method: 'POST',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {'X-CSRF-Token': '34567'},
      data: {body: 'content'}
    },
    {
      method: 'DELETE',
      url: 'http://foo.dev/entity/1',
      auth: {user: 'a', pass: 'b'},
      headers: {'X-CSRF-Token': '34567'}
    }
  ];

  Promise.all([
    request.issueRequest(methods.get, '/entity/1'),
    request.issueRequest(methods.get, '/entity/1', '1234', {'other': 'header'}, false, 'http://dev.foo'),
    request.issueRequest(methods.patch, 'entity/1', '34567', {'foo': 'bar'}, {'body': 'content'}),
    request.issueRequest(methods.post, 'entity/1', '34567', false, {'body': 'content'}),
    request.issueRequest(methods.delete, 'entity/1', '34567')
  ])
    .then(res => {
      t.deepEqual(expectedResult, res, 'Unexpected results.');
      t.is(5, res.length, 'Unexpected amount of promises returned.');
      t.end();
    });
});
