var buildOutput = require('./lib/buildOutput');
var writeOutput = require('./lib/writeOutput');
var mkdirp = require('mkdirp');
var merge = require('lodash.merge');
var path = require('path');

function Plugin(options) {
	this.options = options || {};
}

// Will keep all assets during webpack compile session
// (until nodejs process dies)
var assets = {};

Plugin.prototype.apply = function(compiler) {
	var _this = this;

	compiler.plugin('emit', function(compiler, callback) {
		// console.log('emit');
		// console.log(assets);
		var outputDir = _this.options.path || '.';

		try {
			// make sure output folder exists
			mkdirp.sync(outputDir);
		} catch (e) {
			compiler.errors.push(new Error(
				'Assets Plugin: Could not create output folder' + outputDir
			));
			return callback();
		}

		var output = buildOutput(compiler);
		var outputFilename = _this.options.filename || 'webpack-assets.json';
		var outputFullPath = path.join(outputDir, outputFilename);

		if (_this.options.multiCompiler) {
			merge(assets, output);
		} else {
			assets = output
		}
		writeOutput(compiler, assets, outputFullPath, callback);
	});
};

module.exports = Plugin;
