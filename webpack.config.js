module.exports = {
  entry: './lib/hydrant.js',
  output: {
    path: __dirname,
    filename: '/dist/hydrant.js'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loaders: ['babel', 'expose?Hydrant']
      },
      {
        test: /\.json?$/,
        loader: 'json'
      }
    ]
  }
};
