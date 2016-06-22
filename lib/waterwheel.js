const Request = require('./helpers/request');
const Query = require('./resources/entityQuery');
const Entity = require('./entity');

const methods = require('./helpers/methods');

module.exports = class Waterwheel extends Request {
  /**
   * Create an instance of the Waterwheel class.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The credentials object.
   */
  constructor(base, credentials) {
    super(base, credentials);

    this.base = base;
    this.credentials = credentials;
    this.api = {
      query: entityType => new Query(base, credentials, entityType)
    };
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
        this.api[resource] = new Entity(
          resources[resource].base || this.base,
          resources[resource].credentials || this.credentials,
          resources[resource].methods,
          resources[resource].entity,
          resources[resource].bundle,
          resources[resource].options
        );
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
   * Populate hydrant.api with available resources from Drupal.
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
            this.api[entity][bundle] = new Entity(this.base, this.credentials, entities[entity].methods, entity, bundle, entities[entity].more);
            if (entity === bundle) {
              this.api[entity] = this.api[entity][bundle];
            }
          });
        });
        return Promise.resolve(this.getAvailableResources());
      });
  }

};
