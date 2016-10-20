/* eslint-env mocha */

var path = require('path')
var expect = require('chai').expect
var webpack = require('webpack')
var rmRf = require('rimraf')

var Plugin = require('../index.js')

var OUTPUT_DIR = path.join(__dirname, '../tmp')
var expectOutput = require('./utils/expectOutput')(OUTPUT_DIR)

describe('Plugin', function () {
  beforeEach(function (done) {
    rmRf(OUTPUT_DIR, done)
  })

  it('works in multi-compiler mode', function (done) {
    var plugin = new Plugin({path: 'tmp'})

    var webpackConfig = [
      {
        entry: {
          one: path.join(__dirname, 'fixtures/one.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: 'one-bundle.js'
        },
        plugins: [plugin]
      },
      {
        entry: {
          two: path.join(__dirname, 'fixtures/two.js')
        },
        output: {
          path: OUTPUT_DIR,
          filename: 'two-bundle.js'
        },
        plugins: [plugin]
      }
    ]

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

  it('updates output between compiler calls when options.update is true', function (done) {
    var config_1 = {
      entry: {
        one: path.join(__dirname, 'fixtures/one.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'one-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp', update: true})]
    }
    var config_2 = {
      entry: {
        two: path.join(__dirname, 'fixtures/two.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'two-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp', update: true})]
    }

    var expected = {one: {js: 'one-bundle.js'}, two: {js: 'two-bundle.js'}}
    var args = {config: config_2, expected: expected}

    webpack(config_1, function (err, stats) {
      expect(err).to.be.null
      expect(stats.hasErrors()).to.be.false
      expectOutput(args, done)
    })
  })

  it('overwrites output between compiler calls when options.update is false', function (done) {
    var config_1 = {
      entry: {
        one: path.join(__dirname, 'fixtures/one.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'one-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp', update: false})]
    }
    var config_2 = {
      entry: {
        two: path.join(__dirname, 'fixtures/two.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'two-bundle.js'
      },
      plugins: [new Plugin({path: 'tmp', update: false})]
    }

    var expected = {two: {js: 'two-bundle.js'}}
    var args = {config: config_2, expected: expected}

    webpack(config_1, function (err, stats) {
      expect(err).to.be.null
      expect(stats.hasErrors()).to.be.false
      expectOutput(args, done)
    })
  })
})
