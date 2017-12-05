var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './lib/waterwheel.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'waterwheel.js',
    libraryTarget: 'umd',
    library: 'Waterwheel'
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
