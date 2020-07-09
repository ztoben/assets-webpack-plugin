/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const isHMRUpdate = require('../lib/isHMRUpdate.js')

describe('isHMRUpdate', function () {
  it('detects HMR updates', function () {
    const config = {
      output: {
        hotUpdateChunkFilename: 'hmr-yo[id].[hash].js[query]'
      }
    }
    const input = 'hmr-yo42.b4d455.js?f00b43'
    const res = isHMRUpdate(config, input)
    expect(res).to.eq(true)
  })

  it('detects HMR updates with tricky templates', function () {
    const config = {
      output: {
        hotUpdateChunkFilename: '[id][hash][name]hmr.js[query]'
      }
    }
    const input = '42940455foo-hmr.js?f00b43'
    const res = isHMRUpdate(config, input)
    expect(res).to.eq(true)
  })

  it('doesn\'t yield false positives', function () {
    const config = {
      output: {
        hotUpdateChunkFilename: '[id][hash][name]hmr.js[query]'
      }
    }
    expect(isHMRUpdate(config, '42940455foo-hmr?f00b43')).to.eq(false)
  })
})
