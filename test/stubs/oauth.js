const qs = require('qs');

module.exports = class OAuth {
  constructor(basePath, OAuthOptions) {
    this.basePath = basePath;
    this.tokenInformation = Object.assign({}, OAuthOptions);
  }
  getToken() {
    return Promise.resolve({
      'token_type': 'Bearer',
      'expires_in': 60,
      'access_token': '1234',
      'refresh_token': '456'
    })
      .then(response => {
        let t = new Date();
        t.setSeconds(+t.getSeconds() + response.expires_in);
        this.tokenExpireTime = t.getTime();
        Object.assign(this.tokenInformation, response);
        return response;
      });
  }
};
