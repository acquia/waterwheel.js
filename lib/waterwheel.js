const Request = require('./helpers/request');
const Entity = require('./entity');
const JSONAPI = require('./jsonapi');
const methods = require('./helpers/methods');

module.exports = class Waterwheel extends Request {
  /**
   * Create an instance of the Waterwheel class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   * @param {object} options.credentials
   *   The credentials used with each request.
   * @param {string} options.credentials.oauth
   *   The OAuth2 Bearer token.
   * @param {object} options.resources
   *   A JSON object representing all the resources available to Waterwheel.
   * @param {string} options.timeout
   *   How long AXIOS should wait before bailing on a request.
   */
  constructor(options) {
    if (!options.hasOwnProperty('base')) {
      throw new Error('Missing base path.');
    }

    if (!options.hasOwnProperty('credentials')) {
      throw new Error('Missing credentials.');
    }

    super(options);

    this.api = {};
    this.jsonapi = new JSONAPI(options);

    if (this.options.resources && Object.keys(this.options.resources).length) {
      Object.keys(this.options.resources).forEach(entity => {
        this.api[entity] = {};
        (this.options.resources[entity].bundles ? this.options.resources[entity].bundles : [this.options.resources[entity].label.toLowerCase().replace(/ /g, '_')]).forEach(bundle => {
          this.api[entity][bundle] = new Entity({
            base: this.options.base,
            credentials: this.options.credentials,
            methods: this.options.resources[entity].methods,
            entity: entity,
            bundle: bundle,
            more: this.options.resources[entity].more,
            timeout: this.options.timeout
          });
          if (entity === bundle) {
            this.api[entity] = this.api[entity][bundle];
          }
        });
      });
    }
  }

  /**
   * Add additional resources to Waterwheel
   * @param {object} resources
   *   Additional resources to add to this.api
   * @return {array|Error}
   *   Either an array of available resources, or an error if no Object was passed.
   */
  addResources(resources) {
    if (resources && typeof resources === 'object') {
      Object.keys(resources).forEach(resource => {
        this.api[resource] = new Entity({
          base: resources[resource].base || this.options.base,
          credentials: resources[resource].credentials || this.options.credentials,
          methods: resources[resource].methods,
          entity: resources[resource].entity,
          bundle: resources[resource].bundle,
          more: resources[resource].more,
          timeout: resources[resource].options || this.options.timeout
        });
      });
      return this.getAvailableResources();
    }
    return new Error('Resources should be an Object.');
  }

  /**
   * Return an array of resources currently active in Waterwheel.
   * @return {array}
   *   The resources currently active in Waterwheel.
   */
  getAvailableResources(){
    let res = [];
    // Pre-fill the array with the keys from this.api
    res = res.concat(Object.keys(this.api));
    Object.keys(this.api).forEach(resource => {
      if (!(this.api[resource] instanceof Entity || this.api[resource] instanceof Function)){
        // Remove the parent keys for Entities that have bundles.
        res.splice(res.indexOf(resource), 1);
        // Add in the remaining bundles.
        res = res.concat(Object.keys(this.api[resource]).map(bundle => `${resource}.${bundle}`));
      }
    });
    // Sort everything for readability.
    return res.sort();
  }

  /**
   * Fetch available REST-enabled resources from Drupal.
   * @param  {string} [format=json]
   *   The format to request the types in.
   *   @TODO: Support the processing of a response in a format besides JSON.
   * @return {Promise}
   *   The raw response from Drupal
   */
  fetchResources(format = 'json') {
    return this.issueRequest(methods.get, `/entity/types?_format=${format}`);
  }

  /**
   * Populate Waterwheel.api with available resources from Drupal.
   * @param  {string} [format=json]
   *   The format to request the types in.
   *   @TODO: Support the processing of a response in a format besides JSON.
   * @return {Promise}
   *   A promise that contains the resources that were added.
   */
  populateResources(format = 'json') {
    return this.fetchResources(format)
      .then(entities => {
        Object.keys(entities).forEach(entity => {
          this.api[entity] = {};
          (entities[entity].bundles ? entities[entity].bundles : [entities[entity].label.toLowerCase().replace(/ /g, '_')]).forEach(bundle => {
            this.api[entity][bundle] = new Entity({
              base: this.options.base,
              credentials: this.options.credentials,
              methods: entities[entity].methods,
              entity: entity,
              bundle: bundle,
              more: entities[entity].more,
              timeout: this.options.timeout
            });
            if (entity === bundle) {
              this.api[entity] = this.api[entity][bundle];
            }
          });
        });
        return Promise.resolve(this.getAvailableResources());
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
  fetchEmbedded(entityJSON, includedFields) {
    if (!entityJSON || !entityJSON.hasOwnProperty('_embedded')) {
      return Promise.reject('This is probably not HAL+JSON');
    }

    const fieldsToFilterBy = includedFields ?
      (Array.isArray(includedFields) ? includedFields : [includedFields]) : false;

    const embeddedResources = entityJSON._embedded;
    const embeddedResourcesKeys = Object.keys(embeddedResources);

    let links = [];

    (fieldsToFilterBy ?
      embeddedResourcesKeys.filter(key => fieldsToFilterBy.indexOf(key.split('/').pop()) !== -1) :
      embeddedResourcesKeys
    ).forEach(key => {
      embeddedResources[key].forEach(ref => {
        links.push(ref._links.self.href.split(this.options.base)[1]);
      });
    });

    // Create a Set from the possibly-duplicate links array.
    // Get an array from that set.
    links = Array.from(new Set(links));

    // Promise.all accepts an array of promises to resolve. The first item
    // in this array is the original entity, adjacent to the embedded ones.
    return Promise.all([Promise.resolve(entityJSON)].concat(links.map(link => this.issueRequest(methods.get, link))));
  }

};
