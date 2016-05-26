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

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.get('mycontenttype', 'json')
        .then(res => {
          test.equal('getSuccess', res, 'Unexpected response.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.get(false, 'json')
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal(err.message, 'Expected parameter contentType must be a string', 'Unexpected error message.');
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

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.set('mycontenttype', 'json', {foo: 'bar'})
        .then(res => {
          test.equal('setSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.set(false, 'json', {foo: 'bar'})
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter entityId must be a number', err.message, 'Unexpected error returned.');
          test.done();
        });
    },
    nonObjectBody: test => {
      test.expect(1);
      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'setNonObjectBody'})
      ));

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.set('mycontenttype', 'json', '')
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

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.create('json', {foo: 'bar'})
        .then(res => {
          test.equal('createSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.create('json', false)
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

      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.delete('mycontenttype')
        .then(res => {
          test.equal('deleteSuccess', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(2);
      const ContentType = requireSubvert.require('../../lib/resources/contentType');
      const contentType = new ContentType('http://foo.dev', {user: 'a', pass: 'b'});

      contentType.delete(false)
        .catch(err => {
          test.equal(true, err instanceof Error);
          test.equal('Expected parameter contentType must be a string', err.message, 'Unexpected error returned.');
          test.done();
        });
    }
  }
};
