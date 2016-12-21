const test = require('ava');
let requireSubvert = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.options = {
    base: 'http://foo.dev',
    credentials: {oauth: '123456'},
    methods: {
      'GET': {path: '/comment/{comment}'},
      'POST': {path: '/entity/comment'},
      'DELETE': {path: '/comment/{comment}'},
      'PATCH': {path: '/comment/{comment}'}
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
});

test.afterEach.cb(t => {
  requireSubvert.cleanUp();
  t.end();
});

// Get
test('GET', t => {
  requireSubvert.subvert('axios', options => Promise.resolve({data: options}));
  const Entity = requireSubvert.require('../lib/entity');
  return new Entity(t.context.options).get(1)
    .then(res => {
      t.deepEqual({
        method: 'GET',
        timeout: 500,
        url: 'http://foo.dev/comment/1?_format=json',
        headers: {Authorization:'Bearer 123456'}
      }, res, 'Unexpected response.');
    });
});

// Patch
test('PATCH', t => {
  requireSubvert.subvert('axios', options => {
    if (options.url === `${t.context.options.base}/rest/session/token`) {
      return Promise.resolve({data: '1234567890'});
    }
    return Promise.resolve({data: options});
  });
  const Entity = requireSubvert.require('../lib/entity');
  return new Entity(t.context.options).patch(1, {foo: 'bar'})
    .then(res => {
      t.deepEqual({
        method: 'PATCH',
        timeout: 500,
        url: 'http://foo.dev/comment/1',
        headers: {
          'X-CSRF-Token': '1234567890',
          Authorization: 'Bearer 123456',
          'Content-Type': 'application/json'
        },
        data: {foo: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

test.cb('Set Non-Object Body', t => {
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'setNonObjectBody'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);

  entity.patch(1)
    .then(res => {
      t.is('setNonObjectBody', res, 'Unexpected body returned.');
      t.end();
    });
});

// Post
test('POST', t => {
  requireSubvert.subvert('axios', options => {
    if (options.url === `${t.context.options.base}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });
  const Entity = requireSubvert.require('../lib/entity');
  return new Entity(t.context.options).post({foo: 'bar'}, 'application/json', false)
    .then(res => {
      t.deepEqual({
        method: 'POST',
        timeout: 500,
        url: 'http://foo.dev/entity/comment',
        headers: {
          'X-CSRF-Token': '333',
          Authorization: 'Bearer 123456',
          'Content-Type': 'application/json'
        },
        data: {foo: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

test('POST - Missing Fields', t => {
  requireSubvert.subvert('axios', options => {
    if (options.url === `${t.context.options.base}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  entity.options.metadata = {
    requiredFields: ['title', 'body']
  };
  return entity.post({title: 'bar'}, 'application/json', true)
    .catch(err => {
      t.deepEqual('The following fields, body, are required.', err, 'Unexpected body returned.');
    });
});

test('POST - Correct Fields', t => {
  requireSubvert.subvert('axios', options => {
    if (options.url === `${t.context.options.base}/rest/session/token`) {
      return Promise.resolve({data: '333'});
    }
    return Promise.resolve({data: options});
  });
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  entity.options.metadata = {
    requiredFields: ['title', 'body']
  };
  return entity.post({title: 'foo', body: 'bar'}, 'application/json', true)
    .then(res => {
      t.deepEqual({
        method: 'POST',
        timeout: 500,
        url: 'http://foo.dev/entity/comment',
        headers: {
          'X-CSRF-Token': '333',
          Authorization: 'Bearer 123456',
          'Content-Type': 'application/json'
        },
        data: {title: 'foo', body: 'bar'}
      }, res, 'Unexpected body returned.');
    });
});

// Delete
test('DELETE', t => {
  requireSubvert.subvert('axios', options => {
    if (options.url === `${t.context.options.base}/rest/session/token`) {
      return Promise.resolve({data: '444'});
    }
    return Promise.resolve({data: options});
  });
  const Entity = requireSubvert.require('../lib/entity');
  return new Entity(t.context.options).delete(1)
    .then(res => {
      t.deepEqual({
        method: 'DELETE',
        timeout: 500,
        url: 'http://foo.dev/comment/1',
        headers: {
          'X-CSRF-Token': '444',
          Authorization: 'Bearer 123456'
        }
      }, res, 'Unexpected body returned.');
    });
});

// Missing methods
test.cb('Missing GET Method', t => {
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  delete entity.options.methods.GET;
  entity.get(1)
    .catch(err => {
      t.is('The method, GET, is not available.', err);
      t.end();
    });
});

test.cb('Missing PATCH Method', t => {
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  delete entity.options.methods.PATCH;
  entity.patch(1, {foo: 'bar'})
    .catch(err => {
      t.is('The method, PATCH, is not available.', err);
      t.end();
    });
});

test.cb('Missing POST Method', t => {
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  delete entity.options.methods.POST;
  entity.post({foo: 'bar'})
    .catch(err => {
      t.is('The method, POST, is not available.', err);
      t.end();
    });
});

test.cb('Missing DELETE Method', t => {
  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);
  delete entity.options.methods.DELETE;
  entity.delete(1)
    .catch(err => {
      t.is('The method, DELETE, is not available.', err);
      t.end();
    });
});

test.cb('Set Field Data', t => {
  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);

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
  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);

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
  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);

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
  requireSubvert.subvert('axios', (options) => (
    Promise.resolve({data: options})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.options);

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
