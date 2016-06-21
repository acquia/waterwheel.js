```
 __      __            __                               __                     ___      
/\ \  __/\ \          /\ \__                           /\ \                   /\_ \     
\ \ \/\ \ \ \     __  \ \ ,_\    __   _ __   __  __  __\ \ \___      __     __\//\ \    
 \ \ \ \ \ \ \  /'__`\ \ \ \/  /'__`\/\`'__\/\ \/\ \/\ \\ \  _ `\  /'__`\ /'__`\\ \ \   
  \ \ \_/ \_\ \/\ \L\.\_\ \ \_/\  __/\ \ \/ \ \ \_/ \_/ \\ \ \ \ \/\  __//\  __/ \_\ \_
   \ `\___x___/\ \__/.\_\\ \__\ \____\\ \_\  \ \___x___/' \ \_\ \_\ \____\ \____\/\____\
    '\/__//__/  \/__/\/_/ \/__/\/____/ \/_/   \/__//__/    \/_/\/_/\/____/\/____/\/____/

```

# Waterwheel

A generic JavaScript helper library to query and manipulate Drupal 8 via core REST

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

## Documentation

Ensure that you have set up cross-origin resource sharing on your Drupal site to enable Waterwheel to perform necessary tasks. Instructions for [Apache](http://enable-cors.org/server_apache.html) or [Nginx](http://enable-cors.org/server_nginx.html). 

### Require `waterwheel` in either a server or browser environment.

```javascript
// Server
const Waterwheel = require('waterwheel');
const waterwheel = new Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

// Browser
const waterwheel = new window.Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});
```

Waterwheel when instantiated accepts two arguments
  - `base`: The base path for your Drupal instance. All request paths will be built from this base
  - `credentials`: An object containing the `username` and `password` used to authenticate with Drupal.

### Populate `waterwheel.api`

```javascript
waterwheel.populateResources()
  .then(res => {
    // An array of available resources
  });
```

Waterwheel expects the [Waterwheel-Drupal module](https://www.drupal.org/project/waterwheel) to be installed and enabled. **This must be done before any subsequent api calls**.

### Manually add resources to `waterwheel.api`

```javascript
waterwheel.addResources(
  {myNewResource: {
    base: {{ base url }},
    credentials: {{ credentials }},
    methods: {{ methods }},
    entity: 'node',
    bundle: 'page',
    options: {{ extended information path }}
  }}
);
```

When adding resources the parent object key will be used to identify the new resource, `myNewResource` in the example.
  - `base`: The base path for your Drupal instance. All request for this resource will use this path. This can be different from the path used when instantiating `waterwheel`.
  - `credentials`: An object containing the `username` and `password` used to authenticate with Drupal. This can be different from the credentials used when instantiating `waterwheel`.
  - `methods`: An object containing the following keys, `GET`, `POST`, `PATCH`, `DELETE`. Each key should contain the path suffix that the action can be preformed on.
  - `entity`: The entity that this resource should reference, ie. `node`.
  - `options`: The bundle that this resource should reference, ie. `page`.
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
  - `token`: The token of the entity you are requesting, `nid`.
  - `type`: The type of response you are requesting. Currently this is optional, and internally defaults to `JSON`.

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
`.patch()` accepts two arguments
  - `token`: The token for the entity you are attempting to modify, `nid`.
  - `body`: An object that formatted in a way that Drupal will be able to parse. This object is passed directly to Drupal.
  - `type`: The format of the object you are passing. Currently this is optional, and internally defaults to `JSON`.

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
`.patch()` accepts two arguments
  - `body`: An object that formatted in a way that Drupal will be able to parse. This object should contain all the information needed to create an entity. This object is passed directly to Drupal.
  - `type`: The format of the object you are passing. Currently this is optional, and internally defaults to `application/json`.

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
  - `token`: The token for the entity you are attempting to delete, `nid`.

### Set field values

```javascript
waterwheel.populateResources()
  .then(() => waterwheel.api.node.page.setField(1, 'title', 'my favorite title'))
  .then(res => {
    // Data sent to Drupal
  })
  .catch(err => {
    // err
  });
```

`.setField()` accepts 3 arguments
  - `nid`: The id of the entity you are setting field values on
  - `fieldName`: The name of the field you are attempting to set the value of.
  - `fieldValue`: The value of the field. Either a string of a single value, or an array for multi-value.

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
