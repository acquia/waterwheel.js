const axios = require('axios');
const qs = require('qs');

module.exports = class OAuth {
  constructor(basePath, OAuthOptions) {
    this.basePath = basePath;
    this.tokenInformation = Object.assign({}, OAuthOptions);
  }
  /**
   * Fetch an OAuth Token.
   * @param {object} fetchOptions
   *   Options passed to the POST request.
   * @param {string} fetchOptions.grant_type
   *   The type of grant you are requesting.
   * @param {string} fetchOptions.client_id
   *   The ID of the OAuth Client.
   * @param {string} fetchOptions.client_secret
   *   The secret set when the Client was created.
   * @param {string} fetchOptions.username
   *   The resource owner username.
   * @param {string} fetchOptions.password
   *   The resource owner password.
   * @param {string} fetchOptions.scope
   *   The scope of the access request.
   * @return {promise}
   *   The resolved promise of fetching the oauth token.
   */
  fetchToken() {
    return axios({
      method: 'post',
      url: `${this.basePath}/oauth/token`,
      data: qs.stringify(this.tokenInformation)
    })
      .then(response => {
        let t = new Date();
        t.setSeconds(+t.getSeconds() + response.data.expires_in);
        this.tokenExpireTime = t.getTime();
        Object.assign(this.tokenInformation, response.data);
        return response.data;
      });
  }
  /**
   * Refresh an OAuth Token.
   * @return {promise}
   *   The resolved promise of refreshing an oauth token.
   */
  refreshToken() {
    return axios({
      method: 'post',
      url: `${this.basePath}/oauth/token`,
      data: qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: this.tokenInformation.refresh_token,
        client_id: this.tokenInformation.client_id,
        client_secret: this.tokenInformation.client_secret,
        scope: this.tokenInformation.scope
      })
    })
      .then(response => {
        let t = new Date();
        t.setSeconds(+t.getSeconds() + response.data.expires_in);
        this.tokenExpireTime = t.getTime();
        Object.assign(this.tokenInformation, response.data);
        return response.data;
      });
  }
};
