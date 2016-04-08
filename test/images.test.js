/* eslint-env mocha */

var path = require('path')
var rmRf = require('rimraf')
var Plugin = require('../index.js')

var OUTPUT_DIR = path.join(__dirname, '../tmp')
var expectOutput = require('./utils/expectOutput')(OUTPUT_DIR)

describe('Images', function () {
  beforeEach(function (done) {
    rmRf(OUTPUT_DIR, done)
  })

  it('generates a default file with images', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/images.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      module: {
        loaders: [
          {test: /\.svg$/, loader: 'file?name=[path][name].[ext]'}
        ]
      },
      plugins: [new Plugin({
        path: 'tmp'
      })]
    }

    var expected = {
      chunks: {
        main: {
          js: 'index-bundle.js'
        }
      },
      images: [{
        name: 'test/fixtures/home.svg',
        path: 'test/fixtures/home.svg'
      }]
    }
    expected = JSON.stringify(expected)

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })
})
