var webpack = require('webpack');

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: '/dist/waterwheel.js'
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
        loader: 'babel',
        query: {
          presets: ['es2015'],
          cacheDirectory: true
        }
      },
      {
        test: /\.json?$/,
        loader: 'json'
      }
    ]
  }
};
