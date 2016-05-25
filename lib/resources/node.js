const Request = require('../helpers/request');

module.exports = class Node extends Request {

  constructor(base, credentials) {
    // Call the parents constructor.
    super(base, credentials);
  }

  /**
   * Get a content entity in Drupal through REST (GET).
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
  get(entityId, format = 'json') {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `node/${entityId}?_format=${format}`, token));
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {number} entityId
   *  The content entity ID.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(entityId, format = 'json', body = {}) {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('PATCH', `node/${entityId}?_format=${format}`, token, {}, body));
  }

  /**
   * Create a content entity in Drupal through REST (POST).
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
      .then((token) => this.issueRequest('POST', 'entity/node', token, {'Content-type': 'application/json'}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {number} entityId
   *  The content entity ID.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(entityId) {
    if (!Number.isInteger(entityId)) {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('DELETE', `node/${entityId}`, token));
  }

};
