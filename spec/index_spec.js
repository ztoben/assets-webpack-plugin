var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var rm_rf = require('rimraf');
var mkdirp = require('mkdirp');
var Plugin = require('../index.js');

var OUTPUT_DIR = path.join(__dirname, '../dist');

function testPlugin(webpackConfig, expectedResults, outputFile, done) {
	// Create output folder
	mkdirp(OUTPUT_DIR, function(err) {
		expect(err).toBeFalsy();

		outputFile = outputFile || 'webpack-assets.json';

		webpack(webpackConfig, function(err, stats) {
			expect(err).toBeFalsy();
			expect(stats.hasErrors()).toBe(false);

			var content = fs.readFileSync(path.join(OUTPUT_DIR, outputFile)).toString();

			for (var i = 0; i < expectedResults.length; i++) {
				var expectedResult = expectedResults[i];
				if (expectedResult instanceof RegExp) {
					expect(content).toMatch(expectedResult);
				} else {
					var json = JSON.parse(content);
					var expectedJson = JSON.parse(expectedResult);
					expect(json).toEqual(expectedJson);
				}
			}
			done();
		});

	});
}

describe('getAssetChunk', function() {
	var webpackConfig;

	beforeEach(function () {
		webpackConfig = {
			output: {
				sourceMapFilename: '[file].map[query]'
			},
			devtool: 'sourcemap'
		};
	});

	it('returns the string when given just a string', function () {
		var input = 'desktop.js';
		var res = Plugin.getAssetChunk(input, webpackConfig);
		expect(res).toBe(input);
	});

	it('returns the assets when given an array', function() {
		var input = ['desktop.js?9b913c8594ce98e06b21', 'desktop.js.map?9b913c8594ce98e06b21'];
		var res = Plugin.getAssetChunk(input, webpackConfig);
		expect(res).toBe('desktop.js?9b913c8594ce98e06b21');
	});
});

describe('Plugin', function() {
	beforeEach(function(done) {
		rm_rf(OUTPUT_DIR, done);
	});

	it('generates a default file for a single entry point', function(done) {
		var webpackConfig = {
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle.js'
			},
			plugins: [new Plugin({
				path: 'dist'
			})]
		};

		var expected = ['{"main":"index-bundle.js"}'];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('generates a default file with multiple entry points', function(done) {
		var webpackConfig = {
			entry: {
				one: path.join(__dirname, 'fixtures/one.js'),
				two: path.join(__dirname, 'fixtures/two.js')
			},
			output: {
				path: OUTPUT_DIR,
				filename: '[name]-bundle.js'
			},
			plugins: [new Plugin({
				path: 'dist'
			})]
		};

		var expected = ['{"one":"one-bundle.js","two":"two-bundle.js"}'];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('generates a default file with multiple compilers', function(done) {
		var webpackConfig = [
			{
				entry: {
					one: path.join(__dirname, 'fixtures/one.js')
				},
				output: {
					path: OUTPUT_DIR,
					filename: 'one-bundle.js'
				},
				plugins: [new Plugin({
					multiCompiler: true,
					path: 'dist'
				})]
			},
			{
				entry: {
					two: path.join(__dirname, 'fixtures/two.js')
				},
				output: {
					path: OUTPUT_DIR,
					filename: 'two-bundle.js'
				},
				plugins: [new Plugin({
					multiCompiler: true,
					path: 'dist'
				})]
			}
		];

		var expected = ['{"one":"one-bundle.js","two":"two-bundle.js"}'];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('allows you to specify your own filename', function(done) {

		var webpackConfig = {
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle.js'
			},
			plugins: [new Plugin({
				filename: 'foo.json',
				path: 'dist'
			})]
		};

		var expected = ['{"main":"index-bundle.js"}'];

		testPlugin(webpackConfig, expected, 'foo.json', done);
	});

	it('registers a webpack error when output folder doesnt exists', function(done) {
		var webpackConfig = {
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle.js'
			},
			plugins: [new Plugin({
				path: 'notFound'
			})]
		};

		webpack(webpackConfig, function(err, stats) {
			expect(stats.hasErrors()).toBe(true);
			expect(stats.toJson().errors[0]).toContain('Plugin');
			done();
		});
	});

	it('works with source maps', function(done) {

		var webpackConfig = {
			devtool: 'sourcemap',
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle.js'
			},
			plugins: [new Plugin({
				path: 'dist'
			})]
		};

		var expected = ['{"main":"index-bundle.js"}'];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('works with source maps and hash', function(done) {
		var webpackConfig = {
			devtool: 'sourcemap',
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle-[hash].js'
			},
			plugins: [new Plugin({
				path: 'dist'
			})]
		};

		var expected = [/{"main":"index-bundle-[0-9a-f]+\.js"}/];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('handles hashes in bundle filenames', function(done) {

		var webpackConfig = {
			entry: path.join(__dirname, 'fixtures/one.js'),
			output: {
				path: OUTPUT_DIR,
				filename: 'index-bundle-[hash].js'
			},
			plugins: [new Plugin({
				path: 'dist'
			})]
		};

		var expected = [/{"main":"index-bundle-[0-9a-f]+\.js"}/];

		testPlugin(webpackConfig, expected, null, done);
	});

	it('works with ExtractTextPlugin for stylesheets', function(done) {

		var webpackConfig = {
			entry: {
				one: path.join(__dirname, 'fixtures/one.js'),
				two: path.join(__dirname, 'fixtures/two.js'),
				styles: path.join(__dirname, 'fixtures/styles.js')
			},
			output: {
				path: OUTPUT_DIR,
				filename: '[name]-bundle.js'
			},
			module: {
				loaders: [
					{test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader')}
				]
			},
			plugins: [
				new ExtractTextPlugin('[name]-bundle.css', {allChunks: true}),
				new Plugin({
					path: 'dist'
				})
			]
		};

		var expected = ['{"one":"one-bundle.js","two":"two-bundle.js","styles":"styles-bundle.css"}'];

		testPlugin(webpackConfig, expected, null, done);
	});

});
