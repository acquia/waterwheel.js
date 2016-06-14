# Waterwheel

A generic JavaScript helper library to query and manipulate Drupal 8 via core REST

---

## Setup

* Run `npm i` to install development dependencies.
* Run `npm t` to run tests and check coverage.
* Run `npm run build` to create a browser version; located in `dist/waterwheel.js`.

## Usage

First, ensure that you have set up cross-origin resource sharing on your Drupal site to enable Waterwheel to perform necessary tasks.

From a server environment,

```javascript
const Waterwheel = require('waterwheel');
const waterwheel = new Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

waterwheel.api.content.get(1)
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });

waterwheel.api.query('node').condition('field_foo', 'bar').range(0, 5).get()
  .then(res => {
    // result would be first five nodes, where 'field_foo' is equal to 'bar'
  })
  .catch(err => {
    // err
  });
```

From the browser,

```javascript
const waterwheel = new window.Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

waterwheel.api.content.get(1)
  .then(res => {
    // res
  })
  .catch(err => {
    // err
  });

waterwheel.api.query('node').condition('field_foo', 'bar').range(0, 5).get()
  .then(res => {
    // result would be first five nodes, where 'field_foo' is equal to 'bar'
  })
  .catch(err => {
    // err
  });
```

Or make a bunch of requests,

```javascript
const waterwheel = new window.Waterwheel('http://test.dev', {username: 'admin', 'password': '1234'});

Promise.all([waterwheel.api.contentType.get('article'), waterwheel.api.contentType.get('page'), waterwheel.api.content.get(1)])
  .then(res => {
    // res
  });
```
