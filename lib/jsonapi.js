const methods = require('./helpers/methods');

const qs = require('qs');

module.exports = class JSONAPI {
  constructor(options, request) {
    this.request = request;
    this.jsonapiPrefix = options.jsonapiPrefix || 'jsonapi';
  }

  /**
   * GET jsonapi
   *
   * @param {string} resource
   *   The relative path to fetch from the API.
   * @param {object} params
   *   GET arguments to send with the request.
   * @param {string} id
   *   An ID of an individual item to request.
   * @return {promise}
   *   Resolves when the request is fulfilled, rejects if there's an error.
 */
  get(resource, params, id = false) {
    const url = `/${this.jsonapiPrefix}/${resource}${id ? `/${id}` : ''}${Object.keys(params).length ? `?${qs.stringify(params, {indices: false})}` : ''}`;
    return this.request.issueRequest(methods.get, url);
  }

  /**
   * POST jsonapi
   *
   * @param {string} resource
   *   The relative path to fetch from the API.
   * @param  {object} body
   *   JSON data sent to Drupal
   * @return {promise}
   *   Resolves when the request is fulfilled, rejects if there's an error.
   */
  post(resource, body) {
    return this.request.issueRequest(
      methods.post,
      `/${this.jsonapiPrefix}/${resource}`,
      '',
      {
        'Content-Type': 'application/vnd.api+json'
      },
      body
    );
  }

  /**
   * PATCH jsonapi
   *
   * @param {string} resource
   *   The relative path to fetch from the API.
   * @param  {object} body
   *   JSON data sent to Drupal
   * @return {promise}
   *   Resolves when the request is fulfilled, rejects if there's an error.
   */
  patch(resource, body) {
    return this.request.issueRequest(
      methods.patch,
      `/${this.jsonapiPrefix}/${resource}`,
      '',
      {
        'Content-Type': 'application/vnd.api+json'
      },
      body
    );
  }

  /**
   * DELETE jsonapi
   *
   * @param {string} resource
   *   The relative path to fetch from the API.
   * @param {string} id
   *   An ID of an individual item to delete.
   * @return {promise}
   *   Resolves when the request is fulfilled, rejects if there's an error.
 */
  delete(resource, id) {
    const url = `/${this.jsonapiPrefix}/${resource}/${id}`;
    return this.request.issueRequest(
      methods.delete,
      url,
      '',
      {
        'Content-Type': 'application/vnd.api+json'
      }
    );
  }

};
