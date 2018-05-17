/* eslint-env mocha */

var path = require('path')
var rmRf = require('rimraf')
var Plugin = require('../index.js')

var OUTPUT_DIR = path.join(__dirname, '../tmp')
var expectOutput = require('./utils/expectOutput')(OUTPUT_DIR)

describe('Plugin', function () {
  beforeEach(function (done) {
    rmRf(OUTPUT_DIR, done)
  })

  it('generates a default file for a single entry point', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({
        path: 'tmp'
      })]
    }

    var expected = {
      main: {
        js: 'index-bundle.js'
      }
    }
    expected = JSON.stringify(expected)

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('generates a default file with multiple entry points', function (done) {
    var webpackConfig = {
      entry: {
        one: path.join(__dirname, 'fixtures/one.js'),
        two: path.join(__dirname, 'fixtures/two.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: '[name]-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp'})]
    }

    var expected = {
      one: {
        js: 'one-bundle.js'
      },
      two: {
        js: 'two-bundle.js'
      }
    }

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('allows you to specify your own filename', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({
        filename: 'foo.json',
        path: 'tmp'
      })]
    }

    var expected = {
      main: {
        js: 'index-bundle.js'
      }
    }

    var args = {
      config: webpackConfig,
      expected: expected,
      outputFile: 'foo.json'
    }

    expectOutput(args, done)
  })

  it('skips source maps', function (done) {
    var webpackConfig = {
      devtool: 'sourcemap',
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp'})]
    }

    var expected = {
      main: {
        js: 'index-bundle.js'
      }
    }

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('handles hashes in bundle filenames', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle-[hash].js'
      },
      plugins: [new Plugin({path: 'tmp'})]
    }

    var expected = /{"main":{"js":"index-bundle-[0-9a-f]+\.js"}}/

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('handles hashes in a different position', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: '[name].js?[hash]'
      },
      plugins: [new Plugin({path: 'tmp'})]
    }

    var expected = /{"main":{"js":"main\.js\?[0-9a-f]+"}}/

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('includes full publicPath', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        publicPath: '/public/path/[hash]/',
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp'})]
    }

    var expected = new RegExp('/public/path/[0-9a-f]+/index-bundle.js', 'i')

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('doesn\'t include full publicPath', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        publicPath: '/public/path/[hash]/',
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({
        path: 'tmp',
        fullPath: false
      })]
    }

    var expected = {
      main: {
        js: 'index-bundle.js'
      }
    }

    expected = JSON.stringify(expected)

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('allows injection of metadata', function (done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index-bundle.js'
      },
      plugins: [new Plugin({
        path: 'tmp',
        metadata: {
          foo: 'bar',
          baz: 'buz'
        }
      })]
    }

    var expected = {
      main: {
        js: 'index-bundle.js'
      },
      metadata: {
        foo: 'bar',
        baz: 'buz'
      }
    }
    expected = JSON.stringify(expected)

    var args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })
})
