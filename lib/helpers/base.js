module.exports = class Base {

  /**
   * Ensure that the type of credentials being set are ones that Waterwheel supports.
   * @param  {object} credentials
   *   Object containing credentials. Currently just Oauth.
   * @return {boolean}
   *   If the credentials are valid, return true.
   */
  testCredentials(credentials) {
    const possibleAuth = ['oauth'];
    if (!(Object.keys(credentials).filter(key => possibleAuth.indexOf(key) !== -1)).length) {
      return false;
    }
    return true;
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
    if (this.testCredentials(credentials)) {
      this.credentials = credentials;
      return;
    }
    throw new Error('Incorrect authentication method.');
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
