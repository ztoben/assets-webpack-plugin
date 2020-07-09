/* eslint-disable no-unused-expressions */

const _ = require('lodash')
const expect = require('chai').expect
const mkdirp = require('mkdirp')
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
    const expectedResult = args.expected
    let outputFile = args.outputFile

    // Create output folder
    mkdirp(outputDir)
      .then(function () {
        return null
      })
      .then(function (err) {
        expect(err).to.be.null

        outputFile = outputFile || 'webpack-assets.json'

        webpack(webpackConfig, function (err, stats) {
          expect(err).to.be.null
          expect(stats.hasErrors()).to.be.false

          const content = fs.readFileSync(path.join(outputDir, outputFile)).toString()

          if (_.isRegExp(expectedResult)) {
            expect(content).to.match(expectedResult)
          } else if (_.isString(expectedResult)) {
            expect(content).to.contain(expectedResult)
          } else {
            // JSON object provided
            const actual = JSON.parse(content)
            expect(actual).to.eql(expectedResult)
          }

          done()
        })
      })
  }
}
