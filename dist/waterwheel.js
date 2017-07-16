(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.waterwheel = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Base = function () {
  /**
   * Create an instance of the Base class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   */
  function Base(options) {
    classCallCheck(this, Base);

    this.options = Object.assign({
      timeout: 500,
      accessCheck: true,
      validation: true
    }, options);
  }
  /**
   * Set the base url.
   * @param {string} base
   *   The base url.
   */


  createClass(Base, [{
    key: "setBase",
    value: function setBase(base) {
      this.options.base = base;
    }

    /**
     * Get the base url.
     * @return {string}
     *   The base url.
     */

  }, {
    key: "getBase",
    value: function getBase() {
      return this.options.base;
    }
  }]);
  return Base;
}();

// Store the HTTP methods here.
var methods = {
  get: 'get',
  patch: 'patch',
  post: 'post',
  delete: 'delete'
};

var Request = function (_Base) {
  inherits(Request, _Base);

  /**
   * Create an instance of the Request class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   * @param {object} oauth
   *   The OAuth options.
   */
  function Request(options, oauth) {
    classCallCheck(this, Request);

    var _this = possibleConstructorReturn(this, (Request.__proto__ || Object.getPrototypeOf(Request)).call(this, options));

    _this.oauth = oauth;
    _this.axios = require('axios');
    return _this;
  }

  /**
   * Issue a generic XMLHttpRequest.
   * @param {string} method
   *  The HTTP method to be used in the request.
   * @param {string} url
   *  The URL against which to issue the request.
   * @param {string} XCSRFToken
   *  An X-CSRF-Token from Drupals REST API.
   * @param {object} additionalHeaders
   *  An object containing additional request header key-value pairs.
   * @param {object} body
   *  An object containing the request body to be sent.
   * @param {string} baseOverride
   *   Override the base URL in special scenarios.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response from the request.
   */


  createClass(Request, [{
    key: 'issueRequest',
    value: function issueRequest(method, url, XCSRFToken, additionalHeaders, body, baseOverride) {
      var _this2 = this;

      return (this.options.accessCheck && this.options.validation ? this.oauth.getToken() : Promise.resolve()).then(function () {
        var options = {
          method: method,
          timeout: _this2.options.timeout,
          url: (baseOverride || _this2.options.base) + '/' + (url.charAt(0) === '/' ? url.slice(1) : url),
          headers: {
            'X-CSRF-Token': XCSRFToken
          }
        };

        if (_this2.options.accessCheck && _this2.options.validation) {
          options.headers.Authorization = 'Bearer ' + _this2.oauth.tokenInformation.access_token;
        }

        // If this is a GET request,
        // or we didn't pass a token drop the X-CSRF-Token header.
        if (method === methods.get || !XCSRFToken) {
          delete options.headers['X-CSRF-Token'];
        }

        // If we have additionalHeaders, set them.
        // @TODO: This is NOT the safest way, so be careful.
        if (additionalHeaders && Object.keys(additionalHeaders).length !== 0) {
          Object.keys(additionalHeaders).forEach(function (key) {
            options.headers[key] = additionalHeaders[key];
          });
        }

        if (body) {
          options.data = body;
        }

        return _this2.axios(options).then(function (res) {
          return Promise.resolve(res.data);
        }).catch(function (err) {
          var error = new Error();
          if (err.message && err.message.indexOf('timeout') !== -1) {
            error.message = 'Timeout';
            error.status = 408;
          } else {
            error.message = err.response ? err.response.data.message : 'Unknown error.';
            error.status = err.response ? err.response.status : 500;
          }

          return Promise.reject(error);
        });
      });
    }
    /**
     * Get an X-CSRF-Token from Drupal's REST module.
     * @return {Promise}
     *  A Promise that when fulfilled returns a response containing the X-CSRF-Token.
     */

  }, {
    key: 'getXCSRFToken',
    value: function getXCSRFToken() {
      var _this3 = this;

      if (this.csrfToken) {
        return Promise.resolve(this.csrfToken);
      }
      return new Promise(function (resolve, reject) {
        _this3.axios({ method: 'get', url: _this3.options.base + '/rest/session/token' }).then(function (res) {
          _this3.csrfToken = res.data;
          return resolve(res.data);
        }).catch(function (err) {
          return reject(err);
        });
      });
    }
  }]);
  return Request;
}(Base);

var Entity = function () {
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
  function Entity(options, request) {
    classCallCheck(this, Entity);

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


  createClass(Entity, [{
    key: 'get',
    value: function get$$1(identifier) {
      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'json';

      return !this.options.methods.hasOwnProperty(methods.get) ? Promise.reject('The method, ' + methods.get + ', is not available.') : this.request.issueRequest(methods.get, this.options.methods.get.path.replace(this.options.methods.get.path.match(/\{.*?\}/), identifier) + '?_format=' + format, '');
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

  }, {
    key: 'patch',
    value: function patch(identifier) {
      var _this = this;

      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'application/json';

      return !this.options.methods.hasOwnProperty(methods.patch) ? Promise.reject('The method, ' + methods.patch + ', is not available.') : this.request.getXCSRFToken().then(function (csrfToken) {
        return _this.request.issueRequest(methods.patch, '' + _this.options.methods.patch.path.replace(_this.options.methods.patch.path.match(/\{.*?\}/), identifier), csrfToken, { 'Content-Type': format }, body);
      });
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

  }, {
    key: 'post',
    value: function post(body) {
      var _this2 = this;

      var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'application/json';
      var skipFieldValidation = arguments[2];

      if (!this.options.methods.hasOwnProperty(methods.post)) {
        return Promise.reject('The method, ' + methods.post + ', is not available.');
      }
      if (skipFieldValidation) {
        // Check to see if the required fields match the passed fields.
        var checkedFields = this.checkRequiredFields(body);
        if (checkedFields.length) {
          return Promise.reject('The following fields, ' + checkedFields.join(', ') + ', are required.');
        }
      }

      return this.request.getXCSRFToken().then(function (csrfToken) {
        return _this2.request.issueRequest(methods.post, _this2.options.methods.post.path, csrfToken, { 'Content-Type': format }, body);
      });
    }

    /**
     * Delete a content entity in Drupal through REST (DELETE).
     * @param {number|string} identifier
     *   The ID of name of the entity being requested.
     * @returns {Promise}
     *   A Promise that when fulfilled returns a response containing the content entity in JSON (as of 8.2).
     */

  }, {
    key: 'delete',
    value: function _delete(identifier) {
      var _this3 = this;

      return !this.options.methods.hasOwnProperty(methods.delete) ? Promise.reject('The method, ' + methods.delete + ', is not available.') : this.request.getXCSRFToken().then(function (csrfToken) {
        return _this3.request.issueRequest(methods.delete, '' + _this3.options.methods.delete.path.replace(_this3.options.methods.delete.path.match(/\{.*?\}/), identifier), csrfToken);
      });
    }

    /**
     * Checks to see if the required fields are present when submitting a POST request.
     * @param {object} body
     *   The post body data.
     * @returns {array}
     *   An array of keys.
     */

  }, {
    key: 'checkRequiredFields',
    value: function checkRequiredFields(body) {
      var availableBodyKeys = Object.keys(body);
      return this.options.metadata.requiredFields.filter(function (key) {
        return !availableBodyKeys.includes(key);
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

  }, {
    key: 'setFields',
    value: function setFields(identifier, fields) {
      var _this4 = this;

      var availableFieldKeys = Object.keys(this.options.metadata.properties);
      var nonMatchedFields = Object.keys(fields).map(function (fieldKey) {
        if (!availableFieldKeys.includes(fieldKey)) {
          return fieldKey;
        }
        return false;
      }).filter(Boolean);

      if (nonMatchedFields.length) {
        return Promise.reject(new Error('The ' + (nonMatchedFields.length > 1 ? 'fields' : 'field') + ', ' + nonMatchedFields.join(', ') + ', ' + (nonMatchedFields.length > 1 ? 'are' : 'is') + ' not included within the bundle, ' + this.options.bundle + '.'));
      }
      var postBody = {};

      Object.keys(fields).forEach(function (fieldNameToSet) {
        var fieldSpec = _this4.options.metadata.properties[fieldNameToSet];

        // This assumes we are always going to be wrapping the response in an array.
        postBody[fieldNameToSet] = [];

        var fieldValueWrapper = {};
        Object.keys(fieldSpec.items.properties).forEach(function (prop) {
          if (fields[fieldNameToSet].hasOwnProperty(prop)) {
            fieldValueWrapper[prop] = fields[fieldNameToSet][prop];
          }
        });

        postBody[fieldNameToSet].push(fieldValueWrapper);
      });

      postBody.type = [{
        target_id: this.options.bundle,
        target_type: this.options.entity + '_type'
      }];
      return this.patch(identifier, postBody);
    }
  }]);
  return Entity;
}();

var qs = require('qs');

var JSONAPI = function () {
  function JSONAPI(options, request) {
    classCallCheck(this, JSONAPI);

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


  createClass(JSONAPI, [{
    key: 'get',
    value: function get$$1(resource, params) {
      var id = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var format = 'api_json';
      var url = '/' + this.jsonapiPrefix + '/' + resource + (id ? '/' + id : '') + '?_format=' + format + (Object.keys(params).length ? '&' + qs.stringify(params, { indices: false }) : '');
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

  }, {
    key: 'post',
    value: function post(resource, body) {
      var format = 'api_json';
      return this.request.issueRequest(methods.post, '/' + this.jsonapiPrefix + '/' + resource + '?_format=' + format, '', {
        'Content-Type': 'application/vnd.api+json'
      }, body);
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

  }, {
    key: 'patch',
    value: function patch(resource, body) {
      var format = 'api_json';
      return this.request.issueRequest(methods.patch, '/' + this.jsonapiPrefix + '/' + resource + '?_format=' + format, '', {
        'Content-Type': 'application/vnd.api+json'
      }, body);
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

  }, {
    key: 'delete',
    value: function _delete(resource, id) {
      var format = 'api_json';
      var url = '/' + this.jsonapiPrefix + '/' + resource + '/' + id + '?_format=' + format;
      return this.request.issueRequest(methods.delete, url, '', {
        'Content-Type': 'application/vnd.api+json'
      });
    }
  }]);
  return JSONAPI;
}();

var Swagger = function () {
  function Swagger(swaggerJSON) {
    classCallCheck(this, Swagger);

    this.swagger = swaggerJSON;
    this.entities = {};
  }

  createClass(Swagger, [{
    key: 'collectEntities',
    value: function collectEntities() {
      var _this = this;

      Object.keys(this.swagger.paths).forEach(function (path) {
        Object.keys(_this.swagger.paths[path]).forEach(function (method) {
          var entity = _this.swagger.paths[path][method].tags[0];
          var match = new RegExp(entity + ':(.*)');
          var definitions = Object.keys(_this.swagger.definitions).filter(function (element) {
            return match.test(element);
          });
          (definitions.length ? definitions : [entity]).forEach(function (bundle) {

            var bundleData = _this.swagger.definitions[bundle].hasOwnProperty('allOf') ? _this.swagger.definitions[bundle].allOf[1] : _this.swagger.definitions[bundle];

            if (_this.swagger.definitions[bundle].hasOwnProperty('allOf')) {
              bundleData.properties = Object.assign(bundleData.properties, _this.swagger.definitions[_this.swagger.definitions[bundle].allOf[0].$ref.split('/').pop()].properties);
            }

            // Only create an Object if we don't have one previously.
            if (!_this.entities.hasOwnProperty(bundle)) {
              _this.entities[bundle] = {};
            }

            // Create the methods key if this is the first time.
            _this.entities[bundle].methods = _this.entities[bundle].methods ? _this.entities[bundle].methods : {};
            // Setup method information.
            _this.entities[bundle].methods[method] = {
              path: path,
              parameters: _this.swagger.paths[path][method].parameters
            };

            // Setup bundle properties.
            _this.entities[bundle].properties = _this.entities[bundle].properties ? _this.entities[bundle].properties : bundleData.properties;

            // Setup required fields.
            _this.entities[bundle].requiredFields = _this.entities[bundle].requiredFields ? _this.entities[bundle].requiredFields : bundleData.required;
          });
        });
      });

      return this.entities;
    }
  }]);
  return Swagger;
}();

var axios = require('axios');
var qs$1 = require('qs');

var OAuth = function () {
  function OAuth(basePath, OAuthOptions) {
    classCallCheck(this, OAuth);

    this.basePath = basePath;
    this.tokenInformation = Object.assign({}, OAuthOptions);
    this.tokenInformation.grant_type = 'password'; // eslint-disable-line camelcase
  }
  /**
   * Get an OAuth Token.
   * @return {promise}
   *   The resolved promise of fetching the oauth token.
   */


  createClass(OAuth, [{
    key: 'getToken',
    value: function getToken() {
      var _this = this;

      var currentTime = new Date().getTime();
      // Resolve if token already exists and is fresh
      if (this.tokenInformation.access_token && this.hasOwnProperty('tokenExpireTime') && this.tokenExpireTime > currentTime) {
        return Promise.resolve();
      }
      // If token is already being fetched, use that one.
      else if (this.bearerPromise) {
          return this.bearerPromise;
        }
        // If token has already been fetched switch grant_type to refresh_token.
        else if (this.tokenInformation.access_token) {
            this.tokenInformation.grant_type = 'refresh_token'; // eslint-disable-line camelcase
          }

      this.bearerPromise = axios({
        method: methods.post,
        url: this.basePath + '/oauth/token',
        data: qs$1.stringify(this.tokenInformation)
      }).then(function (response) {
        delete _this.bearerPromise;
        var t = new Date();
        t.setSeconds(+t.getSeconds() + response.data.expires_in);
        _this.tokenExpireTime = t.getTime();
        Object.assign(_this.tokenInformation, response.data);
        return response.data;
      }).catch(function (e) {
        delete _this.bearerPromise;
        return Promise.reject(e);
      });

      return this.bearerPromise;
    }
  }]);
  return OAuth;
}();

var Waterwheel = function (_Base) {
  inherits(Waterwheel, _Base);

  /**
   * Create an instance of the Waterwheel class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   * @param {object} options.oauth
   *   The credentials used with each request.
   * @param {string} options.oauth.grant_type
   *   The type of grant you are requesting.
   * @param {string} options.oauth.client_id
   *   The ID of the OAuth Client.
   * @param {string} options.oauth.client_secret
   *   The secret set when the Client was created.
   * @param {string} options.oauth.username
   *   The resource owner username.
   * @param {string} options.oauth.password
   *   The resource owner password.
   * @param {string} options.oauth.scope
   *   The scope of the access request.
   * @param {string} options.timeout
   *   How long AXIOS should wait before bailing on a request.
   * @param {string} options.jsonapiPrefix
   *   If you have overridden the JSON API prefix, specify it here and Waterwheel
   *   will use this over the default of 'jsonapi'.
   * @param {boolean} options.validation
   *   Should the request use oauth validation or expect anonymous access.
   */
  function Waterwheel(options) {
    classCallCheck(this, Waterwheel);

    var _this = possibleConstructorReturn(this, (Waterwheel.__proto__ || Object.getPrototypeOf(Waterwheel)).call(this, options));

    _this.api = {};

    _this.oauth = new OAuth(_this.options.base, _this.options.oauth);
    _this.request = new Request(options, _this.oauth);

    _this.jsonapi = new JSONAPI(options, _this.request);

    if (_this.options.resources && Object.keys(_this.options.resources).length) {
      _this.parseSwagger(_this.options.resources, _this.request);
    }
    return _this;
  }

  /**
   * Parse a Swagger compatible document and create Waterwheel entities.
   * @param {object} swaggerResources
   *   A JSON object representing your API in Swagger format.
   * @param {object} request
   *   A shared requestor class instance.
   * @param {object} credentials
   *   A credentials object for making requests.
   */


  createClass(Waterwheel, [{
    key: 'parseSwagger',
    value: function parseSwagger(swaggerResources, request) {
      var _this2 = this;

      var swagger = new Swagger(swaggerResources).collectEntities();

      Object.keys(swagger).forEach(function (entity) {
        var methods$$1 = {};
        Object.keys(swagger[entity].methods).forEach(function (method) {
          methods$$1[method] = {
            path: swagger[entity].methods[method].path
          };
        });
        _this2.api[entity] = new Entity({
          base: _this2.options.base,
          methods: methods$$1,
          bundle: entity.indexOf(':') > -1 ? entity.split(':')[1] : entity,
          entity: entity.indexOf(':') > -1 ? entity.split(':')[0] : entity,
          metadata: {
            requiredFields: swagger[entity].requiredFields,
            properties: swagger[entity].properties
          }
        }, request);
      });
    }

    /**
     * Return an array of resources currently active in Waterwheel.
     * @return {array}
     *   The resources currently active in Waterwheel.
     */

  }, {
    key: 'getAvailableResources',
    value: function getAvailableResources() {
      // Sort everything for readability.
      return Object.keys(this.api).sort();
    }

    /**
     * Populate Waterwheel.api with available resources from a Swagger endpoint.
     * @param {string} resourcesLocation
     *   The full HTTP path for your swagger resources.
     * @return {Promise}
     *   A completed promise after the requested resources were added.
     */

  }, {
    key: 'populateResources',
    value: function populateResources(resourcesLocation) {
      var _this3 = this;

      return this.request.issueRequest(methods.get, resourcesLocation, false, {}, false, false).then(function (res) {
        _this3.parseSwagger(res, _this3.request);
      });
    }

    /**
     * Fetch embedded resources from HAL+JSON documents
     * @param  {object} entityJSON
     *   An object, usually returned from Drupal, containing _embedded information
     * @param {string|array} [includedFields]
     *  If specified, a series of embedded resources to fetch.
     * @return {Promise}
     *   If no _embedded key is found, a rejection is returned, else a resolved
     *   promise with all the embedded resources requests completed.
     */

  }, {
    key: 'fetchEmbedded',
    value: function fetchEmbedded(entityJSON, includedFields) {
      var _this4 = this;

      if (!entityJSON || !entityJSON.hasOwnProperty('_embedded')) {
        return Promise.reject('This is probably not HAL+JSON');
      }

      var fieldsToFilterBy = includedFields ? Array.isArray(includedFields) ? includedFields : [includedFields] : false;

      var embeddedResources = entityJSON._embedded;
      var embeddedResourcesKeys = Object.keys(embeddedResources);

      var links = [];

      (fieldsToFilterBy ? embeddedResourcesKeys.filter(function (key) {
        return fieldsToFilterBy.indexOf(key.split('/').pop()) !== -1;
      }) : embeddedResourcesKeys).forEach(function (key) {
        embeddedResources[key].forEach(function (ref) {
          links.push(ref._links.self.href.split(_this4.options.base)[1]);
        });
      });

      // Create a Set from the possibly-duplicate links array.
      // Get an array from that set.
      links = Array.from(new Set(links));

      // Promise.all accepts an array of promises to resolve. The first item
      // in this array is the original entity, adjacent to the embedded ones.
      return Promise.all([Promise.resolve(entityJSON)].concat(links.map(function (link) {
        return _this4.request.issueRequest(methods.get, link);
      })));
    }
  }]);
  return Waterwheel;
}(Base);

return Waterwheel;

})));
//# sourceMappingURL=waterwheel.js.map
