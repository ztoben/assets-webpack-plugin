/* eslint-env mocha */

const getAssetKind = require('../lib/getAssetKind.js')
const chai = require('chai')
const expect = chai.expect

describe('getAssetKind', function () {
  let webpackConfig

  beforeEach(function () {
    webpackConfig = {
      output: {
        filename: '[name].js?[hash]',
        sourceMapFilename: '[file].map[query]'
      },
      devtool: 'sourcemap'
    }
  })

  describe('js', function () {
    it('returns js', function () {
      const input = 'desktop.js'
      const res = getAssetKind(webpackConfig, input)
      expect(res).to.eq('js')
    })

    it('returns js with hash', function () {
      const input = 'desktop.js?9b913c8594ce98e06b21'
      const res = getAssetKind(webpackConfig, input)
      expect(res).to.eq('js')
    })
  })
})
