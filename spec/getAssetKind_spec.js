var webpack = require('webpack');
var Plugin = require('../index.js');

describe('getAssetKind', function() {
	var webpackConfig;

	beforeEach(function () {
		webpackConfig = {
			output: {
				sourceMapFilename: '[file].map[query]'
			},
			devtool: 'sourcemap'
		};
	});

	describe('js', function() {

		it('returns js', function () {
			var input = 'desktop.js';
			var res = Plugin.getAssetKind(webpackConfig, input);
			expect(res).toBe('js');
		});

	});

	describe('map', function() {

		it('returns map', function() {
			var input = 'desktop.js.map';
			var res = Plugin.getAssetKind(webpackConfig, input);
			expect(res).toBe('jsMap');
		});

		it('returns map', function() {
			var input = 'desktop.js.map?9b913c8594ce98e06b21';
			var res = Plugin.getAssetKind(webpackConfig, input);
			expect(res).toBe('jsMap');
		});

	});

});

