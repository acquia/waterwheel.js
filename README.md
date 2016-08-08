![Waterwheel - Drupal SDK](https://raw.githubusercontent.com/acquia/waterwheel-js/assets/waterwheel.png)

# Waterwheel

A generic JavaScript helper library to query and manipulate Drupal 8 via core REST

[![Build Status](https://travis-ci.org/acquia/waterwheel-js.svg?branch=master)](https://travis-ci.org/acquia/waterwheel-js) [![Coverage Status](https://coveralls.io/repos/github/acquia/waterwheel/badge.svg?branch=master)](https://coveralls.io/github/acquia/waterwheel?branch=master)

---

## Setup

Install development dependencies.

```
npm i
```

Run tests and check coverage.

```
npm t
```

Build a browser version.

```
npm run build
```

## Dependencies

Ensure that you have set up cross-origin resource sharing on your Drupal site to enable Waterwheel to perform necessary tasks. Instructions for [Apache](http://enable-cors.org/server_apache.html) or [Nginx](http://enable-cors.org/server_nginx.html).

The majority of the functionality in Waterwheel is dependent on the [Waterwheel-Drupal module](https://www.drupal.org/project/waterwheel). Please install and enable this module in your Drupal site before attempting to use the functionality offered in this library.

## Documentation

### Require `waterwheel` in either a server or browser environment.

```javascript
// Server
const Waterwheel = require('waterwheel');
const waterwheel = new Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

// Browser
import '../../path/to/node_modules/waterwheel/dist/waterwheel.js'
const waterwheel = new window.Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

// With resources
const waterwheel = new Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'}, require('./resources.json'));
```

Waterwheel when instantiated accepts three arguments,
  - `base`: The base path for your Drupal instance. All request paths will be built from this base
  - `credentials`: An object containing the `username` and `password` used to authenticate with Drupal.
  - `resources`: A JSON object that represents the resources available to `waterwheel`.

  Supplying the `resources` object is equivalent to calling `.populateResources()` but does not incur an HTTP request, and alleviates the need to call `.populateResources()` prior to making any requests. You can fetch this object by calling `waterwheel.fetchResources()`. Additionally if a valid `resources` object is passed, `credentials` become optional when `waterwheel` is instantiated.

### Populate `waterwheel` resources

**This must be done before any subsequent API calls**. Without this call, only the [Entity Query](#entity-query) functionality will be available.

```javascript
waterwheel.populateResources()
  .then(res => {
    /*
    [ 'comment',
    'file',
    'menu',
    'node.article',
    'node.page',
    'node_type.content_type',
    'query',
    'taxonomy_term.tags',
    'taxonomy_vocabulary',
    'user' ]
     */
  });
```

Waterwheel currently expects the [Waterwheel Drupal module](https://www.drupal.org/project/waterwheel) to be installed and enabled, however, the intent is to remove that dependency, by adding the necessary functionality to Drupal core, making that separate module ​_obsolete_​.

### Manually add resources to `waterwheel`

```javascript
waterwheel.addResources(
  {myNewResource: {
    base: {{ base url }},
    credentials: {{ credentials }},
    methods: {{ methods }},
    entityType: 'node',
    bundle: 'page',
    options: {{ extended information path }}
  }}
);
```

When adding resources the parent object key will be used to identify the new resource, `myNewResource` in the example.
  - `base`: The base path for your Drupal instance. All request for this resource will use this path. This can be different from the path used when instantiating `waterwheel`.
  - `credentials`: An object containing the `username` and `password` used to authenticate with Drupal. This can be different from the credentials used when instantiating `waterwheel`.
  - `methods`: An object containing the following keys, `GET`, `POST`, `PATCH`, `DELETE`. Each key should contain the path suffix that the action can be preformed on.
  - `entityType`: The entity type that this resource should reference, ie. `node`.
  - `bundle`: The bundle that this resource should reference, ie. `page`.
  - `options`: The path used to get extended (field) information about the `bundle`. This is usually provided automatically by Waterwheel-Drupal, but can be manually specified.

### Get resources within `waterwheel`

```javascript
waterwheel.getAvailableResources()
  .then(res => {
    /*
    [ 'comment',
    'file',
    'menu',
    'node.article',
    'node.page',
    'node_type.content_type',
    'query',
    'taxonomy_term.tags',
    'taxonomy_vocabulary',
    'user' ]
    */
  });
```
Entities that have no bundles are accessible at the top level, `waterwheel.api.comment`, however bundles are accessible from within their entity, `waterwheel.api.node.article`.

### Methods for resources

Each method is directly mapped to the `methods` key attached to the resource.

#### `GET`

```javascript
waterwheel.api.user.get(1)
  .then(res => {
    // Drupal JSON Object
  })
  .catch(err => {
    // err
  });
```
`.get()` accepts two arguments
  - `identifier`: The identifier of the entity you are requesting, `nid`, `vid`, `uid`, etc.
  - `format`: The format of response you are requesting. Currently this is optional, and internally defaults to `JSON`.

#### `PATCH`

```javascript
waterwheel.api.user.patch(1, {})
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });
```
`.patch()` accepts three arguments
  - `identifier`: The identifier for the entity you are attempting to modify, `nid`, `vid`, `uid`, etc.
  - `body`: An object that formatted in a way that Drupal will be able to parse. This object is passed directly to Drupal.
  - `format`: The format of the object you are passing. Currently this is optional, and internally defaults to `JSON`.

#### `POST`

```javascript
waterwheel.api.user.post({})
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });
```
`.post()` accepts two arguments
  - `body`: An object that formatted in a way that Drupal will be able to parse. This object should contain all the information needed to create an entity. This object is passed directly to Drupal.
  - `format`: The format of the object you are passing. Currently this is optional, and internally defaults to `application/json`.

#### `DELETE`

```javascript
waterwheel.api.user.delete(1)
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });
```
`.delete()` accepts one argument
  - `identifier`: The identifier for the entity you are attempting to delete, `nid`, `vid`, `uid`, etc.

### Set field values

```javascript
waterwheel.populateResources()
  .then(() => waterwheel.api.node.page.setField(1, {title: 'my favorite title'})) // Set a single value
  .then(() => waterwheel.api.node.page.setField(1, [ // Set multiple values
    {title: 'my favorite title'},
    {email: ['a@aaa.com', 'b@bbb.com', 'c@ccc.com']}
  ]))
  .then(() => waterwheel.api.node.page.setField(1, [ // Pass additional message body data.
    {title: 'my favorite title'},
    {email: ['a@aaa.com', 'b@bbb.com', 'c@ccc.com']}
  ], {body: [{value: 'foo'}]} ))
  .then(res => {
    // Data sent to Drupal
  })
  .catch(err => {
    // err
  });
```

`.setField()` accepts 3 arguments
  - `identifier`: The id of the entity you are setting field values on
  - `fields`: Fields and values to be set on the entity.
    - A single object can be passed, `{title: 'my favorite title'}`
    - An array of objects can be passed, `[{title: 'my favorite title'}, {subtitle: 'my favorite sub title'}]`
  - `additionalValues`: An object of fields (the objects keys), and values that are copied to the body data prior to the `PATCH` request. **Be aware that this happens last and could overwrite any previously set fields.**

### Get field metadata for an entity/bundle

```javascript
waterwheel.populateResources()
  .then(() => waterwheel.api.node.page.getFieldData())
  .then(res => {
    // Field metadata
  })
  .catch(err => {
    // err
  });
```

`.getFieldData()` accepts no arguments. This returns the object from Waterwheel-Drupal that contains information about each field in the entity/bundle. For a list of fields, _to be used in `.setField()`_, something like `Object.keys(res.fields)` will work.

### Get Embedded Resources

```javascript
waterwheel.api.node.page.get(1, 'hal_json')
  .then(res => waterwheel.fetchEmbedded(res))
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });

waterwheel.api.node.page.get(1, 'hal_json')
  .then(res => waterwheel.fetchEmbedded(res, ['my_field']))
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });
```
`.fetchEmbedded()` accepts 2 arguments
  - `entityJSON`: This should be a HAL+JSON structured object containing an `_embedded` key at the root.
  - `includedFields`: Optionally provide a single field as a `string`, or an `array` of `strings` to filter the embedded request by.

When requesting embedded resources duplicates are removed to prevent extra HTTP requests. An array is returned with your original response and any embedded resources. If any of the subsequent requests fail, the promise is rejected.

### Entity Query

To take advantage of the Entity Query support, enable the [EntityQueryAPI](https://www.drupal.org/project/entityqueryapi) module. You do not need to run `.populateResources()` prior to using this functionality.

```javascript
waterwheel.api.query('node').range(0, 5).get()
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  })
```

Additional documentation can be found at the [DAPI repository](https://github.com/gabesullice/dapi.js).
