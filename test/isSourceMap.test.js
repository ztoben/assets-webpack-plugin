/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

const isSourceMap = require('../lib/isSourceMap.js')

describe('isSourceMap', function () {
  it('detects sourcemaps', function () {
    const config = {
      output: {
        sourceMapFilename: 'sourcemap-yo[id].[hash].js[query]'
      }
    }
    const input = 'sourcemap-yo42.b4d455.js?f00b43'
    const res = isSourceMap(config, input)
    expect(res).to.eq(true)
  })

  it('detects sourcemaps with tricky templates', function () {
    const config = {
      output: {
        sourceMapFilename: '[id][hash][name]_map.js[query]'
      }
    }
    const input = '42940455foo_map.js?f00b43'
    const res = isSourceMap(config, input)
    expect(res).to.eq(true)
  })

  it("doesn't yield false positives", function () {
    const config = {
      output: {
        sourceMapFilename: '[id][hash][name]_map.js[query]'
      }
    }
    expect(isSourceMap(config, '42940455foo.js?f00b43')).to.eq(false)
  })
})
