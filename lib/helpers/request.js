const Base = require('./base');
const methods = require('./methods');

module.exports = class Request extends Base {
  /**
   * Create an instance of the Request class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   * @param {object} oauth
   *   The OAuth options.
   */
  constructor(options, oauth) {
    super(options);
    this.oauth = oauth;
    this.axios = require('axios');
  }

  /**
   * Issue a generic XMLHttpRequest.
   * @param {string} method
   *  The HTTP method to be used in the request.
   * @param {string} url
   *  The URL against which to issue the request.
   * @param {string} XCSRFToken
   *  An X-CSRF-Token from Drupals REST API.
   * @param {object} additionalHeaders
   *  An object containing additional request header key-value pairs.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} baseOverride
   *   Override the base URL in special scenarios.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response from the request.
   */
  issueRequest(method, url, XCSRFToken, additionalHeaders, body, baseOverride) {
    return (this.options.accessCheck && this.options.validation ?
      this.oauth.getToken() :
      Promise.resolve()
    )
    .then(() => {
      const options = {
        method: method,
        timeout: this.options.timeout,
        url: `${baseOverride || this.options.base}/${url.charAt(0) === '/' ? url.slice(1) : url}`,
        headers: {
          'X-CSRF-Token': XCSRFToken
        }
      };

      if (this.options.accessCheck && this.options.validation) {
        options.headers.Authorization = `Bearer ${this.oauth.tokenInformation.access_token}`;
      }

      // If this is a GET request,
      // or we didn't pass a token drop the X-CSRF-Token header.
      if (method === methods.get || !XCSRFToken) {
        delete options.headers['X-CSRF-Token'];
      }

      // If we have additionalHeaders, set them.
      // @TODO: This is NOT the safest way, so be careful.
      if (additionalHeaders && Object.keys(additionalHeaders).length !== 0) {
        Object.keys(additionalHeaders).forEach(key => {
          options.headers[key] = additionalHeaders[key];
        });
      }

      if (body) {
        options.data = body;
      }

      return this.axios(options)
        .then(res => Promise.resolve(res.data))
        .catch(err => {
          const error = new Error();
          if (err.message && err.message.indexOf('timeout') !== -1) {
            error.message = 'Timeout';
            error.status = 408;
          }
          else {
            error.message = err.response ? err.response.data.message : 'Unknown error.';
            error.status = err.response ? err.response.status : 500;
          }

          return Promise.reject(error);
        });
    });
  }
  /**
   * Get an X-CSRF-Token from Drupal's REST module.
   * @return {Promise}
   *  A Promise that when fulfilled returns a response containing the X-CSRF-Token.
   */
  getXCSRFToken() {
    if (this.csrfToken) {
      return Promise.resolve(this.csrfToken);
    }
    return new Promise((resolve, reject) => {
      this.axios({method: 'get', url: `${this.options.base}/rest/session/token`})
        .then(res => {
          this.csrfToken = res.data;
          return resolve(res.data);
        })
        .catch(err => reject(err));
    });
  }
};
