/*jshint expr: true*/

var path              = require('path');
var fs                = require('fs');
// var mocha             = require('mocha');
var chai              = require('chai');
var webpack           = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var rm_rf             = require('rimraf');
var mkdirp            = require('mkdirp');
var _                 = require('lodash');
var Plugin            = require('../index.js');
var expect            = chai.expect;

var OUTPUT_DIR = path.join(__dirname, '../dist');

function expectOutput(args, done) {
	if (!args.config)    throw new Error('Expected args.config');
	if (!args.expected)  throw new Error('Expected args.expected');
	if (!done)           throw new Error('Expected done');

	var webpackConfig  = args.config;
	var expectedResult = args.expected;
	var outputFile     = args.outputFile;

	// Create output folder
	mkdirp(OUTPUT_DIR, function(err) {
		expect(err).to.be.null;

		outputFile = outputFile || 'webpack-assets.json';

		webpack(webpackConfig, function(err, stats) {
			expect(err).to.be.null;
			expect(stats.hasErrors()).to.be.false;

			var content = fs.readFileSync(path.join(OUTPUT_DIR, outputFile)).toString();

			if (_.isRegExp(expectedResult)) {
				expect(content).to.match(expectedResult);
			} else if(_.isString(expectedResult)) {
				expect(content).to.contain(expectedResult);
			} else {
				// JSON object provided
				var actual = JSON.parse(content);
				expect(actual).to.eql(expectedResult);
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

		var expected = {
			main: {
				js: 'index-bundle.js'
			}
		};
		expected = JSON.stringify(expected);

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
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

		var expected = {
			one: {
				js: 'one-bundle.js'
			},
			two: {
				js: 'two-bundle.js'
			}
		};

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
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

		var expected = {
			main: {
				js: 'index-bundle.js'
			}
		};

		var args = {
			config: webpackConfig,
			expected: expected,
			outputFile: 'foo.json'
		};

		expectOutput(args, done);
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
			expect(stats.hasErrors()).to.be.true;
			expect(stats.toJson().errors[0]).to.contain('Plugin');
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

		var expected = {
			main: {
				js:    'index-bundle.js',
				jsMap: 'index-bundle.js.map'
			}
		};

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
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

		var expected = /{"main":{"js":"index-bundle-[0-9a-f]+\.js","jsMap":"index-bundle-[0-9a-f]+\.js\.map"}}/;

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
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

		var expected = /{"main":{"js":"index-bundle-[0-9a-f]+\.js"}}/;

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
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

		var expected = {
			one: {
				js: "one-bundle.js"
			},
			two: {
				js: "two-bundle.js"
			},
			styles: {
				js:  "styles-bundle.js",
				css: "styles-bundle.css"
			}
		};

		var args = {
			config: webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
	});

	it.skip('generates a default file with multiple compilers', function(done) {
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

		var expected = {
			one: {
				js: "one-bundle.js"
			},
			two: {
				js: "two-bundle.js"
			}
		};

		var args = {
			config:   webpackConfig,
			expected: expected
		};

		expectOutput(args, done);
	});


});
