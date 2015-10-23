var chai = require('chai');
var expect = chai.expect;

var isSourceMap = require('../lib/isSourceMap.js');


describe('isSourceMap', function () {

  it('detects sourcemaps', function () {
    var config = {
      output: {
        sourceMapFilename: 'sourcemap-yo[id].[hash].js[query]'
      }
    };
    var input = 'sourcemap-yo42.b4d455.js?f00b43';
    var res = isSourceMap(config, input);
    expect(res).to.eq(true);
  });

  it('detects sourcemaps with tricky templates', function () {
    var config = {
      output: {
        sourceMapFilename: '[id][hash][name]_map.js[query]'
      }
    };
    var input = '42940455foo_map.js?f00b43';
    var res = isSourceMap(config, input);
    expect(res).to.eq(true);
  });

  it('doesn\'t yield false positives', function () {
    var config = {
      output: {
        sourceMapFilename: '[id][hash][name]_map.js[query]'
      }
    };
    expect(isSourceMap(config, '42940455foo.js?f00b43')).to.eq(false);
  });

});
