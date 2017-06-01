const methods = require('./helpers/methods');

module.exports = class Entity {
  /**
   * Construct a new Entity
   * @param {object} options
   *   The configuration used to create this entity.
   * @param {string} options.base
   *   The base URL
   * @param {object} options.methods
   *   The paths representing each CRUD action.
   * @param {string} options.methods.get
   *   GET Action
   * @param {string} options.methods.patch
   *   PATCH Action
   * @param {string} options.methods.post
   *   POST Action
   * @param {string} options.methods.delete
   *   DELETE Action
   * @param {string} options.more
   *   A path partial repreenting the location of field data about the expected bundle.
   * @param {number} [options.timeout=500]
   *   How long Axios should wait before canceling a request.
   * @param {string} options.bundle
   *   The bundle that this entity is included in.
   * @param {string} options.entity
   *   The name of the actual entity.
   * @param {object} options.metadata
   *   An object with field-level meta data.
   * @param {array} options.metadata.requiredFields
   *   An array of field names required when creating an entity.
   * @param {object} options.metadata.properties
   *   An object describing all the fields on a bundle and their properties.
   * @param {object} request
   *   A shared requestor class instance.
   */
  constructor(options, request) {
    this.options = options;
    this.request = request;
  }

  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {number|string} identifier
   *   The ID of name of the entity being requested.
   * @param {string} [format=json]
   *   The format for the requested content.
   * @returns {Promise}
   *   A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(identifier, format = 'json') {
    return !this.options.methods.hasOwnProperty(methods.get) ?
      Promise.reject(`The method, ${methods.get}, is not available.`) :
      this.request.issueRequest(methods.get, `${this.options.methods.get.path.replace(this.options.methods.get.path.match(/\{.*?\}/), identifier)}?_format=${format}`, '');
  }

  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {number|string} identifier
   *   The ID of name of the entity being requested.
   * @param {object} body
   *   An object containing the request body to be sent.
   * @param {string} [format=application/json]
   *   The format for the requested content.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  patch(identifier, body = {}, format = 'application/json') {
    return !this.options.methods.hasOwnProperty(methods.patch) ?
      Promise.reject(`The method, ${methods.patch}, is not available.`) :
      this.request.getXCSRFToken()
        .then((csrfToken) => this.request.issueRequest(methods.patch, `${this.options.methods.patch.path.replace(this.options.methods.patch.path.match(/\{.*?\}/), identifier)}`, csrfToken, {'Content-Type': format}, body));
  }

  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {object} body
   *   An object containing the request body to be sent.
   * @param {string} [format=application/json]
   *   The format of the content being posted.
   * @param {bool} skipFieldValidation
   *   A shortcut to skip field validation.
   * @returns {Promise}
   *   A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  post(body, format = 'application/json', skipFieldValidation) {
    if (!this.options.methods.hasOwnProperty(methods.post)) {
      return Promise.reject(`The method, ${methods.post}, is not available.`);
    }
    if (skipFieldValidation) {
      // Check to see if the required fields match the passed fields.
      const checkedFields = this.checkRequiredFields(body);
      if (checkedFields.length) {
        return Promise.reject(`The following fields, ${checkedFields.join(', ')}, are required.`);
      }
    }

    return this.request.getXCSRFToken()
      .then((csrfToken) => this.request.issueRequest(methods.post, this.options.methods.post.path, csrfToken, {'Content-Type': format}, body));
  }

  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {number|string} identifier
   *   The ID of name of the entity being requested.
   * @returns {Promise}
   *   A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(identifier) {
    return !this.options.methods.hasOwnProperty(methods.delete) ?
      Promise.reject(`The method, ${methods.delete}, is not available.`) :
      this.request.getXCSRFToken()
        .then((csrfToken) => this.request.issueRequest(methods.delete, `${this.options.methods.delete.path.replace(this.options.methods.delete.path.match(/\{.*?\}/), identifier)}`, csrfToken));
  }

  /**
   * Checks to see if the required fields are present when submitting a POST request.
   * @param {object} body
   *   The post body data.
   * @returns {array}
   *   An array of keys.
   */
  checkRequiredFields(body) {
    const availableBodyKeys = Object.keys(body);
    return this.options.metadata.requiredFields.filter(key => !availableBodyKeys.includes(key));
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
  setFields(identifier, fields) {
    const availableFieldKeys = Object.keys(this.options.metadata.properties);
    const nonMatchedFields = Object.keys(fields)
      .map(fieldKey => {
        if (!availableFieldKeys.includes(fieldKey)) {
          return fieldKey;
        }
        return false;
      }).filter(Boolean);

    if (nonMatchedFields.length){
      return Promise.reject(new Error(`The ${nonMatchedFields.length > 1 ? 'fields' : 'field'}, ${nonMatchedFields.join(', ')}, ${nonMatchedFields.length > 1 ? 'are' : 'is'} not included within the bundle, ${this.options.bundle}.`));
    }
    let postBody = {};

    Object.keys(fields).forEach(fieldNameToSet => {
      const fieldSpec = this.options.metadata.properties[fieldNameToSet];

      // This assumes we are always going to be wrapping the response in an array.
      postBody[fieldNameToSet] = [];

      const fieldValueWrapper = {};
      Object.keys(fieldSpec.items.properties).forEach(prop => {
        if (fields[fieldNameToSet].hasOwnProperty(prop)){
          fieldValueWrapper[prop] = fields[fieldNameToSet][prop];
        }
      });

      postBody[fieldNameToSet].push(fieldValueWrapper);
    });

    postBody.type = [{
      target_id: this.options.bundle,
      target_type: `${this.options.entity}_type`
    }];
    return this.patch(identifier, postBody);
  }
};
