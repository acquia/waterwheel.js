const test = require('ava');
const requireSubvert = require('require-subvert')(__dirname);

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
    more: '/entity/types/comment/{bundle}',
    entity: 'node',
    bundle: 'article'
  };
  t.context.JSONAPI = requireSubvert.require('../lib/jsonapi');
});

test.afterEach(t => {
  requireSubvert.cleanUp();
});

test('JSONAPI - Create', t => {
  const jsonapi = new t.context.JSONAPI(t.context.options);
  t.is(true, jsonapi instanceof t.context.JSONAPI, 'Unexpected creation.');
});

test('JSONAPI - Collections / Lists', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI(t.context.options);
  return jsonapi.get('node/article', {})
    .then(res => {
      t.is('http://foo.dev/jsonapi/node/article?_format=api_json', res.url);
    });
});

test('JSONAPI - Related resources', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI(t.context.options);
  return jsonapi.get('node/article', {}, 'cc1b95c7-1758-4833-89f2-7053ae8e7906/uid')
    .then(res => {
      t.is('http://foo.dev/jsonapi/node/article/cc1b95c7-1758-4833-89f2-7053ae8e7906/uid?_format=api_json', res.url);
    });
});

test('JSONAPI - Filter basic', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI(t.context.options);
  return jsonapi.get('node/article', {
    filter: {
      uuid: {
        value: '563196f5-4432-4964-9aeb-e4d326cb1330'
      }
    }
  })
    .then(res => {
      t.is('http://foo.dev/jsonapi/node/article?_format=api_json&filter%5Buuid%5D%5Bvalue%5D=563196f5-4432-4964-9aeb-e4d326cb1330', res.url);
    });
});

test('JSONAPI - Filter with operator', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI(t.context.options);
  return jsonapi.get('node/article', {
    filter: {
      created: {value: '1469001416', operator: '='}
    }
  })
    .then(res => {
      t.is('http://foo.dev/jsonapi/node/article?_format=api_json&filter%5Bcreated%5D%5Bvalue%5D=1469001416&filter%5Bcreated%5D%5Boperator%5D=%3D', res.url);
    });
});

test('JSONAPI - Post', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI(t.context.options);
  return jsonapi.post('node/article', {some: 'data'})
    .then(res => {
      t.deepEqual({
        method: 'POST',
        timeout: 500,
        url: 'http://foo.dev/jsonapi/node/article?_format=api_json',
        headers:{
          Authorization: 'Bearer 123456',
          'Content-Type': 'application/vnd.api+json'
        },
        data: {
          some: 'data'
        }
      }, res);
    });
});

test('JSONAPI - Prefix option', t => {
  requireSubvert.subvert('axios', options => (
    Promise.resolve({data: options})
  ));
  const jsonapi = new t.context.JSONAPI({...t.context.options, prefix: 'api'});
  return jsonapi.get('node/article', {})
    .then(res => {
      t.is('http://foo.dev/api/node/article?_format=api_json', res.url);
    });
});
