const test = require('ava');

const requireSubvert = require('require-subvert')(__dirname);
const Nightmare = require('nightmare');
const nightmare = Nightmare();
const webpack = require('webpack');

const webpackConfig = {
  entry: '../index.js',
  output: {
    filename: './server/js/waterwheel.js'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      }
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel?cacheDirectory&presets[]=es2015']
      },
      {
        test: /\.json?$/,
        loader: 'json'
      }
    ]
  }
};

test.cb.beforeEach(t => {
  const demoServer = requireSubvert.require('./server');
  t.context.port = ~~(Math.random() * (8999 - 8000 + 1)) + 8000;
  t.context[`demoServer-${t.context.port}`] = demoServer.listen(t.context.port, () => {
    t.end();
  });
});

test.afterEach.cb(t => {
  t.context[`demoServer-${t.context.port}`].close();
  t.end();
});

test.cb('Webpack Build', t => {
  webpack(webpackConfig, (err, stats) => {
    t.is(err, null, 'An error was returned from Webpack');
    t.end();
  });
});

test.cb('Waterwheel Browser', t => {
  webpack(webpackConfig, (err, stats) => {
    nightmare
      .goto(`http://localhost:${t.context.port}/demo.html`)
      .evaluate(() => {
        return new window.Waterwheel({
          base: 'http://drupal.localhost',
          oauth: {
            grant_type: 'password',
            client_id: '22c6669c-82df-4efe-add3-5c3dca4d0f35',
            client_secret: 'password',
            username: 'admin',
            password: 'password',
            scope: 'administrator'
          }
        });
      })
      .then(result => {
        t.deepEqual(result.options.base, 'http://drupal.localhost', 'Unexpected base returned');
        t.end();
      })
      .catch(err => {
        console.log(err);
        t.end();
      });
  });
});
