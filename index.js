var buildOutput   = require('./lib/buildOutput');
var writeOutput   = require('./lib/writeOutput');
var mkdirp        = require('mkdirp');
var path          = require('path');

function Plugin(options) {
	this.options = options || {};
}

Plugin.prototype.apply = function(compiler) {
	var _this = this;
	// var assets = {};

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

		var output         = buildOutput(compiler);
		var outputFilename = _this.options.filename || 'webpack-assets.json';
		var outputFullPath = path.join(outputDir, outputFilename);

		// if (_this.options.multiCompiler) {
		// 	output =  extend(assets, output);
		// }
		writeOutput(compiler, output, outputFullPath);

		callback();
	});
};

module.exports = Plugin;
