/**
 * Test definitions.
 */
process.env.NODE_ENV = 'tests';

const requireSubvert = require('require-subvert')(__dirname);

module.exports = {
  tearDown: cb => {
    requireSubvert.cleanUp();
    cb();
  },
  creation: test => {
    test.expect(1);
    const Hydrant = requireSubvert.require('../lib/hydrant');
    const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

    test.equal(true, hydrant instanceof Hydrant, 'Unexpected creation.');
    test.done();
  },
  urlBase: test => {
    test.expect(2);
    const Hydrant = requireSubvert.require('../lib/hydrant');
    const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

    test.equal('http://foo.dev', hydrant.api.node.getBase(), 'Unexpected URL base.');

    hydrant.api.node.setBase('http://foo2.dev');

    test.equal('http://foo2.dev', hydrant.api.node.getBase(), 'URL base was not set correctly.');
    test.done();
  },
  credentials: test => {
    test.expect(2);
    const Hydrant = requireSubvert.require('../lib/hydrant');
    const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

    test.deepEqual({user: 'a', pass: 'b'}, hydrant.api.node.getCredentials(), 'Unexpected credentials.');

    hydrant.api.node.setCredentials({user: 'c', pass: 'd'});

    test.deepEqual({user: 'c', pass: 'd'}, hydrant.api.node.getCredentials(), 'Credentials object was not set correctly.');
    test.done();
  },
  requests: {
    success: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Request = requireSubvert.require('../lib/helpers/request');
      const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

      request.issueRequest('GET', '/entity/1', '12345')
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(3);

      requireSubvert.subvert('axios', () => (
        Promise.reject({data: {message: 'bar'}, status: 404})
      ));

      const Request = requireSubvert.require('../lib/helpers/request');
      const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

      request.issueRequest('GET', '/entity/1', '12345')
        .catch(err => {
          test.equal(true, err instanceof Error, 'Unxpected response.');
          test.equal(404, err.status, 'Unxpected response.');
          test.equal('bar', err.message, 'Unxpected response.');
          test.done();
        });
    },
    noLeadingSlash: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Request = requireSubvert.require('../lib/helpers/request');
      const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

      request.issueRequest('GET', 'entity/1', '12345')
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    getXCSRFToken: {
      success: test => {
        test.expect(1);

        requireSubvert.subvert('axios', () => (
          Promise.resolve({data: 'foo'})
        ));

        const Request = requireSubvert.require('../lib/helpers/request');
        const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

        request.getXCSRFToken()
          .then(res => {
            test.equal(res, 'foo', 'Unexpected response.');
            test.done();
          });
      },
      failure: test => {
        test.expect(1);

        requireSubvert.subvert('axios', () => (
          Promise.reject('bar')
        ));

        const Request = requireSubvert.require('../lib/helpers/request');
        const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

        request.getXCSRFToken()
          .catch(err => {
            test.equal(err, 'bar', 'Unexpected response.');
            test.done();
          });
      }
    },
    headers: test => {
      test.expect(2);

      requireSubvert.subvert('axios', (options) => (
        Promise.resolve({data: options.headers})
      ));

      const Request = requireSubvert.require('../lib/helpers/request');
      const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

      request.issueRequest('GET', '/entity/1', '12345', {})
        .then(res => {
          test.deepEqual({'X-CSRF-Token': '12345'}, res, 'Unexpected headers returned.');
        });

      request.issueRequest('GET', '/entity/1', '34567', {'foo': 'bar'})
        .then(res => {
          test.deepEqual({'X-CSRF-Token': '34567', 'foo': 'bar'}, res, 'Unexpected headers set.');
          test.done();
        });
    },
    body: test => {
      test.expect(1);

      requireSubvert.subvert('axios', (options) => (
        Promise.resolve({data: 'foo'})
      ));

      const Request = requireSubvert.require('../lib/helpers/request');
      const request = new Request('http://foo.dev', {user: 'a', pass: 'b'});

      request.issueRequest('GET', '/entity/1', '12345', {})
        .then(res => {
          test.deepEqual('foo', res, 'Unexpected headers returned.');
          test.done();
        });
    }
  },
  resources: {
    node: require('./resources/node'),
    menu: require('./resources/menu'),
    contentType: require('./resources/contentType')
  }
};
