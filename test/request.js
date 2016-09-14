const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

const methods = require('../lib/helpers/methods');

test.beforeEach(t => {
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

//Request
test('Request Success', t => {
  requireSubvert.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

test('Request Failure', t => {
  requireSubvert.subvert('axios', () => Promise.reject({response: {data: {message: 'bar'}, status: 404}}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(true, err instanceof Error, 'Unxpected response.'));
});

test('Request Timeout', t => {
  requireSubvert.subvert('axios', () => Promise.reject({message: 'A timeout'}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(err.message, 'Timeout', 'Unxpected response.'));
});

test('Request Failure - No message', t => {
  requireSubvert.subvert('axios', () => Promise.reject({}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(true, err instanceof Error, 'Unxpected response.'));
});

test('Request No Leading Slash', t => {
  requireSubvert.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, 'entity/1', '12345')
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

// CSRF Tokens
test('CSRF Success', t => {
  requireSubvert.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.getXCSRFToken()
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

test('CSRF Failure', t => {
  requireSubvert.subvert('axios', () => Promise.reject('bar'));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.getXCSRFToken()
    .catch(err => t.is(err, 'bar', 'Unexpected response.'));
});

test('CSRF Cache', t => {
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  request.csrfToken = '1234';
  return request.getXCSRFToken()
    .then(res => t.is(res, '1234', 'Unexpected response.'));
});

// Headers
test('Empty Headers', t => {
  requireSubvert.subvert('axios', options => Promise.resolve({data: options.headers}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  return request.issueRequest(methods.get, '/entity/1', '12345', {})
    .then(res => t.deepEqual({Authorization: 'Bearer 123456'}, res, 'Unexpected headers returned.'));
});

test('Custom Headers', t => {
  requireSubvert.subvert('axios', options => Promise.resolve({data: options}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  const expectedResult = [
    {
      method: 'GET',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        foo: 'bar',
        Authorization: 'Bearer 123456'
      }
    },
    {
      method: 'GET',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        'X-CSRF-Token': 'mycustomtoken',
        Authorization: 'Bearer 123456'
      }
    }
  ];
  return Promise.all([
    request.issueRequest(methods.get, '/entity/1', '34567', {'foo': 'bar'}),
    request.issueRequest(methods.get, '/entity/1', '34567', {'X-CSRF-Token': 'mycustomtoken'})
  ])
  .then(res => {
    t.deepEqual(expectedResult, res, 'Unexpected result.');
    t.is(2, res.length, 'Unexpected amount of promises returned.');
  });
});

test('Options', t => {
  requireSubvert.subvert('axios', options => Promise.resolve({data: options}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  const expectedResult = [
    {
      method: 'GET',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        Authorization: 'Bearer 123456'
      }
    },
    {
      method: 'GET',
      timeout: 500,
      url: 'http://dev.foo/entity/1',
      headers: {
        other: 'header',
        Authorization: 'Bearer 123456'
      }
    },
    {
      method: 'PATCH',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        'X-CSRF-Token': '34567',
        foo: 'bar',
        Authorization: 'Bearer 123456'
      },
      data: {body: 'content'}
    },
    {
      method: 'POST',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        'X-CSRF-Token': '34567',
        Authorization: 'Bearer 123456'
      },
      data: {body: 'content'}
    },
    {
      method: 'DELETE',
      timeout: 500,
      url: 'http://foo.dev/entity/1',
      headers: {
        'X-CSRF-Token': '34567',
        Authorization: 'Bearer 123456'
      }
    }
  ];
  return Promise.all([
    request.issueRequest(methods.get, '/entity/1'),
    request.issueRequest(methods.get, '/entity/1', '1234', {'other': 'header'}, false, 'http://dev.foo'),
    request.issueRequest(methods.patch, 'entity/1', '34567', {'foo': 'bar'}, {'body': 'content'}),
    request.issueRequest(methods.post, 'entity/1', '34567', false, {'body': 'content'}),
    request.issueRequest(methods.delete, 'entity/1', '34567')
  ])
  .then(res => {
    t.deepEqual(expectedResult, res, 'Unexpected results.');
    t.is(5, res.length, 'Unexpected amount of promises returned.');
  });
});

test('No Oauth', t => {
  requireSubvert.subvert('axios', options => Promise.resolve({data: options}));
  const Request = requireSubvert.require('../lib/helpers/request');
  const request = new Request(t.context.options);
  delete request.options.credentials.oauth;
  return request.issueRequest(methods.get, '/entity/1', '12345', {})
    .then(res => t.is(0, Object.keys(res.headers).length, 'Unexpected Oauth key attached to headers.'));
});
