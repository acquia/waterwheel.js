module.exports = class Base {

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
    this.base = base;
  }

  /**
   * Get the base url.
   * @return {string}
   *   The base url.
   */
  getBase() {
    return this.base;
  }

};
