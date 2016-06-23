const Request = require('./helpers/request');
const methods = require('./helpers/methods');

module.exports = class Entity extends Request {

  constructor(base, credentials, paths, entity, bundle, options) {
    // Call the parents constructor.
    super(base, credentials);

    this.paths = paths;
    this.paths.OPTIONS = options;

    this.entity = entity;
    this.bundle = bundle;

    this.metadata = {};
  }

  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {number|string} identifier
   *  The ID of name of the entity being requested.
   * @param {string} [format=json]
   *  The format for the requested content.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(identifier, format = 'json') {
    return this.issueRequest(methods.get, `${this.paths.GET.replace(this.paths.GET.match(/\{.*?\}/), identifier)}?_format=${format}`, '');
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {number|string} identifier
   *  The ID of name of the entity being requested.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} [format=json]
   *  The format for the requested content.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  patch(identifier, body = {}, format = 'json') {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.patch, `${this.paths.PATCH.replace(this.paths.GET.match(/\{.*?\}/), identifier)}?_format=${format}`, csrfToken, {}, body));
  }

  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} [format=application/json]
   *  The format of the content being posted.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  post(body, format = 'application/json') {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.post, this.paths.POST, csrfToken, {'Content-type': format}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {number|string} identifier
   *  The ID of name of the entity being requested.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(identifier) {
    return this.getXCSRFToken()
      .then((csrfToken) => this.issueRequest(methods.delete, `${this.paths.DELETE.replace(this.paths.GET.match(/\{.*?\}/), identifier)}`, csrfToken));
  }

  /**
  * Get field data about the expected bundle
  * @param {string} [format=application/json]
  *  The format of the content being posted.
  * @return {promise}
  *   A promise resolved when the request for field data is complete,
  *   resolves with the field data, if you want it.
  */
  getFieldData(format = 'json'){
    return this.issueRequest(methods.get, `${this.paths.OPTIONS.replace(this.paths.OPTIONS.match(/\{.*?\}/), this.bundle)}?_format=${format}`)
      .then(bundleMetadata => {
        this.metadata = bundleMetadata;
        return Promise.resolve(bundleMetadata);
      });
  }

  /**
   * Set a field on a specific entity
   * @param  {string|number} identifier
   *   The entity we are setting the field on.
   * @param  {string} field
   *   The field name we are setting the data on.
   * @param  {string|array|object} value
   *   The value(s) that are being set.
   * @return  {Promise}
   *   The resolved promise.
   */
  setField(identifier, field, value) {
    return new Promise((resolve, reject) => {
      (!this.metadata.fields
        ? this.getFieldData()
        : Promise.resolve())
      .then(() => {
        if (!Object.keys(this.metadata.fields).includes(field)) {
          return reject(`The field, ${field}, is not included on, ${this.bundle}.`);
        }
        const fieldDetails = this.metadata.fields[field];
        const bodyContent = {type: this.bundle};

        if (typeof value === 'string') {
          bodyContent[field] = [{value: value}];
        }

        if (Array.isArray(value)) {
          bodyContent[field] = value.map(i => ({value: i}));
        }

        else {
          bodyContent[field] = value;
        }

        return this.patch(identifier, bodyContent)
          .then(() => resolve(bodyContent));
      });
    });
  }

};
