const Request = require('../helpers/request');

module.exports = class ContentType extends Request {

  constructor(base, credentials) {
    // Call the parents constructor.
    super(base, credentials);
  }

  /**
   * Get a Content Type entity in Drupal through REST (GET).
   * @param {string} contentType
   *  The content type name.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options
   *  An object containing additional optional parameters needed to issue request.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(contentType, format = 'json') {
    if (typeof contentType !== 'string') {
      return Promise.reject(new Error('Expected parameter contentType must be a string'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `/entity/node_type/${contentType}?_format=${format}`, token));
  }

  /**
   * Update or set a Content Type entity in Drupal through REST (PATCH).
   * @param {string} contentType
   *  The content type name.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(contentType, format = 'json', body = {}) {
    if (typeof contentType !== 'string') {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('PATCH', `/entity/node_type/${contentType}?_format=${format}`, token, {}, body));
  }

  /**
   * Create a Content Type entity in Drupal through REST (POST).
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  create(format = 'json', body) {
    if (!(body instanceof Object)) {
      return Promise.reject(new Error('Expected parameter body must be an Object'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('POST', '/entity/node_type', token, {'Content-type': 'application/json'}, body));
  }

  /**
   * Delete a Content Type entity in Drupal through REST (DELETE).
   * @param {string} contentType
   *  The content type name.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(contentType) {
    if (typeof contentType !== 'string') {
      return Promise.reject(new Error('Expected parameter contentType must be a string'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('DELETE', `/entity/node_type/${contentType}`, token));
  }

};
