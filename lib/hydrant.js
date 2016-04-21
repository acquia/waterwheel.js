/** Class representing a Hydrant. */
class Hydrant {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   */
  constructor(base, creds) {
    // Every instance of Hydrant has a base path and base credentials.
    this.base = base;
    this.creds = creds;
  }
  /**
   * Get a Basic Authentication token from Drupal.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @return {string} A Basic Authentication token containing a base64-encoded username-password pair.
   */
  generateBasicAuthToken(creds) {
    // Use default credentials from constructor if no argument is found.
    var credentials = (typeof creds === 'undefined') ? this.creds : creds;
    // @TODO: Figure out an alternative for server-side execution.
    return 'Basic ' + btoa(credentials.user + ':' + credentials.pass);
  }
  /**
   * Prepare method-agnostic parameters for use by XMLHttpRequest.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options - An object containing additional optional parameters needed to issue request.
   * @param {string} options.base - The base path of the Drupal site.
   * @param {object} options.creds - An object containing a Drupal username (user) and password (pass).
   * @returns {object} An object containing parameters for use by XMLHttpRequest.
   */
  prepareRequestParams(format = 'json', options) {
    var requestHeaders = {
          'Content-Type': 'application/' + format,
          'X-CSRF-Token': this.getXCSRFToken()
        },
        requestBase;
    // Define base and creds if given.
    if (typeof options != 'undefined') {
      requestHeaders['Authorization'] = this.generateBasicAuthToken(
        (typeof options.creds != 'undefined') ? options.creds : this.creds
      );
      requestBase = (typeof options.base != 'undefined') ? options.base : this.base;
    }
    else {
      requestHeaders['Authorizaton'] = this.generateBasicAuthToken(this.creds);
      requestBase = this.base;
    }
    // Return params object.
    return {
      headers: requestHeaders,
      base: requestBase
    };
  }
  /**
   * Issue a generic XMLHttpRequest.
   * @param {string} method - The HTTP method to be used in the request.
   * @param {string} url - The URL against which to issue the request.
   * @param {object} headers - An object containing request header key-value pairs.
   * @param {object} body - An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response from the request.
   */
  issueRequest(method, url, headers, body) {
    return new Promise(function pr(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open(method, url, true);
      if (typeof headers != 'undefined') {
        for (var prop in headers) {
          request.setRequestHeader(prop, headers[prop]);
        }
      }
      request.onload = function () {
        // @TODO: Handle other response codes properly.
        if (request.status >= 200 && request.status < 400) {
          resolve(request.response);
          console.log(request.response);
        }
        else {
          // @TODO: Handle error properly.
          reject('Error: Status code ' + request.status + ' on XMLHttpRequest: ' + method + ' at ' + url);
        }
      };
      request.onerror = function () {
        // @TODO: Handle error properly.
        reject('Error: Network error on XMLHttpRequest: ' + method + ' at ' + url);
      };
      request.send((typeof body === 'undefined') ? null : JSON.stringify(body));
    });
  }
  /**
   * Get an X-CSRF-Token from Drupal's REST module.
   * @param {string} base - The base path of the Drupal site.
   * @return {Promise} A Promise that when fulfilled returns a response containing the X-CSRF-Token.
   */
  getXCSRFToken(base) {
    return this.issueRequest('GET', ((typeof base === 'undefined') ? this.base : base) + '/rest/session/token');
  }
  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} options - An object containing additional optional parameters needed to issue request.
   * @param {string} options.base - The base path of the Drupal site.
   * @param {object} options.creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(entityType = 'node', entityId, format = 'json', options) {
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
      return;
    }
    else {
      var params = this.prepareRequestParams(format, options);
      return this.issueRequest(
        'GET',
        params.base + '/' + entityType + '/' + entityId.toString() + '?_format=' + format,
        params.headers
      );
    }
  }
  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body - An object containing the request body to be sent.
   * @param {object} options - An object containing additional optional parameters needed to issue request.
   * @param {string} options.base - The base path of the Drupal site.
   * @param {object} options.creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(entityType = 'node', entityId, format = 'json', body, options) {
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
      return;
    }
    else {
      var params = this.prepareRequestParams(format, options);
      return this.issueRequest(
        'PATCH',
        params.base + '/' + entityType + '/' + entityId,
        params.headers,
        (typeof body === 'object') ? body : null
      );
    }
  }
  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {object} body - An object containing the request body to be sent.
   * @param {object} options - An object containing additional optional parameters needed to issue request.
   * @param {string} options.base - The base path of the Drupal site.
   * @param {object} options.creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  create(entityType = 'node', format = 'json', body, options) {
    var params = this.prepareRequestParams(format, options);
    return this.issueRequest(
      'POST',
      params.base + '/entity/' + entityType,
      params.headers,
      (typeof body === 'object') ? body : null
    );
  }
  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {object} options - An object containing additional optional parameters needed to issue request.
   * @param {string} options.base - The base path of the Drupal site.
   * @param {object} options.creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(entityType = 'node', entityId, options) {
    // Define request entityId.
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
      return;
    }
    else {
      var params = this.prepareRequestParams(format, options);
      return this.issueRequest(
        'DELETE',
        params.base + '/' + entityType + '/' + entityId,
        params.headers
      );
    }
  }
}
