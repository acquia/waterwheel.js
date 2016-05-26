process.env.NODE_ENV = 'tests';

const requireSubvert = require('require-subvert')(__dirname);

module.exports = {
  tearDown: cb => {
    Object.keys(require.cache).forEach(key => {delete require.cache[key];});
    cb();
  },
  create: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    test.equals(entityQuery instanceof EntityQuery, true, 'Incorrect creation');
    test.done();
  },
  request: {
    success: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
      const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

      entityQuery.get()
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    }
  },
  range: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.range(0, 5);

    test.equal('range[start]=0&range[length]=5', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
    test.done();

  },
  condition: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.condition('field_foo', 'bar');

    test.equal('condition_0[field]=field_foo&condition_0[value]=bar&condition_0[operator]=EQ', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
    test.done();

  },
  sort: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.sort('ASC');

    test.equal('sort_0[field]=ASC&sort_0[direction]=ASC', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
    test.done();

  },
  exists: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.exists('foo');

    test.equal('exists_0[field]=foo&exists_0[condition]=TRUE', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
    test.done();

  },
  notExists: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.notExists('foo');

    test.equal('exists_0[field]=foo&exists_0[condition]=FALSE', entityQuery.entityQuery.getQueryString(), 'Unexpected response.');
    test.done();

  },
  andConditionGroup: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.andConditionGroup();

    test.deepEqual({type: 'group', conjunction: 'AND', children: []}, entityQuery.andConditionGroup(), 'Unexpected response.');
    test.done();

  },
  orConditionGroup: test => {
    test.expect(1);

    const EntityQuery = requireSubvert.require('../../lib/resources/entityQuery');
    const entityQuery = new EntityQuery('http://foo.dev', {user: 'a', pass: 'b'}, 'node');

    entityQuery.andConditionGroup();

    test.deepEqual({type: 'group', conjunction: 'OR', children: []}, entityQuery.orConditionGroup(), 'Unexpected response.');
    test.done();

  }
};
