'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Class representing a Hydrant. */

var Hydrant = function () {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base - The base path of the Drupal site.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   */

  function Hydrant(base, creds) {
    _classCallCheck(this, Hydrant);

    // Every instance of Hydrant has a base path and base credentials.
    this.base = base;
    this.creds = creds;
  }
  /**
   * Get a Basic Authentication token from Drupal.
   * @param {object} creds - An object containing a Drupal username (user) and password (pass).
   * @return {string} A Basic Authentication token containing a base64-encoded username-password pair.
   */


  _createClass(Hydrant, [{
    key: 'generateBasicAuthToken',
    value: function generateBasicAuthToken(creds) {
      // Use default credentials from constructor if no argument is found.
      var credentials = typeof creds === 'undefined' ? this.creds : creds;
      // @TODO: Figure out an alternative for server-side execution.
      return 'Basic ' + btoa(credentials.user + ':' + credentials.pass);
    }
    /**
     * Get an X-CSRF-Token from Drupal's REST module.
     * @param {string} base - The base path of the Drupal site.
     * @return {Promise} A Promise that when fulfilled returns a response containing the X-CSRF-Token.
     */

  }, {
    key: 'getXCSRFToken',
    value: function getXCSRFToken(base) {
      return issueRequest('GET', (typeof base === 'undefined' ? this.base : base) + '/rest/session/token');
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

  }, {
    key: 'get',
    value: function get() {
      var entityType = arguments.length <= 0 || arguments[0] === undefined ? 'node' : arguments[0];
      var entityId = arguments[1];
      var format = arguments.length <= 2 || arguments[2] === undefined ? 'json' : arguments[2];
      var base = arguments[3];
      var creds = arguments[4];

      // Define request base path and entity type.
      var requestBase = typeof base === 'undefined' ? this.base : base;
      // Define request entityId.
      if (typeof entityId != 'number') {
        throw new TypeError('Expected parameter entityId must be a number');
      } else {
        var requestEntityId = entityId;
      }
      var requestHeaders = {
        'Content-Type': 'application/' + format
      };
      if (typeof creds != 'undefined') {
        requestHeaders['Authorization'] = this.generateBasicAuthToken(creds);
      }
      return issueRequest('GET', base + '/' + entityType + '/' + requestEntityId.toString() + '?_format=' + format, requestHeaders);
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

  }, {
    key: 'set',
    value: function set() {
      var entityType = arguments.length <= 0 || arguments[0] === undefined ? 'node' : arguments[0];
      var entityId = arguments[1];
      var format = arguments.length <= 2 || arguments[2] === undefined ? 'json' : arguments[2];
      var base = arguments[3];
      var creds = arguments[4];
      var body = arguments[5];

      // Define request base path.
      var requestBase = typeof base === 'undefined' ? this.base : base;
      // Define request entityId.
      if (typeof entityId != 'number') {
        throw new TypeError('Expected parameter entityId must be a number');
      } else {
        var requestEntityId = entityId;
      }
      var requestHeaders = {
        'Content-Type': 'application/' + format
      };
      if (typeof creds != 'undefined') {
        requestHeaders['Authorization'] = this.generateBasicAuthToken(creds);
      }
      // @TODO: Some sort of validation on body might be necessary.
      return issueRequest('PATCH', base + '/' + entityType + '/' + requestEntityId.toString(), requestHeaders, (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? body : null);
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

  }, {
    key: 'create',
    value: function create() {
      var entityType = arguments.length <= 0 || arguments[0] === undefined ? 'node' : arguments[0];
      var format = arguments.length <= 1 || arguments[1] === undefined ? 'json' : arguments[1];
      var base = arguments[2];
      var creds = arguments[3];
      var body = arguments[4];

      // Define request base path.
      var requestBase = typeof base === 'undefined' ? this.base : base;
      var requestHeaders = {
        'Content-Type': 'application/' + format
      };
      if (typeof creds != 'undefined') {
        requestHeaders['Authorization'] = this.generateBasicAuthToken(creds);
      }
      // @TODO: Some sort of validation on body might be necessary.
      return issueRequest('POST', base + '/entity/' + entityType, requestHeaders, (typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object' ? body : null);
    }
    /**
     * Delete a content entity in Drupal through REST (DELETE).
     * @param {string} entityType - The content entity type, such as 'node', 'user', or 'taxonomy_term'. Defaults to 'node'.
     * @param {number} entityId - The content entity ID.
     * @param {string} base - The base path of the Drupal site.
     * @param {object} creds - An object containing a Drupal username (user) and password (pass).
     * @returns {Promise} A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
     */

  }, {
    key: 'delete',
    value: function _delete() {
      var entityType = arguments.length <= 0 || arguments[0] === undefined ? 'node' : arguments[0];
      var entityId = arguments[1];
      var base = arguments[2];
      var creds = arguments[3];

      // Define request base path.
      var requestBase = typeof base === 'undefined' ? this.base : base;
      // Define request entityId.
      if (typeof entityId != 'number') {
        throw new TypeError('Expected parameter entityId must be a number');
      } else {
        var requestEntityId = entityId;
      }
      if (typeof creds != 'undefined') {
        var requestHeaders = {
          'Authorization': this.generateBasicAuthToken(creds)
        };
      }
      return issueRequest('DELETE', base + '/' + entityType + '/' + entityId, requestHeaders);
    }
  }]);

  return Hydrant;
}();

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
      } else {
        // @TODO: Handle error properly.
        reject('Error: Status code ' + request.status + ' on XMLHttpRequest: ' + method + ' at ' + url);
      }
    };
    request.onerror = function () {
      // @TODO: Handle error properly.
      reject('Error: Network error on XMLHttpRequest: ' + method + ' at ' + url);
    };
    request.send(typeof body === 'undefined' ? null : JSON.stringify(body));
  });
}
