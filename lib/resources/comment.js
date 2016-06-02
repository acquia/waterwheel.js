const Request = require('../helpers/request');
const methods = require('../helpers/methods');

module.exports = class Comment extends Request {

  constructor(base, credentials) {
    // Call the parents constructor.
    super(base, credentials);
  }

  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {number} commentId
   *  The content entity ID.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options
   *  An object containing additional optional parameters needed to issue request.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(commentId, format = 'json') {
    if (!Number.isInteger(commentId)) {
      return Promise.reject(new Error('Expected parameter commentId must be a number'));
    }
    return this.issueRequest(methods.get, `comment/${commentId}?_format=${format}`, '');
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {number} commentId
   *  The content entity ID.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(commentId, format = 'json', body = {}) {
    if (!Number.isInteger(commentId)) {
      return Promise.reject(new Error('Expected parameter commentId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest(methods.patch, `comment/${commentId}?_format=${format}`, token, {}, body));
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
      .then((token) => this.issueRequest(methods.post, 'comment', token, {'Content-type': 'application/json'}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {number} commentId
   *  The content entity ID.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(commentId) {
    if (!Number.isInteger(commentId)) {
      return Promise.reject(new Error('Expected parameter commentId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest(methods.delete, `comment/${commentId}`, token));
  }

};
