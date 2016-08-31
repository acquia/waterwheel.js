const test = require('ava');
let requireSubvert = require('require-subvert')(__dirname);

test.beforeEach(t => {
  t.context.methods = {
    'GET': '/comment/{comment}',
    'POST': '/entity/comment',
    'DELETE': '/comment/{comment}',
    'PATCH': '/comment/{comment}'
  };
  t.context.credentials = {oauth: '123456'};
  t.context.base = 'http://foo.dev';
  t.context.options = '/entity/types/node/{bundle}';
});

test.afterEach.cb(t => {
  requireSubvert.cleanUp();
  t.end();
});

// Get
test.cb('Get Success', t => {
  t.plan(1);

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'getSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods);

  entity.get(1)
    .then(res => {
      t.is('getSuccess', res, 'Unexpected response.');
      requireSubvert.cleanUp();
      t.end();
    });
});

// Set
test.cb('Set Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'setSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods);

  entity.patch(1, {foo: 'bar'})
    .then(function (res) {
      t.is('setSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});
test.cb('Set Non-Object Body', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'setNonObjectBody'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods);

  entity.patch(1)
    .then(res => {
      t.is('setNonObjectBody', res, 'Unexpected body returned.');
      t.end();
    });
});

// Create
test.cb('Create Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'createSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods);

  entity.post({foo: 'bar'})
    .then(res => {
      t.is('createSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});

// Delete
test.cb('Delete Success', t => {
  t.plan(1);
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: 'deleteSuccess'})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods);

  entity.delete(1)
    .then(res => {
      t.is('deleteSuccess', res, 'Unexpected body returned.');
      t.end();
    });
});

test.cb('Get Field Data', t => {
  t.plan(2);

  const fieldData = {a: 'a', b: 'b', c: 'c'};
  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: fieldData})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods, 'node', 'article', t.context.options);

  entity.getFieldData()
    .then(res => {
      t.deepEqual(entity.metadata, fieldData, 'Metadata not correct set.');
      t.deepEqual(res, fieldData, 'Unexpected Response.');
      t.end();
    });
});

test.cb('Set Field Data', t => {
  t.plan(1);

  const expectedResponse = {type: 'article', a: [{value: 'b'}]};

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: true})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods, 'node', 'article', t.context.options);

  entity.metadata = {fields: {a: {}, b: {}, c: {}}};

  entity.setField(1, {a: 'b'})
    .then(res => {
      t.deepEqual(res, expectedResponse, 'Unexpected Response.');
      t.end();
    });

});

test.cb('Fetch Field Data, Set Field Data', t => {
  t.plan(5);

  const expectedResponse = {type: 'article', title:[{value: 'A cool new title.'}]};

  requireSubvert.subvert('axios', () => (
    Promise.resolve({data: true})
  ));

  const Entity = requireSubvert.require('../lib/entity');
  const entity = new Entity(t.context.base, t.context.credentials, t.context.methods, 'node', 'article', t.context.options);

  // Mock getFieldData.
  entity.getFieldData = () => {
    entity.metadata = {fields: {title: {}, email: {}, body: {}}};
    return Promise.resolve();
  };

  entity.setField(1, [{title: 'A cool new title.'}])
    .then(res => {
      t.deepEqual(res, expectedResponse, 'Unexpected Response.');
      Promise.resolve();
    })
    .then(() => entity.setField(1, {email: ['a@aaa.com', 'b@bbb.com']}))
    .then(res => {
      t.deepEqual(res, {type: 'article', email: [{value:'a@aaa.com'},{value:'b@bbb.com'}]}, 'Unexpected Response.');
      Promise.resolve();
    })
    .then(() => entity.setField(1, [
      {title: 'A cool new title.'},
      {email: ['a@aaa.com', 'b@bbb.com']}
    ], {body: [{value: 'aaa'}]}))
    .then(res => {
      t.deepEqual(res, {
        type: 'article',
        title: [{value: 'A cool new title.'}],
        email: [{value: 'a@aaa.com'}, {value: 'b@bbb.com'}],
        body: [{value: 'aaa'}]
      }, 'Unexpected Response.');
      Promise.resolve();
    })
    .then(() => Promise.all([
      entity.setField(1, [{aaa: 'A cool new title.'}]),
      entity.setField(1, [{bbb: 'A cool new title.'}, {ccc: 'A cool new title.'}])
    ]))
    .catch(err => {
      t.truthy(err instanceof Error, 'Unexpected Response.');
      t.is(err.message, 'The field, aaa, is not included within the bundle, article.', 'Unexpected Error Message.');
      t.end();
    });

});
