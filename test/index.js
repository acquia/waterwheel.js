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

    test.equal('http://foo.dev', hydrant.getBase(), 'Unexpected URL base.');

    hydrant.setBase('http://foo2.dev');

    test.equal('http://foo2.dev', hydrant.getBase(), 'URL base was not set correctly.');
    test.done();
  },
  credentials: test => {
    test.expect(2);
    const Hydrant = requireSubvert.require('../lib/hydrant');
    const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

    test.deepEqual({user: 'a', pass: 'b'}, hydrant.getCredentials(), 'Unexpected credentials.');

    hydrant.setCredentials({user: 'c', pass: 'd'});

    test.deepEqual({user: 'c', pass: 'd'}, hydrant.getCredentials(), 'Credentials object was not set correctly.');
    test.done();
  },
  requests: {
    success: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Hydrant = requireSubvert.require('../lib/hydrant');
      const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

      hydrant.issueRequest('GET', '/entity/1', '12345')
        .then(res => {
          test.equal('foo', res, 'Unexpected body returned.');
          test.done();
        });
    },
    failure: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.reject('bar')
      ));

      const Hydrant = requireSubvert.require('../lib/hydrant');
      const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

      hydrant.issueRequest('GET', '/entity/1', '12345')
        .catch(err => {
          test.equal('bar', err, 'Unexpected body returned.');
          test.done();
        });
    },
    noLeadingSlash: test => {
      test.expect(1);

      requireSubvert.subvert('axios', () => (
        Promise.resolve({data: 'foo'})
      ));

      const Hydrant = requireSubvert.require('../lib/hydrant');
      const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

      hydrant.issueRequest('GET', 'entity/1', '12345')
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

        const Hydrant = requireSubvert.require('../lib/hydrant');
        const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

        hydrant.getXCSRFToken()
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

        const Hydrant = requireSubvert.require('../lib/hydrant');
        const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

        hydrant.getXCSRFToken()
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

      const Hydrant = requireSubvert.require('../lib/hydrant');
      const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

      hydrant.issueRequest('GET', '/entity/1', '12345', {})
        .then(res => {
          test.deepEqual({'X-CSRF-Token': '12345'}, res, 'Unexpected headers returned.');
        });

      hydrant.issueRequest('GET', '/entity/1', '34567', {'foo': 'bar'})
        .then(res => {
          test.deepEqual({'X-CSRF-Token': '34567', 'foo': 'bar'}, res, 'Unexpected headers set.');
          test.done();
        });
    },
    body: test => {
      test.expect(1);

      requireSubvert.subvert('axios', (options) => (
        Promise.resolve({data: options})
      ));

      const Hydrant = requireSubvert.require('../lib/hydrant');
      const hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});

      hydrant.issueRequest('POST', '/entity/1', '12345', {}, 'foo')
        .then(res => {
          test.deepEqual('foo', res.body, 'Unexpected body returned.');
          test.done();
        });
    },
    convenienceMethods: {
      get: {
        success: test => {
          test.expect(1);
          requireSubvert.subvert('axios', () => (
            Promise.resolve({data: 'foo'})
          ));

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.get('node', 1, 'json')
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.get('node', false, 'json')
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.set('node', 1, 'json', {foo: 'bar'})
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.set('node', false, 'json', {foo: 'bar'})
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.set('node', 1, 'json', '')
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.create('node', 'json', {foo: 'bar'})
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.create('node', 'json', false)
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

          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.delete('node', 1)
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
          Hydrant = requireSubvert.require('../lib/hydrant');
          hydrant = new Hydrant('http://foo.dev', {user: 'a', pass: 'b'});
          hydrant.delete('node', false)
            .catch(err => {
              test.equal(true, err instanceof Error);
              test.equal('Expected parameter entityId must be a number', err.message, 'Unexpected error returned.');
              test.done();
            });
        }
      }
    }
  }
};
