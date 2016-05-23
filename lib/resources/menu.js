const Request = require('../helpers/request');

module.exports = class Menu extends Request {

  constructor(base, credentials) {
    // Call the parents constructor.
    super(base, credentials);
  }

  /**
   * Get a Menu entity in Drupal through REST (GET).
   * @param {string} menuName
   *  The menu name.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options
   *  An object containing additional optional parameters needed to issue request.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(menuName, format = 'json') {
    if (typeof menuName !== 'string') {
      return Promise.reject(new Error('Expected parameter menuName must be a string'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `entity/menu/${menuName}?_format=${format}`, token));
  }

  /**
   * Update or set a Menu entity in Drupal through REST (PATCH).
   * @param {string} menuName
   *  The menu name.
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(menuName, format = 'json', body = {}) {
    if (typeof menuName !== 'string') {
      return Promise.reject(new Error('Expected parameter entityId must be a number'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('PATCH', `entity/menu/${menuName}?_format=${format}`, token, {}, body));
  }

  /**
   * Create a Menu entity in Drupal through REST (POST).
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
      .then((token) => this.issueRequest('POST', 'entity/menu', token, {'Content-type': 'application/json'}, body));
  }

  /**
   * Delete a Menu entity in Drupal through REST (DELETE).
   * @param {string} menuName
   *  The menu name.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(menuName) {
    if (typeof menuName !== 'string') {
      return Promise.reject(new Error('Expected parameter menuName must be a string'));
    }
    return this.getXCSRFToken()
      .then((token) => this.issueRequest('DELETE', `entity/menu/${menuName}`, token));
  }

};
