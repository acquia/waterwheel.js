const test = require('ava');
const rs = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.options = {
    methods: {
      'get': {path: '/comment/{comment}'},
      'post': {path: '/entity/comment'},
      'delete': {path: '/comment/{comment}'},
      'patch': {path: '/comment/{comment}'}
    },
    bundle: 'article',
    entity: 'node',
    resourceInfo: '/entity/types/comment/{bundle}',
    metadata: {
      requiredFields: ['title'],
      properties: {
        title: {
          'title': 'Title',
          'type': 'array',
          'items': {
            'type': 'object',
            'properties': {
              'value': {
                'title': 'Text value',
                'type': 'string',
                'maxLength': 255
              },
              'foo': {
                'title': 'Text value',
                'type': 'string',
                'maxLength': 100
              }
            },
            'required': ['value']
          },
          'minItems': 1,
          'maxItems': 1
        }
      }
    }
  };
  t.context.oauth = rs.require('./stubs/oauth');
  t.context.request = rs.require('../lib/helpers/request');
  t.context.baseURL = 'http://drupal.localhost';
  t.context.oauthOptions = {
    grant_type: 'password',
    client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
    client_secret: 'password',
    username: 'admin',
    password: 'password',
    scope: 'administrator'
  };
});

test.afterEach.cb(t => {
  rs.cleanUp();
  t.end();
});

// Get
test('GET', t => {
  rs.subvert('axios', options => Promise.resolve({data: options}));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  console.log(new Entity(t.context.options, request).options.methods.hasOwnProperty('get'));
  return new Entity(t.context.options, request).get(1)
    .then(res => {
      t.deepEqual({
        method: 'get',
        timeout: 500,
        url: `${t.context.baseURL}/comment/1?_format=json`,
        headers: {Authorization:'Bearer 1234'}
      }, res, 'Unexpected response.');
    });
});

// Patch
test('PATCH', t => {
  rs.subvert('axios', options => {
    if (options.url === `${t.context.baseURL}/rest/session/token`) {
      return Promise.resolve({data: '1234567890'});
    }
    return Promise.resolve({data: options});
  });

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  return new Entity(t.context.options, request).patch(1, {foo: 'bar'})
    .then(res => {
      t.deepEqual({
        method: 'patch',
        timeout: 500,
        url: `${t.context.baseURL}/comment/1`,
        headers: {
          'X-CSRF-Token': '1234567890',
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/json'
        },
        data: {foo: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

test.cb('Set Non-Object Body', t => {
  rs.subvert('axios', () => (
    Promise.resolve({data: 'setNonObjectBody'})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);

  entity.patch(1)
    .then(res => {
      t.is('setNonObjectBody', res, 'Unexpected body returned.');
      t.end();
    });
});

// Post
test('POST', t => {
  rs.subvert('axios', options => {
    if (options.url === `${t.context.baseURL}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  return new Entity(t.context.options, request).post({foo: 'bar'}, 'application/json', false)
    .then(res => {
      t.deepEqual({
        method: 'post',
        timeout: 500,
        url: `${t.context.baseURL}/entity/comment`,
        headers: {
          'X-CSRF-Token': '333',
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/json'
        },
        data: {foo: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

test('POST - Missing Fields', t => {
  rs.subvert('axios', options => {
    if (options.url === `${t.context.baseURL}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);
  entity.options.metadata = {
    requiredFields: ['title', 'body']
  };
  return entity.post({title: 'bar'}, 'application/json', true)
    .catch(err => {
      t.deepEqual('The following fields, body, are required.', err, 'Unexpected body returned.');
    });
});

test('POST - Correct Fields', t => {
  rs.subvert('axios', options => {
    if (options.url === `${t.context.baseURL}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);
  entity.options.metadata = {
    requiredFields: ['title', 'body']
  };
  return entity.post({title: 'foo', body: 'bar'}, 'application/json', true)
    .then(res => {
      t.deepEqual({
        method: 'post',
        timeout: 500,
        url: `${t.context.baseURL}/entity/comment`,
        headers: {
          'X-CSRF-Token': '333',
          Authorization: 'Bearer 1234',
          'Content-Type': 'application/json'
        },
        data: {title: 'foo', body: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

// Delete
test('DELETE', t => {
  rs.subvert('axios', options => {
    if (options.url === `${t.context.baseURL}/rest/session/token`) {
      return Promise.resolve({data: '444'});
    }
    return Promise.resolve({data: options});
  });

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  return new Entity(t.context.options, request).delete(1)
    .then(res => {
      t.deepEqual({
        method: 'delete',
        timeout: 500,
        url: `${t.context.baseURL}/comment/1`,
        headers: {
          'X-CSRF-Token': '444',
          Authorization: 'Bearer 1234'
        }
      }, res, 'Unexpected body returned.');
    });
});

// Missing methods
test.cb('Missing GET Method', t => {
  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, {});
  delete entity.options.methods.get;
  entity.get(1)
    .catch(err => {
      t.is('The method, get, is not available.', err);
      t.end();
    });
});

test.cb('Missing PATCH Method', t => {
  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, {});
  delete entity.options.methods.patch;
  entity.patch(1, {foo: 'bar'})
    .catch(err => {
      t.is('The method, patch, is not available.', err);
      t.end();
    });
});

test.cb('Missing POST Method', t => {
  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, {});
  delete entity.options.methods.post;
  entity.post({foo: 'bar'})
    .catch(err => {
      t.is('The method, post, is not available.', err);
      t.end();
    });
});

test.cb('Missing DELETE Method', t => {
  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, {});
  delete entity.options.methods.delete;
  entity.delete(1)
    .catch(err => {
      t.is('The method, delete, is not available.', err);
      t.end();
    });
});

test.cb('Set Field Data', t => {
  rs.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);

  entity.setFields(201, {
    title: {
      value: 'Hello World'
    }
  })
    .then(res => {
      t.deepEqual(
        res.data,
        {
          'title': [
            {'value':'Hello World'}
          ],
          'type': [
            {'target_id':'article','target_type':'node_type'}
          ]
        }
      );
      t.end();
    });
});

test.cb('Set Field Data - Incorrect Prop', t => {
  rs.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);

  entity.setFields(201, {
    title: {
      value: 'Hello World'
    }
  })
    .then(res => {
      t.deepEqual(
        res.data,
        {
          'title': [
            {'value':'Hello World'}
          ],
          'type': [
            {'target_id':'article','target_type':'node_type'}
          ]
        }
      );
      t.end();
    });
});

test.cb('Set Field Data - Bad Key', t => {
  rs.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);

  entity.setFields(201, {
    foo: {
      value: 'Hello World'
    }
  })
    .catch(err => {
      t.is(err.message, 'The field, foo, is not included within the bundle, article.');
      t.end();
    });
});

test.cb('Set Field Data - Bad Keys', t => {
  rs.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const request = new t.context.request({
    base: t.context.baseURL,
    oauth: t.context.oauthOptions
  }, new t.context.oauth(t.context.baseURL, t.context.oauthOptions));

  const Entity = rs.require('../lib/entity');
  const entity = new Entity(t.context.options, request);

  entity.setFields(201, {
    foo: {
      value: 'Hello World'
    },
    bar: {
      value: 'Hello World'
    }
  })
    .catch(err => {
      t.is(err.message, 'The fields, foo, bar, are not included within the bundle, article.');
      t.end();
    });
});
