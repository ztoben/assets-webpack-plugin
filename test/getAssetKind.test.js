var getAssetKind = require('../lib/getAssetKind.js');
var chai = require('chai');
var expect = chai.expect;


describe('getAssetKind', function () {
  var webpackConfig;

  beforeEach(function () {
    webpackConfig = {
      output: {
        filename: '[name].js?[hash]',
        sourceMapFilename: '[file].map[query]'
      },
      devtool: 'sourcemap'
    };
  });

  describe('js', function () {

    it('returns js', function () {
      var input = 'desktop.js';
      var res = getAssetKind(webpackConfig, input);
      expect(res).to.eq('js');
    });

    it('returns js with hash', function () {
      var input = 'desktop.js?9b913c8594ce98e06b21';
      var res = getAssetKind(webpackConfig, input);
      expect(res).to.eq('js');
    });

  });

});

