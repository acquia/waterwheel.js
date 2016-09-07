module.exports = class Base {
  /**
   * Create an instance of the Base class.
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
    this.options = Object.assign({
      timeout: 500
    }, options);
    this.setCredentials(this.options.credentials);
  }
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
      this.options.credentials = credentials;
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
    return this.options.credentials;
  }

  /**
   * Set the base url.
   * @param {string} base
   *   The base url.
   */
  setBase(base) {
    this.options.base = base;
  }

  /**
   * Get the base url.
   * @return {string}
   *   The base url.
   */
  getBase() {
    return this.options.base;
  }

};
