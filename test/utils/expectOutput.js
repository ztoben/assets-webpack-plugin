/* eslint-disable no-unused-expressions */

const isRegExp = require('lodash.isregexp')
const isString = require('lodash.isstring')

const expect = require('chai').expect
const webpack = require('webpack')
const fs = require('fs')
const path = require('path')

module.exports = function (outputDir) {
  return function expectOutput (args, done) {
    if (!args.config) {
      throw new Error('Expected args.config')
    }
    if (!args.expected) {
      throw new Error('Expected args.expected')
    }
    if (!done) {
      throw new Error('Expected done')
    }

    const webpackConfig = args.config
    if (webpackConfig.plugins && webpackConfig.plugins[0].options.path) {
      outputDir = path.join(__dirname, `../../${webpackConfig.plugins[0].options.path}`)
    }
    const expectedResult = args.expected
    const outputFile = args.outputFile || 'webpack-assets.json'

    webpack(webpackConfig, function (err, stats) {
      expect(err).to.be.null
      expect(stats.hasErrors()).to.be.false

      const content = fs.readFileSync(path.join(outputDir, outputFile)).toString()

      if (isRegExp(expectedResult)) {
        expect(content).to.match(expectedResult)
      } else if (isString(expectedResult)) {
        expect(content).to.contain(expectedResult)
      } else {
        // JSON object provided
        const actual = JSON.parse(content)
        expect(actual).to.eql(expectedResult)
      }

      done()
    })
  }
}
