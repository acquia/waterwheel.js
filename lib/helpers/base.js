module.exports = class Base {
  /**
   * Create an instance of the Base class.
   * @param {object} options
   *   The configuration used to create a new instance of Waterwheel.
   * @param {string} options.base
   *   The base URL.
   */
  constructor(options) {
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
