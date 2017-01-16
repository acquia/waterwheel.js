const test = require('ava');
const rs = require('require-subvert')(__dirname);

test.beforeEach(t => {
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

test.afterEach(t => {
  rs.cleanUp();
});

test('Fetch Token', t => {
  rs.subvert('axios', () => Promise.resolve({
    data: {
      'token_type': 'Bearer',
      'expires_in': 60,
      'access_token': '1234',
      'refresh_token': '456'
    }
  }));
  const OAuth = rs.require('../lib/helpers/oauth');
  const oauth = new OAuth(t.context.baseURL, t.context.oauthOptions);

  return oauth.getToken()
    .then(r => {
      t.deepEqual(oauth.tokenInformation, {
        grant_type: 'password',
        client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
        client_secret: 'password',
        username: 'admin',
        password: 'password',
        scope: 'administrator',
        token_type: 'Bearer',
        expires_in: 60,
        access_token: '1234',
        refresh_token: '456'
      })
    });
});

test('Refresh Expired Token', t => {
  const currentTime = new Date().getTime();
  rs.subvert('axios', () => Promise.resolve({
    data: {
      'token_type': 'Bearer',
      'expires_in': 60,
      'access_token': '5678',
      'refresh_token': '789'
    }
  }));
  const OAuth = rs.require('../lib/helpers/oauth');
  const existingTokens = { access_token: '1234', refresh_token: '456' };
  const oauth = new OAuth(t.context.baseURL, Object.assign(t.context.oauthOptions, existingTokens));
  oauth.tokenExpireTime =  currentTime - 100;

  return oauth.getToken()
    .then(r => {
      t.deepEqual(oauth.tokenInformation, {
        grant_type: 'refresh_token',
        client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
        client_secret: 'password',
        username: 'admin',
        password: 'password',
        scope: 'administrator',
        token_type: 'Bearer',
        expires_in: 60,
        access_token: '5678',
        refresh_token: '789'
      })
    });
});

test('Existing OAuth Token', t => {
  rs.subvert('axios', () => Promise.resolve({
    data: {
      'token_type': 'Bearer',
      'expires_in': 60,
      'access_token': '5678',
      'refresh_token': '789'
    }
  }));
  const currentTime = new Date().getTime();
  const OAuth = rs.require('../lib/helpers/oauth');
  const existingTokens = { access_token: '1234', refresh_token: '456' };
  const oauth = new OAuth(t.context.baseURL, Object.assign(t.context.oauthOptions, existingTokens));
  oauth.tokenExpireTime =  currentTime + 100;

  return oauth.getToken()
    .then(r => {
      delete oauth.tokenInformation.tokenExpireTime;
      t.deepEqual(oauth.tokenInformation, {
        grant_type: 'password',
        client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
        client_secret: 'password',
        username: 'admin',
        password: 'password',
        scope: 'administrator',
        access_token: '1234',
        refresh_token: '456'
      })
    });
});

test('Reuse existing request for new token', t => {
  rs.subvert('axios', () => Promise.reject(new Error('No request should be made if the token already exists.')));
  const currentTime = new Date().getTime();
  const OAuth = rs.require('../lib/helpers/oauth');
  const existingTokens = { access_token: '1234', refresh_token: '456' };
  const oauth = new OAuth(t.context.baseURL, Object.assign(t.context.oauthOptions, existingTokens));
  // Create an existing promise, as if a request for a new token had already been made. Resolve to `1` for simplicity.
  oauth.bearerPromise = new Promise((resolve) => setTimeout(() => resolve(1), 100));
  return oauth.getToken()
    .then(r => {
      // Ensure that getToken resolve the existing promise with it's value.
      t.is(r, 1);
    });
});

test('Remove bearerPromise when request for token fails', t => {
  const OAuth = rs.require('../lib/helpers/oauth');
  const oauth = new OAuth(t.context.baseURL, t.context.oauthOptions);
  rs.subvert('axios', () => Promise.reject());
  return oauth.getToken()
    .catch(e => {
      t.falsy(oauth.bearerPromise);
    })
});
