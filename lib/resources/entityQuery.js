const Request = require('../helpers/request');
const EntityQuery = require('../../node_modules/drupal-api/src/entityQuery');

module.exports = class Query extends Request {

  constructor(base, credentials, entityType) {
    // Call the parents constructor, even though we aren't actually passing anything.
    super(base, credentials);
    this.entityType = entityType;
    this.entityQuery = new EntityQuery(this.entityType);
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
    var queryString = this.entityQuery.getQueryString();

    return this.getXCSRFToken()
      .then((token) => this.issueRequest('GET', `entity/${this.entityType}?${queryString}&_format=${format}`, token));
  }

  /**
   * Set a range on the query.
   * @param {integer} start
   *  The starting index of results to return. Starts with '0'.
   * @param {integer} length
   *  The maximum number of results to return.
   */
  range(start, length) {
    this.entityQuery.range(start, length);
	  return this;
	};
	
  /**
   * Set a condition on the query.
   * @param {string} field
   *  The field on which to apply the condition.
   * @param {mixed} value
   *  The value to compore the field value against.
   * @param {string} operator
   *  The comparison operator to use.
   * @param {string} langcode
   *  The langcode of the entity value to which the condition should be applied.
   */
  condition(field, value, operator, langcode) {
    this.entityQuery.condition(field, value, operator, langcode);
	  return this;
	};
	
  /**
   * Add a sort to the query.
   * @param {string} field
   *  The field on which to apply the condition.
   * @param {string} langcode
   *  The langcode of the entity value to which the condition should be applied.
   */
  sort(field, direction, langcode) {
    this.entityQuery.sort(field, direction, langcode);
	  return this;
	};
	
  /**
   * Add an 'exists' condition to the query.
   * @param {string} field
   *  The field on which to apply the condition.
   * @param {string} langcode
   *  The langcode of the entity value to which the condition should be applied.
   */
  exists(field, langcode) {
    this.entityQuery.exists(field, langcode);
	  return this;
	};
	
  /**
   * Add an 'notExists' condition to the query.
   * @param {string} field
   *  The field on which to apply the condition.
   * @param {string} langcode
   *  The langcode of the entity value to which the condition should be applied.
   */
  notExists(field, langcode) {
    this.entityQuery.notExists(field, langcode);
	  return this;
	};
	
  /**
   * Creates an AND condition group.
   */
  andConditionGroup() {
    return this.entityQuery.andConditionGroup();
	};
	
  /**
   * Creates an OR condition group.
   */
  orConditionGroup() {
    return this.entityQuery.orConditionGroup();
	};

};
