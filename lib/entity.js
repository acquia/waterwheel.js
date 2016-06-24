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
   * @param  {object[]|object} fields
   *   The field name we are setting the data on.
   * @param  {object} additionalValues
   *   Any additional values to be appended to the post body.
   * @return  {Promise}
   *   The resolved promise.
   */
  setField(identifier, fields, additionalValues) {
    return new Promise((resolve, reject) => {
      (!this.metadata.fields
        ? this.getFieldData()
        : Promise.resolve())
      .then(() => {

        const availableFieldKeys = Object.keys(this.metadata.fields);
        const nonMatchedFields = (Array.isArray(fields) ? fields : [fields])
          .map(field => (Object.keys(field)[0]))
          .map(fieldKey => {
            if (!availableFieldKeys.includes(fieldKey)) {
              return fieldKey;
            }
            return false;
          }).filter(Boolean);

        if (nonMatchedFields.length){
          return reject(new Error(`The ${nonMatchedFields.length > 1 ? 'fields' : 'field'}, ${nonMatchedFields.join(', ')}, ${nonMatchedFields.length > 1 ? 'are' : 'is'} not included within the bundle, ${this.bundle}.`));
        }
        const bodyContent = {type: this.bundle};

        (Array.isArray(fields) ? fields : [fields]).forEach(field => {
          const fK = Object.keys(field)[0];
          const fV = field[fK];

          if (typeof fV === 'string') {
            bodyContent[fK] = [{value: fV}];
          }
          if (Array.isArray(fV)) {
            bodyContent[fK] = fV.map(i => ({value: i}));
          }
        });

        // Be aware, this is direct copy and will overwrite previously set values.
        if (additionalValues && Object.keys(additionalValues).length !== 0) {
          Object.keys(additionalValues).forEach(key => {
            bodyContent[key] = additionalValues[key];
          });
        }

        return this.patch(identifier, bodyContent)
          .then(() => resolve(bodyContent));
      });
    });
  }

};
