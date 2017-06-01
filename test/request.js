const test = require('ava');
const rs = require('require-subvert')(__dirname);
const methods = require('../lib/helpers/methods');

test.beforeEach(t => {
  t.context.options = {
    base: 'http://drupal.localhost',
    methods: {
      'GET': '/comment/{comment}',
      'POST': '/entity/comment',
      'DELETE': '/comment/{comment}',
      'PATCH': '/comment/{comment}'
    },
    more: '/entity/types/comment/{bundle}'
  };
  t.context.oauth = require('./stubs/oauth');
  t.context.oauthOptions = {
    grant_type: 'password',
    client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
    client_secret: 'password',
    username: 'admin',
    password: 'password',
    scope: 'administrator'
  };
  t.context.baseURL = 'http://drupal.localhost';
});

test.afterEach(t => {
  rs.cleanUp();
});

// Request
test('Request Success', t => {
  rs.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

test('Request Failure', t => {
  rs.subvert('axios', () => Promise.reject({response: {data: {message: 'bar'}, status: 404}}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(true, err instanceof Error, 'Unxpected response.'));
});

test('Request Timeout', t => {
  rs.subvert('axios', () => Promise.reject({message: 'A timeout'}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(err.message, 'Timeout', 'Unxpected response.'));
});

test('Request Failure - No message', t => {
  rs.subvert('axios', () => Promise.reject({}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, '/entity/1', '12345')
    .catch(err => t.is(true, err instanceof Error, 'Unxpected response.'));
});

test('Request No Leading Slash', t => {
  rs.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, 'entity/1', '12345')
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

// CSRF Tokens
test('CSRF Success', t => {
  rs.subvert('axios', () => Promise.resolve({data: 'foo'}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.getXCSRFToken()
    .then(res => t.is(res, 'foo', 'Unexpected body returned.'));
});

test('CSRF Failure', t => {
  rs.subvert('axios', () => Promise.reject('bar'));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.getXCSRFToken()
    .catch(err => t.is(err, 'bar', 'Unexpected response.'));
});

test('CSRF Cache', t => {
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  request.csrfToken = '1234';
  return request.getXCSRFToken()
    .then(res => t.is(res, '1234', 'Unexpected response.'));
});

// Headers
test('Empty Headers', t => {
  rs.subvert('axios', options => Promise.resolve({data: options.headers}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  return request.issueRequest(methods.get, '/entity/1', '12345', {})
    .then(res => t.deepEqual({Authorization: 'Bearer 1234'}, res, 'Unexpected headers returned.'));
});

test('Custom Headers', t => {
  rs.subvert('axios', options => Promise.resolve({data: options}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  const expectedResult = [
    {
      method: 'get',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        foo: 'bar',
        Authorization: 'Bearer 1234'
      }
    },
    {
      method: 'get',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        'X-CSRF-Token': 'mycustomtoken',
        Authorization: 'Bearer 1234'
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
  rs.subvert('axios', options => Promise.resolve({data: options}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  const expectedResult = [
    {
      method: 'get',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        Authorization: 'Bearer 1234'
      }
    },
    {
      method: 'get',
      timeout: 500,
      url: 'http://dev.foo/entity/1',
      headers: {
        other: 'header',
        Authorization: 'Bearer 1234'
      }
    },
    {
      method: 'patch',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        'X-CSRF-Token': '34567',
        foo: 'bar',
        Authorization: 'Bearer 1234'
      },
      data: {body: 'content'}
    },
    {
      method: 'post',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        'X-CSRF-Token': '34567',
        Authorization: 'Bearer 1234'
      },
      data: {body: 'content'}
    },
    {
      method: 'delete',
      timeout: 500,
      url: `${t.context.baseURL}/entity/1`,
      headers: {
        'X-CSRF-Token': '34567',
        Authorization: 'Bearer 1234'
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

test('Request - No Validation', t => {
  rs.subvert('axios', (options) => Promise.resolve({data: options}));
  const Request = rs.require('../lib/helpers/request');

  t.context.options.accessCheck = false;

  const request = new Request(t.context.options, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  return request.issueRequest(methods.get, '/entity/1', '12345')
    .then(res => t.deepEqual(
      res,
      {
        method: 'get',
        timeout: 500,
        url: 'http://drupal.localhost/entity/1',
        headers: {}
      },
      'Unexpected body returned.'
    ));
});

// No Validation
test('No Validation', t => {
  rs.subvert('axios', options => Promise.resolve({data: options}));
  const Request = rs.require('../lib/helpers/request');
  const request = new Request({
    base: 'http://drupal.localhost',
    validation: false
  }, new t.context.oauth(t.context.baseURL, {}));
  return request.issueRequest(methods.get, '/entity/1', '12345', {})
    .then(res => t.deepEqual({method: 'get', timeout: 500, url: 'http://drupal.localhost/entity/1', headers: {}}, res, 'Unexpected headers returned.'));
});
