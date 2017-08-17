var path = require('path');
var webpack = require('webpack');
var Plugin = require('./index');

var OUTPUT_DIR = path.join(__dirname, './tmp')

module.exports = {
  devtool: 'sourcemap',
  entry: {
    one: path.join(__dirname, './test/fixtures/common-chunks/one.js'),
    two: path.join(__dirname, './test/fixtures/common-chunks/two.js'),
    three: path.join(__dirname, './test/fixtures/common-chunks/three.js')
  },
  output: {
    path: OUTPUT_DIR,
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file?name=[name].[hash].[ext]'
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ names: ['common'] }),
    new Plugin({
      path: 'tmp',
      binaryRegex: /^(\w+)\.(\w+)\.(png|jpg|gif)$/
    })
  ]
}
