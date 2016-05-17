const Node = require('./resources/node');
const Query = require('./resources/entityQuery');

module.exports = class Hydrant {
  /**
   * Create an instance of the Hydrant class.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The base path of the Drupal site.
   */
  constructor(base, credentials) {
    // An instance of Hydrant has a base path and base credentials.
    this.base = base;
    this.credentials = credentials;

    this.api = {
      node: new Node(base, credentials),
      query: function (entityType) {
        return new Query(base, credentials, entityType);
      }
    };
  }

  /**
   * Reset our provides base url and credentials.
   * @param {string} base
   *   The base path of the Drupal site.
   * @param {object} credentials
   *   The base path of the Drupal site.
   * @return {object}
   *   This.
   */
  resetProviders(base, credentials) {
    Object.keys(this.api).forEach(key => {
      this.api[key].setDetails(base, credentials);
    });
    return this;
  }

  /**
   * Set the current credentials.
   * @param {object} credentials
   *   The credentials object.
   * @param {object} credentials.user
   *   The Drupal user making the request.
   * @param {object} credentials.pass
   *   The password for the above user.
   */
  setCredentials(credentials) {
    this.resetProviders(this.getBase(), credentials);
    this.credentials = credentials;
  }

  /**
   * Get the current credentials object.
   * @return {object}
   *   The current credentials, .user and .pass.
   */
  getCredentials() {
    return this.credentials;
  }

  /**
   * Set the base url.
   * @param {string} base
   *   The base url.
   */
  setBase(base) {
    this.resetProviders(base, this.getCredentials());
    this.base = base;
  }

  /**
   * Get the base url
   * @return {string}
   *   The base url.
   */
  getBase() {
    return this.base;
  }
};
