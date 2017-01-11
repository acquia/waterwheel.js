const test = require('ava');
const rs = require('require-subvert')(__dirname);

test.beforeEach(t => {
  // t.context.initData = {
  //   base: 'http://drupal.localhost',
  //   resources: swaggerData,
  //   oauth: {
  //     grant_type: 'password',
  //     client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
  //     client_secret: 'password',
  //     username: 'admin',
  //     password: 'password',
  //     scope: 'administrator'
  //   }
  // };
  // t.context.Waterwheel = requireSubvert.require('../lib/waterwheel');
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

  oauth.fetchToken()
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

test('Refresh Token', t => {
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

  oauth.refreshToken()
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
