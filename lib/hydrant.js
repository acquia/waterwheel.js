const Query = require('./resources/entityQuery');
const Entity = require('./entity');

module.exports = class Hydrant {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The credentials object.
   */
  constructor(base, credentials) {
    this.api = {
      content: new Entity(base, credentials, {get: 'node', set: 'node', create: 'entity/node', delete: 'node'}),
      contentType: new Entity(base, credentials, {get: '/entity/node_type', set: '/entity/node_type', create: '/entity/node_type', delete: '/entity/node_type'}),
      menu: new Entity(base, credentials, {get: 'entity/menu', set: 'entity/menu', create: 'entity/menu', delete: 'entity/menu'}),
      comment: new Entity(base, credentials, {get: 'comment', set: 'comment', create: 'comment', delete: 'comment'}),
      query: entityType => new Query(base, credentials, entityType)
    };
  }

};
