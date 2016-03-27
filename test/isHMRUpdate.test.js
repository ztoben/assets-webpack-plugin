/* eslint-env mocha */

var chai = require('chai')
var expect = chai.expect

var isHMRUpdate = require('../lib/isHMRUpdate.js')

describe('isHMRUpdate', function () {
  it('detects HMR updates', function () {
    var config = {
      output: {
        hotUpdateChunkFilename: 'hmr-yo[id].[hash].js[query]'
      }
    }
    var input = 'hmr-yo42.b4d455.js?f00b43'
    var res = isHMRUpdate(config, input)
    expect(res).to.eq(true)
  })

  it('detects HMR updates with tricky templates', function () {
    var config = {
      output: {
        hotUpdateChunkFilename: '[id][hash][name]hmr.js[query]'
      }
    }
    var input = '42940455foo-hmr.js?f00b43'
    var res = isHMRUpdate(config, input)
    expect(res).to.eq(true)
  })

  it('doesn\'t yield false positives', function () {
    var config = {
      output: {
        hotUpdateChunkFilename: '[id][hash][name]hmr.js[query]'
      }
    }
    expect(isHMRUpdate(config, '42940455foo-hmr?f00b43')).to.eq(false)
  })
})
