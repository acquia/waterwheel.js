const test = require('ava');
const rs = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.options = {
    methods: {
      'get': '/comment/{comment}',
      'post': '/entity/comment',
      'delete': '/comment/{comment}',
      'patch': '/comment/{comment}'
    },
    more: '/entity/types/comment/{bundle}',
    entity: 'node',
    bundle: 'article'
  };
  t.context.oauth = rs.require('./stubs/oauth');
  t.context.request = rs.require('../lib/helpers/request');
  t.context.baseURL = 'http://drupal.localhost',
  t.context.oauthOptions = {
    grant_type: 'password',
    client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
    client_secret: 'password',
    username: 'admin',
    password: 'password',
    scope: 'administrator'
  };
  t.context.JSONAPI = rs.require('../lib/jsonapi');
});

test.afterEach(t => {
  rs.cleanUp();
});

test('Create', t => {
  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  t.is(true, jsonapi instanceof t.context.JSONAPI, 'Unexpected creation.');
});

test('Collections / Lists', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.get('node/article', {})
    .then(res => {
      t.is(`${t.context.baseURL}/jsonapi/node/article?_format=api_json`, res.url);
    });
});

test('Related resources', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.get('node/article', {}, 'cc1b95c7-1758-4833-89f2-7053ae8e7906/uid')
    .then(res => {
      t.is(`${t.context.baseURL}/jsonapi/node/article/cc1b95c7-1758-4833-89f2-7053ae8e7906/uid?_format=api_json`, res.url);
    });
});

test('Filter basic', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.get('node/article', {
    filter: {
      uuid: {
        value: '563196f5-4432-4964-9aeb-e4d326cb1330'
      }
    }
  })
    .then(res => {
      t.is(`${t.context.baseURL}/jsonapi/node/article?_format=api_json&filter%5Buuid%5D%5Bvalue%5D=563196f5-4432-4964-9aeb-e4d326cb1330`, res.url);
    });
});

test('Filter with operator', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.get('node/article', {
    filter: {
      created: {value: '1469001416', operator: '='}
    }
  })
    .then(res => {
      t.is(`${t.context.baseURL}/jsonapi/node/article?_format=api_json&filter%5Bcreated%5D%5Bvalue%5D=1469001416&filter%5Bcreated%5D%5Boperator%5D=%3D`, res.url);
    });
});

test('Post', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.post('node/article', {some: 'data'})
    .then(res => {
      t.deepEqual({
        method: 'post',
        timeout: 500,
        url: `${t.context.baseURL}/jsonapi/node/article?_format=api_json`,
        headers:{
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/vnd.api+json'
        },
        data: {
          some: 'data'
        }
      }, res);
    });
});

test('Patch', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.patch('node/article/1234', {some: 'data'})
    .then(res => {
      t.deepEqual({
        method: 'patch',
        timeout: 500,
        url: `${t.context.baseURL}/jsonapi/node/article/1234?_format=api_json`,
        headers:{
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/vnd.api+json'
        },
        data: {
          some: 'data'
        }
      }, res);
    });
});

test('Delete', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));
  const jsonapi = new t.context.JSONAPI(t.context.options, request);
  return jsonapi.delete('node/article', 1234)
    .then(res => {
      t.deepEqual({
        method: 'delete',
        timeout: 500,
        url: `${t.context.baseURL}/jsonapi/node/article/1234?_format=api_json`,
        headers:{
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/vnd.api+json'
        }
      }, res);
    });
});

test('Custom Prefix', t => {
  rs.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  let options = t.context.options;
  options.jsonapiPrefix = 'fooapi';

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const jsonapi = new t.context.JSONAPI(options, request);
  return jsonapi.get('node/article', {})
    .then(res => {
      t.is(`${t.context.baseURL}/fooapi/node/article?_format=api_json`, res.url);
    });
});
