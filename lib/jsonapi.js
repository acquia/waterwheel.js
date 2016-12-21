const Request = require('./helpers/request');
const methods = require('./helpers/methods');

const qs = require('qs');

module.exports = class JSONAPI extends Request {
  constructor(options) {
    super(options);
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
    const format = 'api_json';
    const url = `/api/${resource}${id ? `/${id}` : ''}?_format=${format}${Object.keys(params).length ? `&${qs.stringify(params, {indices: false})}` : ''}`;
    return this.issueRequest(methods.get, url, '');
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
    const format = 'api_json';
    return this.issueRequest(
      methods.post,
      `/api/${resource}?_format=${format}`,
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
    const format = 'api_json';
    return this.issueRequest(
      methods.patch,
      `/api/${resource}?_format=${format}`,
      '',
      {
        'Content-Type': 'application/vnd.api+json'
      },
      body
    );
  }

};
