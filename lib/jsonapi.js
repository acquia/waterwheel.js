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
    const format = 'api_json';
    const url = `/${this.jsonapiPrefix}/${resource}${id ? `/${id}` : ''}?_format=${format}${Object.keys(params).length ? `&${qs.stringify(params, {indices: false})}` : ''}`;
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
    const format = 'api_json';
    return this.request.issueRequest(
      methods.post,
      `/${this.jsonapiPrefix}/${resource}?_format=${format}`,
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
    return this.request.issueRequest(
      methods.patch,
      `/${this.jsonapiPrefix}/${resource}?_format=${format}`,
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
    const format = 'api_json';
    const url = `/${this.jsonapiPrefix}/${resource}/${id}?_format=${format}`;
    return this.request.issueRequest(
      methods.delete,
      url,
      '',
      {
        'Content-Type': 'application/vnd.api+json'
      }
    );
  }

  /**
   * Send unlimited subrequests to Drupal
   * @param  {array}  [requests=[]]
   *   An array of subrequests to make.
   * @return {promise}
   *   A resolved promise with the processed multipart response.
   */
  subRequests(requests = []) {
    return this.request.axios.get(`${this.request.options.base}/subrequests?_format=json&query=${JSON.stringify(
      requests.map(request => Object.assign({
        requestId: `waterwheel-${Math.random().toString(36).substr(2, 10)}`,
        action: 'view',
        headers: {
          'Accept': 'application/json'
        }}, typeof request === 'string' || request instanceof String ?
          {uri: request} :
          request.hasOwnProperty('options') && Object.keys(request.options).length && request.options.constructor === Object ?
            Object.assign(request, {uri: `${request.uri}?${qs.stringify(request.options, {indices: false})}`}) :
            request
      ))
    )}`)
    .then(({data}) => data
      .split(data.match('\-\-.*\\r\\n')[0].trim())
      .filter(possibleJSONData => possibleJSONData !== '' && possibleJSONData !== '--')
      .map(jsonData => JSON.parse(jsonData.split('\n\r')[1]))
    );
  }

  merge({data, included}) {
    return new Promise((resolve, reject) => {

      return resolve(
        data.map((item) => {
          const relationships = Object.keys(item.relationships);
          relationships.forEach((relationship) => {
            let relationshipToAttach = included.filter(include => (
              item.relationships[relationship].data.id === include.id && item.relationships[relationship].data.type === include.type
            ));
            item.relationships[relationship] = Object.assign(item.relationships[relationship], relationshipToAttach[0]);
            // item.relationships[relationship] = relationshipToAttach.length ? relationshipToAttach[0] : item.relationships[relationship];
          });
          return item;
        })
      );
    });
  }

};
