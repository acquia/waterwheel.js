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

Some functionality in Waterwheel.js is dependent on the [OpenAPI ](https://www.drupal.org/project/openapi) module. Please install and enable this module in your Drupal site before attempting to use the functionality offered in this library.

## Documentation

### Using `waterwheel` in either a server or browser environment.

#### Server

```javascript
const Waterwheel = require('waterwheel');
const waterwheel = new Waterwheel({
  base: 'http://drupal.localhost',
  oauth: {
    grant_type: 'GRANT-TYPE',
    client_id: 'CLIENT-ID',
    client_secret: 'CLIENT-SECRET',
    username: 'USERNAME',
    password: 'PASSWORD'
  }
});
```

#### Browser

```javascript
// Include the 'release' version of Waterwheel prior to creating a new instance.
// <script type="text/javascript" src="waterwheel.js"></script>

const waterwheel = new window.Waterwheel({
  base: 'http://drupal.localhost',
  oauth: {
    grant_type: 'GRANT-TYPE',
    client_id: 'CLIENT-ID',
    client_secret: 'CLIENT-SECRET',
    username: 'USERNAME',
    password: 'PASSWORD'
  }
});

// With resources
const resources = require('./resources.json');
const waterwheel = new Waterwheel({
  base: 'http://drupal.localhost',
  resources: resources,
  oauth: {
    grant_type: 'GRANT-TYPE',
    client_id: 'CLIENT-ID',
    client_secret: 'CLIENT-SECRET',
    username: 'USERNAME',
    password: 'PASSWORD'
  }
});
```

Waterwheel when instantiated accepts a single object,
  - `base`: The base path for your Drupal instance. All request paths will be built from this base.
  - `resources`: A JSON object that represents the resources available to `waterwheel`.
  - `oauth`: An object containing information required for fetching and refreshing OAuth Bearer tokens. The [Simple OAuth](https://www.drupal.org/project/simple_oauth) module is recommended for this.
    - `grant_type`: The type of [OAuth 2 grant](https://tools.ietf.org/html/rfc6749#section-4.3). Currently `password` is the only supported value.
    - `client_id`: The ID of your client.
    - `client_secret`: The secret of your client.
    - `username`: The user's username.
    - `password`: The user's password.
  - `timeout`: How long an HTTP request should idle for before being canceled.
  - `accessCheck`: indicates whether authentication should be used. Possible values are `true` and `false`.
  - `jsonapiPrefix`: If you have overridden the JSON API prefix, specify it here and Waterwheel will use this over the default of `jsonapi`.
  - `validation`: A boolean that defaults to `true`. If set to false, every request will ignore any existing OAuth information, allowing you to make *requests without any authentication*. If you have an _open_ API, than the [OAuth module](https://www.drupal.org/project/simple_oauth) is not needed.

Supplying the `resources` object is equivalent to calling `.populateResources()` but does not incur an HTTP request, and alleviates the need to call `.populateResources()` prior to making any requests. You can fetch this object by calling `waterwheel.fetchResources()`.

### Populate `waterwheel` resources

If you are supplying a resources object when `waterwheel` is instantiated, you do not need to use `.populateResources()` to fetch the resources prior to making any subsequent API calls. Waterwheel will fetch your Swagger (OpenAPI) document and attempt to automatically parse and create resources for you. Waterwheel.js currently expects the [OpenAPI ](https://www.drupal.org/project/openapi) module to be installed and enabled, however, the intent is to remove that dependency, by adding the necessary functionality to Drupal core, making that separate module ​_obsolete_​.

```javascript
waterwheel.populateResources('http://test.dev/swagger.json')
  .then(() => {
    // ...
  });
```

`.populateResources()` accepts one argument
  - `resourcesLocation`: The full path to your Swagger (OpenAPI) documentation.

### Get resources within `waterwheel`

```javascript
waterwheel.getAvailableResources()
  .then(res => {
    /*
    [
      'node:article',
      'node:page',
      'user'
    ]
    */
  });
```
Entities that have no bundles are accessible at the top level, `waterwheel.api.comment`, however bundles are accessible from within their entity, `waterwheel.api.node.article`.

### Methods for resources

Each method is directly mapped to the `methods` key attached to the resource.

#### `GET`

```javascript
waterwheel.api['user'].get(1)
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
waterwheel.api['user'].patch(1, {})
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });
```
`.patch()` accepts three arguments
  - `identifier`: The identifier for the entity you are attempting to modify, `nid`, `vid`, `uid`, etc.
  - `body`: An object that is formatted in a way that Drupal will be able to parse. This object is passed directly to Drupal.
  - `format`: The format of the object you are passing. Currently this is optional, and internally defaults to `JSON`.

#### `POST`

```javascript
waterwheel.api['user'].post({})
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
waterwheel.api['user'].delete(1)
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
waterwheel.api['node:page'].setFields(201, {
  title: {
    value: 'Hello World'
  },
  body: {
    value: 'ok, a new body',
    summary: 'ok, a new summary'
  }
})
  .then(res => {
    // Data sent to Drupal
  })
  .catch(err => {
    // err
  });
```

`.setField()` accepts 3 arguments
  - `identifier`: The id of the entity you are setting field values on
  - `fields`: Fields and values to be set on the entity. These should match the fields for the bundle.

### Get field metadata for an entity/bundle

```javascript
waterwheel.populateResources()
  .then(() => waterwheel.api['node:page'].getFieldData())
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
waterwheel.api['node:page'].get(1, 'hal_json')
  .then(res => waterwheel.fetchEmbedded(res))
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });

waterwheel.api['node:page'].get(1, 'hal_json')
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

### JSON API

`waterwheel` contains provisional support for requesting data using the `json:api` format. Currently only `GET`, `POST` and `DELETE` requests are supported.

```javascript
const Waterwheel = require('waterwheel');
const waterwheel = new Waterwheel('http://foo.dev', null, {});
```

The `jsonapi.get()` method accepts 3 arguments,
  - `resource`: The `bundle` and the `entity` you want to request.
  - `params`: Any arguments that your request requires. These are translated to query string arguments prior to sending the request.
  - `id`: The UUID of a single entity to fetch. This can be overloaded to include the name of a related entity.

The `jsonapi.post()` method accepts 2 arguments,
  - `resource`: The `bundle` and the `entity` you want to create.
  - `body`: The data to be sent to Drupal. Review the [JSON API documentation](http://jsonapi.org/format/#crud-creating) for specifics on payload structure for posting an individual entity.

The following examples outline some of the basic features of using `JSON API`.

#### Collections/Lists

```javascript
waterwheel.jsonapi.get('node/article', {})
.then(res => {
  // res
});
```

#### Request A Resource

```javascript
waterwheel.jsonapi.get('node/article', {}, 'cc1b95c7-1758-4833-89f2-7053ae8e7906')
.then(res => {
  // res
});
```

#### Request A Related Resource

```javascript
waterwheel.jsonapi.get('node/article', {}, 'cc1b95c7-1758-4833-89f2-7053ae8e7906/uid')
.then(res => {
  // res
});
```

#### Basic Filter

```javascript
waterwheel.jsonapi.get('node/article', {
  filter: {
    uuid: {
      value: '563196f5-4432-4964-9aeb-e4d326cb1330'
    }
  }
})
.then(res => {
  // res
});
```

#### Filter With Operators

```javascript
waterwheel.jsonapi.get('node/article', {filter: {
  myFilter: {
    condition: {
      value: '8',
      field: 'nid',
      operator: '<'
    }
  }
}})
.then(res => {
  // res
});
```

#### Post

```javascript
const postData = {
  'data': {
    'type':'node--article',
    'attributes': {
      'langcode': 'en',
      'title': 'api created page',
      'status': '1',
      'promote': '0',
      'sticky': '0',
      'default_langcode': '1',
      'path': null,
      'body': {
        'value': 'page created from the api.'
      }
    }
  }
};

waterwheel.jsonapi.post('node/article', postData)
  .then(res => {
    // Created page.
  });
```

#### Delete

```javascript
waterwheel.jsonapi.delete('node/article', 'cc1b95c7-1758-4833-89f2-7053ae8e7906')
  .then(() => {
    // Delete successful
  });
```
