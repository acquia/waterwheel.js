const Request = require('./helpers/request');
const methods = require('./helpers/methods');

module.exports = class Entity extends Request {

  constructor(base, credentials, paths) {
    // Call the parents constructor.
    super(base, credentials);
    this.paths = paths;
  }

  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {number|string} token
   *  The ID of name of the entity being requested.
   * @param {string} [format=json]
   *  The format for the requested content.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(token, format = 'json') {
    return this.issueRequest(methods.get, `${this.paths.get}/${token}?_format=${format}`, '');
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {number|string} token
   *  The ID of name of the entity being requested.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} [format=json]
   *  The format for the requested content.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(token, body = {}, format = 'json') {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.patch, `${this.paths.set}/${token}?_format=${format}`, csrfToken, {}, body));
  }

  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} [format=application/json]
   *  The format of the content being posted.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  create(body, format = 'application/json') {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.post, this.paths.create, csrfToken, {'Content-type': format}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {number|string} token
   *  The ID of name of the entity being requested.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(token) {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.delete, `${this.paths.delete}/${token}`, csrfToken));
  }

};
