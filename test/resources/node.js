process.env.NODE_ENV = 'tests';

const requireSubvert = require('require-subvert')(__dirname);

module.exports = {
  tearDown: cb => {
    requireSubvert.cleanUp();
    cb();
  },
  get: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.get(1, 'json')
        .then(res => {
          test.equal('foo', res, 'Unexpected response.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.get(false, 'json')
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal(err.message, 'Expected parameter entityId must be a number', 'Unexpected error message.');
          test.done();
        });
    }
  },
  set: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.set(1, 'json', {foo: 'bar'})
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.set(false, 'json', {foo: 'bar'})
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter entityId must be a number', err.message, 'Unexpected error returned.');
          test.done();
        });
    },
    nonObjectBody: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.set(1, 'json', '')
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    }
  },
  create: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.create('json', {foo: 'bar'})
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.create('json', false)
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter body must be an Object', err.message, 'Unexpected error returned.');
          test.done();
        });
    }
  },
  delete: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.delete(1)
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));
      const Node = requireSubvert.require('../../lib/resources/node');
      const node = new Node('http://foo.dev', {user: 'a', pass: 'b'});

      node.delete(false)
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter entityId must be a number', err.message, 'Unexpected error returned.');
          test.done();
        });
    }
  }
};
