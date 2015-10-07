/*jshint expr: true*/

var path = require('path');
// var mocha = require('mocha');
var chai = require('chai');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var rm_rf = require('rimraf');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var Plugin = require('../index.js');
var expect = chai.expect;

var OUTPUT_DIR = path.join(__dirname, '../tmp');
var expectOutput = require('./utils/expectOutput')(OUTPUT_DIR);


describe('Plugin with multi-compiler', function() {

    beforeEach(function(done) {
        rm_rf(OUTPUT_DIR, done);
    });

    it('generates a default file with multiple compilers', function(done) {
        var plugin = new Plugin({path: 'tmp'});

        var webpackConfig = [
            {
                entry: {
                    one: path.join(__dirname, 'fixtures/one.js')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: 'one-bundle.js'
                },
                plugins: [plugin]
            },
            {
                entry: {
                    two: path.join(__dirname, 'fixtures/two.js')
                },
                output: {
                    path: OUTPUT_DIR,
                    filename: 'two-bundle.js'
                },
                plugins: [plugin]
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
            config: webpackConfig,
            expected: expected
        };

        expectOutput(args, done);
    });
});
