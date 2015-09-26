var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: './src/app.js',

  output: {
    filename: 'app.js',
    path: path.resolve('./dist'),
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
  },


  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js']
  },

  devtool: "#inline-source-map"
};
