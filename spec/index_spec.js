var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
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
					expect(content).toContain(expectedResult);
				}
			}
			done();
		});

	});
}

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

});