/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

const path = require('path')
const expect = require('chai').expect
const webpack = require('webpack')
const rmRf = require('rimraf')

const Plugin = require('../index.js')

const OUTPUT_DIR = path.join(__dirname, '../tmp')
const expectOutput = require('./utils/expectOutput')(OUTPUT_DIR)

describe('Plugin', function () {
  beforeEach(function (done) {
    rmRf(OUTPUT_DIR, done)
  })

  it('works in multi-compiler mode', function (done) {
    const plugin = new Plugin({ path: 'tmp' })

    const webpackConfig = [
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

    const expected = {
      one: {
        js: 'auto/one-bundle.js'
      },
      two: {
        js: 'auto/two-bundle.js'
      }
    }

    const args = {
      config: webpackConfig,
      expected: expected
    }

    expectOutput(args, done)
  })

  it('updates output between compiler calls when options.update is true', function (done) {
    const config1 = {
      entry: {
        one: path.join(__dirname, 'fixtures/one.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'one-bundle.js'
      },
      plugins: [new Plugin({ path: 'tmp', update: true })]
    }
    const config2 = {
      entry: {
        two: path.join(__dirname, 'fixtures/two.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'two-bundle.js'
      },
      plugins: [new Plugin({ path: 'tmp', update: true })]
    }

    const expected = { one: { js: 'auto/one-bundle.js' }, two: { js: 'auto/two-bundle.js' } }
    const args = { config: config2, expected: expected }

    webpack(config1, function (err, stats) {
      expect(err).to.be.null
      expect(stats.hasErrors()).to.be.false
      expectOutput(args, done)
    })
  })

  it('overwrites output between compiler calls when options.update is false', function (done) {
    const config1 = {
      entry: {
        one: path.join(__dirname, 'fixtures/one.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'one-bundle.js'
      },
      plugins: [new Plugin({ path: 'tmp', update: false })]
    }
    const config2 = {
      entry: {
        two: path.join(__dirname, 'fixtures/two.js')
      },
      output: {
        path: OUTPUT_DIR,
        filename: 'two-bundle.js'
      },
      plugins: [new Plugin({ path: 'tmp', update: false })]
    }

    const expected = { two: { js: 'auto/two-bundle.js' } }
    const args = { config: config2, expected: expected }

    webpack(config1, function (err, stats) {
      expect(err).to.be.null
      expect(stats.hasErrors()).to.be.false
      expectOutput(args, done)
    })
  })
})
