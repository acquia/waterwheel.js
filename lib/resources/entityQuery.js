const Request = require('../helpers/request');
const EntityQuery = require('../../node_modules/drupal-api/src/entityQuery');

module.exports = class Query extends Request {

  constructor(base, credentials, entityType) {
    // Call the parents constructor, even though we aren't actually passing anything.
    super(base, credentials);
    this.entityQuery = new EntityQuery(entityType);
  }

  setDetails(base, credentials) {
    this.base = base;
    this.credentials = credentials;
  }

  /**
   * Issue an entity query request to Drupal (GET).
   * @param {string} format
   *  The format of the response, such as 'json', 'hal_json', or 'xml'. Defaults to 'json'.
   * @returns {Promise}
   *  A Promise that when fulfilled returns a response containing the content entity.
   */
  get(format = 'json') {
    var queryString = this.getQueryString();

    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `entity/${this.entityType}${queryString}&_format=${format}`, token));
  }

  range(start, length) {
    this.entityQuery.range(start, length);
	  return this;
	};
	
  condition(field, value, operator, langcode) {
    this.entityQuery.condition(field, value, operator, langcode);
	  return this;
	};
	
  sort(field, direction, langcode) {
    this.entityQuery.sort(field, direction, langcode);
	  return this;
	};
	
  exists(field, langcode) {
    this.entityQuery.exists(field, langcode);
	  return this;
	};
	
  notExists(field, langcode) {
    this.entityQuery.notExists(field, langcode);
	  return this;
	};
	
  andConditionGroup() {
    return this.entityQuery.andConditionGroup();
	};
	
  orConditionGroup() {
    return this.entityQuery.orConditionGroup();
	};
	
  getQueryString() {
    return this.entityQuery.getQueryString();
	};

};
