var _ = require('lodash');
var expect = require('chai').expect;
var mkdirp = require('mkdirp');
var webpack = require('webpack');
var fs = require('fs');
var path = require('path');


module.exports = function (outputDir) {

  return function expectOutput (args, done) {
    if (!args.config) {
      throw new Error('Expected args.config');
    }
    if (!args.expected) {
      throw new Error('Expected args.expected');
    }
    if (!done) {
      throw new Error('Expected done');
    }

    var webpackConfig = args.config;
    var expectedResult = args.expected;
    var outputFile = args.outputFile;

        // Create output folder
    mkdirp(outputDir, function (err) {
      expect(err).to.be.null;

      outputFile = outputFile || 'webpack-assets.json';

      webpack(webpackConfig, function (err, stats) {
        expect(err).to.be.null;
        expect(stats.hasErrors()).to.be.false;

        var content = fs.readFileSync(path.join(outputDir, outputFile)).toString();

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
  };
};
