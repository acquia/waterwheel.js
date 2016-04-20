/**
 * OUTSTANDING TASKS
 * @TODO: Server-side only, this fills window.btoa
 * import {btoa} from 'btoa';
 * @TODO: Server-side only, this fills XmlHttpRequest
 * import {http} from 'http';
 * @NOTE: Get this working client-side only first. Then build in server-side functionality.
 * @TODO: Determine if getView() needs to be separated out -- what kind of differentiation is necessary between entity types in get()?
 * @TODO: Determine how to save X-CSRF-Token if it's just been GETted so client does not incur additional GETs.
 */

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
  getBasicAuthToken(creds) {
    // Use default credentials from constructor if no argument is found.
    var credentials = (typeof creds === 'undefined') ? this.creds : creds;
    // @TODO: Figure out an alternative for server-side execution.
    // @TODO: Figure out security issues: transparent user and pass.
    return 'Basic ' + btoa(credentials.user + ':' + credentials.pass);
  }
  /**
   * Get an X-CSRF-Token from Drupal's REST module.
   * @param {string} base - The base path of the Drupal site.
   * @return {Promise} A Promise that when fulfilled returns a response containing the X-CSRF-Token.
   */
  getXCSRFToken(base) {
    return issueRequest('GET', ((typeof base === 'undefined') ? this.base : base) + '/rest/session/token');
  }
  /**
   * Get a content entity in Drupal through REST (GET).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity.
   * @TODO: Add fields argument for selectivity: entityType, entityId, format, fields, base, creds
   */
  get(entityType = 'node', entityId, format = 'json', base, creds) {
    // Define request base path and entity type.
    var requestBase = (typeof base === 'undefined') ? this.base : base;
    // Define request entityId.
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
    }
    else {
      var requestEntityId = entityId;
    }
    var requestHeaders = {
      'Content-Type': 'application/' + format
    };
    if (typeof creds != 'undefined') {
      requestHeaders['Authorization'] = this.getBasicAuthToken(creds);
    }
    return issueRequest(
      'GET',
      base + '/' + entityType + '/' + requestEntityId.toString() + '?_format=' + format,
      requestHeaders
    );
  }
  /**
   * Update or set a content entity in Drupal through REST (PATCH).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @param {object} body - An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  set(entityType = 'node', entityId, format = 'json', base, creds, body) {
    // Define request base path.
    var requestBase = (typeof base === 'undefined') ? this.base : base;
    // Define request entityId.
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
    }
    else {
      var requestEntityId = entityId;
    }
    var requestHeaders = {
      'Content-Type': 'application/' + format
    };
    if (typeof creds != 'undefined') {
      requestHeaders['Authorization'] = this.getBasicAuthToken(creds);
    }
    // @TODO: Some sort of validation on body might be necessary.
    return issueRequest(
      'PATCH',
      base + '/' + entityType + '/' + requestEntityId.toString(),
      requestHeaders,
      (typeof body === 'object') ? body : null
    );
  }
  /**
   * Create a content entity in Drupal through REST (POST).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {string} format - The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @param {object} body - An object containing the request body to be sent.
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  create(entityType = 'node', format = 'json', base, creds, body) {
    // Define request base path.
    var requestBase = (typeof base === 'undefined') ? this.base : base;
    var requestHeaders = {
      'Content-Type': 'application/' + format
    };
    if (typeof creds != 'undefined') {
      requestHeaders['Authorization'] = this.getBasicAuthToken(creds);
    }
    // @TODO: Some sort of validation on body might be necessary.
    return issueRequest(
      'POST',
      base + '/entity/' + entityType,
      requestHeaders,
      (typeof body === 'object') ? body : null
    );
  }
  /**
   * Delete a content entity in Drupal through REST (DELETE).
   * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
   * @param {number} entityId - The content entity ID.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
   */
  delete(entityType = 'node', entityId, base, creds) {
    // Define request base path.
    var requestBase = (typeof base === 'undefined') ? this.base : base;
    // Define request entityId.
    if (typeof entityId != 'number') {
      throw new TypeError('Expected parameter entityId must be a number');
    }
    else {
      var requestEntityId = entityId;
    }
    if (typeof creds != 'undefined') {
      var requestHeaders = {
        'Authorization': this.getBasicAuthToken(creds)
      };
    }
    return issueRequest(
      'DELETE',
      base + '/' + entityType + '/' + entityId,
      requestHeaders
    )
  }
}

/**
 * Issue a generic XMLHttpRequest.
 * @param {string} method - The HTTP method to be used in the request.
 * @param {string} url - The URL against which to issue the request.
 * @param {object} headers - An object containing request header key-value pairs.
 * @param {object} body - An object containing the request body to be sent.
 * @returns {Promise} A Promise that when fulfilled returns a response from the request.
 */
function issueRequest(method, url, headers, body) {
  return new Promise(function pr(resolve, reject) {
    var request = new XMLHttpRequest();
    request.open(method, url);
    if (typeof headers != 'undefined') {
      for (var prop in headers) {
        request.setRequestHeader(prop, headers[prop]);
      }
    }
    request.onload = function () {
      // @TODO: Handle other response codes properly.
      if (request.status == 200) {
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
