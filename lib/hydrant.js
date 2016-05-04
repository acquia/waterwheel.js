const axios = require('axios');

module.exports = class Hydrant {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base
   *  The base path of the Drupal site.
   * @param {object} credentials
   *  An object containing a Drupal username (user) and password (pass).
   */
  constructor(base, credentials) {
    // Every instance of Hydrant has a base path and base credentials.
    this.base = base;
    this.credentials = credentials;
  }

  /**
   * Set the current credentials.
   * @param {object} credentials
   *   The credentials object.
   * @param {object} credentials.user
   *   The Drupal user making the request.
   * @param {object} credentials.pass
   *   The password for the above user.
   */
  setCredentials(credentials) {
    this.credentials = credentials;
  }

  /**
   * Get the current credentials object.
   * @return {object}
   *   The current credentials, .user and .pass.
   */
  getCredentials() {
    return this.credentials;
  }

  /**
   * Set the base url.
   * @param {string} base
   *   The base url.
   */
  setBase(base) {
    this.base = base;
  }

  /**
   * Get the base url
   * @return {string}
   *   The base url.
   */
  getBase() {
    return this.base;
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
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response from the request.
   */
  issueRequest(method, url, XCSRFToken, additionalHeaders, body) {
    return new Promise((resolve, reject) => {
      const options = {
        method: method,
        url: `${this.base}/${url.charAt(0) === '/' ? url.slice(1, -1) : url}`,
        auth: this.credentials,
        headers: {
          'X-CSRF-Token': XCSRFToken
        }
      };

      // If we have additionalHeaders, set them.
      // @TODO: This is NOT the safest way, so be careful.
      if (additionalHeaders && Object.keys(additionalHeaders).length !== 0) {
        Object.keys(additionalHeaders).forEach(key => {
          options.headers[key] = additionalHeaders[key];
        });
      }

      if (body) {
        options.body = body;
      }

      axios(options)
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }
  /**
   * Get an X-CSRF-Token from Drupal's REST module.
   * @return {Promise}
   *  A Promise that when fulfilled returns a response containing the X-CSRF-Token.
   */
  getXCSRFToken() {
    return new Promise((resolve, reject) => {
      axios({method: 'get', url: `${this.base}/rest/session/token`})
        .then(res => resolve(res.data))
        .catch(err => reject(err));
    });
  }
  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {string} entityType
   *  The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId
   *  The content entity ID.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options
   *  An object containing additional optional parameters needed to issue request.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(entityType = 'node', entityId, format = 'json') {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `${entityType}/${entityId}?_format=${format}`, token));
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {string} entityType
   *  The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId
   *  The content entity ID.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */

  set(entityType = 'node', entityId, format = 'json', body) {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('PATCH', `${entityType}/${entityId}?_format=${format}`, token, {}, body instanceof Object ? body : null));
  }

  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {string} entityType
   *  The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */

  create(entityType = 'node', format = 'json', body) {
    if (!(body instanceof Object)) {
      return Promise.reject(new Error('Expected parameter body must be an Object'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('POST', `entity/${entityType}`, token, {}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {string} entityType
   *  The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId
   *  The content entity ID.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */

  delete(entityType = 'node', entityId) {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('DELETE', `${entityType}/${entityId}`, token));
  }

};
