var getFileExt     = require('../lib/getFileExt.js');
var chai           = require('chai');
var expect         = chai.expect;

function expectExtension(webpackConfig, file, expected) {
	var actual = getFileExt(webpackConfig, file) ;
	expect(actual).to.eq(expected);
}

describe('getFileExt', function() {
	var webpackConfig;

	beforeEach(function () {
		webpackConfig = {
			output: {
				filename:          '[name].js?[hash]',
				sourceMapFilename: '[file].map[query]'
			},
			devtool: 'sourcemap'
		};
	});

	it('is js', function() {
		webpackConfig.output.filename = '[name].js';
		expectExtension(webpackConfig, 'main.js', 'js');
	});

	it('is js with hash', function() {
		webpackConfig.output.filename = '[name]-[hash].js';
		expectExtension(webpackConfig, 'main-9b913c8594ce98e06b21.js', 'js');
	});

	it('is js with hash', function() {
		webpackConfig.output.filename = '[name].js?[hash]';
		expectExtension(webpackConfig, 'main.js?9b913c8594ce98e06b21', 'js');
	});

	it('is js', function() {
		webpackConfig.output.filename = '[name].js';
		expectExtension(webpackConfig, 'desktop.js.map?9b913c8594ce98e06b21', 'js');
	});

});
