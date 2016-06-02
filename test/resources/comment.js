process.env.NODE_ENV = 'tests';

const requireSubvert = require('require-subvert')(__dirname);

module.exports = {
  tearDown: cb => {
    Object.keys(require.cache).forEach(key => {delete require.cache[key];});
    cb();
  },
  get: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'getSuccess'})
      ));

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'b', pass: 'b'});

      comment.get(1, 'json')
        .then(res => {
          test.equal('getSuccess', res, 'Unexpected response.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.get(false, 'json')
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal(err.message, 'Expected parameter commentId must be a number', 'Unexpected error message.');
          test.done();
        });
    }
  },
  set: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'setSuccess'})
      ));

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.set(1, 'json', {foo: 'bar'})
        .then(res => {
          test.equal('setSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.set(false, 'json', {foo: 'bar'})
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter commentId must be a number', err.message, 'Unexpected error returned.');
          test.done();
        });
    },
    nonObjectBody: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'setNonObjectBody'})
      ));

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.set(1, 'json', '')
        .then(res => {
          test.equal('setNonObjectBody', res, 'Unexpected body returned.');
          test.done();
        });
    }
  },
  create: {
    success: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'createSuccess'})
      ));

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.create('json', {foo: 'bar'})
        .then(res => {
          test.equal('createSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.create('json', false)
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
        Promise.resolve({data: 'deleteSuccess'})
      ));

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.delete(1)
        .then(res => {
          test.equal('deleteSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const Comment = requireSubvert.require('../../lib/resources/comment');
      const comment = new Comment('http://foo.dev', {user: 'a', pass: 'b'});

      comment.delete(false)
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter commentId must be a number', err.message, 'Unexpected error returned.');
          test.done();
        });
    }
  }
};
