const Node = require('./resources/node');
const Menu = require('./resources/menu');
const ContentType = require('./resources/contentType');

module.exports = class Hydrant {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The base path of the Drupal site.
   */
  constructor(base, credentials) {
    this.api = {
      node: new Node(base, credentials),
      menu: new Menu(base, credentials),
      contentType: new ContentType(base, credentials)
    };
  }

};
