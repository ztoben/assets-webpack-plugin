/* eslint-env mocha */

var path = require('path')
var rmRf = require('rimraf')
var Plugin = require('../index.js')

var OUTPUT_DIR = path.join(__dirname, '../tmp')
var expectOutput = require('./utils/expectOutput')(OUTPUT_DIR)

describe('Assets', function () {
  beforeEach(function (done) {
    rmRf(OUTPUT_DIR, done)
  })

  it('generates a default file with assets', function (done) {
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
      entries: {
        main: {
          js: 'index-bundle.js'
        }
      },
      assets: [{
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

  it('allows overriding of assetsRegex', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/multiple-images.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      module: {
        loaders: [
          {test: /\.svg|png$/, loader: 'file?name=[path][name].[ext]'}
        ]
      },
      plugins: [new Plugin({
        path: 'tmp',
        assetsRegex: /\.(png)$/
      })]
    }

    var expected = {
      entries: {
        main: {
          js: 'index-bundle.js'
        }
      },
      assets: [{
        name: 'test/fixtures/home.png',
        path: 'test/fixtures/home.png'
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
