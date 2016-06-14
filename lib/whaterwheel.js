const Query = require('./resources/entityQuery');
const Entity = require('./entity');

module.exports = class Whaterwheel {
  /**
   * Create an instance of the Whaterwheel class.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The credentials object.
   */
  constructor(base, credentials) {
    this.base = base;
    this.credentials = credentials;
    this.api = {
      content: new Entity(base, credentials, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'}),
      comment: new Entity(base, credentials, {get: 'comment', set: 'comment', create: 'comment', delete: 'comment'}),
      contentType: new Entity(base, credentials, {get: '/entity/node_type', set: '/entity/node_type', create: '/entity/node_type', delete: '/entity/node_type'}),
      file: new Entity(base, credentials, {get: 'entity/file', set: 'entity/file', create: 'entity/file', delete: 'entity/file'}),
      menu: new Entity(base, credentials, {get: 'entity/menu', set: 'entity/menu', create: 'entity/menu', delete: 'entity/menu'}),
      taxonomyTerm: new Entity(base, credentials, {get: 'taxonomy/term', set: 'taxonomy/term', create: 'taxonomy/term', delete: 'taxonomy/term'}),
      taxonomyVocabulary: new Entity(base, credentials, {get: 'entity/taxonomy_vocabulary', set: 'entity/taxonomy_vocabulary', create: 'entity/taxonomy_vocabulary', delete: 'entity/taxonomy_vocabulary'}),
      user: new Entity(base, credentials, {get: 'user', set: 'user', create: 'user', delete: 'user'}),
      query: entityType => new Query(base, credentials, entityType)
    };
  }

  /**
   * Add additional resources to Whaterwheel
   * @param {object} resources
   *   Additional resources to add to this.api
   */
  addResources(resources) {
    if (resources && resources instanceof Object) {
      Object.keys(resources).forEach(resource => {
        this.api[resource] = new Entity(resources[resource].base || this.base, resources[resource].credentials || this.credentials, resources[resource].paths);
      });
    }
  }

  /**
   * Return an array of resources currently active in Whaterwheel.
   * @return {array}
   *   The resources currently active in Whaterwheel.
   */
  getResources(){
    return Object.keys(this.api);
  }

  /**
   * Remove one or more resources from Whaterwheel.
   * @param  {array|string} resources
   *   Either a single resource to remove or an array of multiple resources.
   */
  removeResources(resources) {
    (resources instanceof Array ? resources : [resources]).forEach(resource => {
      if (this.api.hasOwnProperty(resource)) {
        delete this.api[resource];
      }
    });
  }

};
