const methods = require('./methods');
const axios = require('axios');
const qs = require('qs');

module.exports = class OAuth {
  constructor(basePath, OAuthOptions) {
    this.basePath = basePath;
    this.tokenInformation = Object.assign({}, OAuthOptions);
    this.tokenInformation.grant_type = 'password'; // eslint-disable-line camelcase
  }
  /**
   * Get an OAuth Token.
   * @return {promise}
   *   The resolved promise of fetching the oauth token.
   */
  getToken() {
    const currentTime = new Date().getTime();
    // Resolve if token already exists and is fresh
    if (this.tokenInformation.access_token && (
      this.hasOwnProperty('tokenExpireTime') &&
      this.tokenExpireTime > currentTime
    )) {
      return Promise.resolve();
    }
    // If token is already being fetched, use that one.
    else if (this.bearerPromise) {
      return this.bearerPromise;
    }
    // If token has already been fetched switch grant_type to refresh_token.
    else if (this.tokenInformation.access_token) {
      this.tokenInformation.grant_type = 'refresh_token'; // eslint-disable-line camelcase
    }

    this.bearerPromise = axios({
      method: methods.post,
      url: `${this.basePath}/oauth/token`,
      data: qs.stringify(this.tokenInformation)
    })
    .then(response => {
      delete this.bearerPromise;
      let t = new Date();
      t.setSeconds(+t.getSeconds() + response.data.expires_in);
      this.tokenExpireTime = t.getTime();
      Object.assign(this.tokenInformation, response.data);
      return response.data;
    })
    .catch(e => {
      delete this.bearerPromise;
      return Promise.reject(e);
    });

    return this.bearerPromise;
  }
};
