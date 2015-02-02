var fs = require('fs');
var path = require('path');

function Plugin(options) {
	this.options = options || {};
}

Plugin.prototype.apply = function(compiler) {
	var self = this;

	compiler.plugin('emit', function(compiler, callback) {
		var hashes = self.getHashes(compiler);
		var outputDir = self.options.path || '.';

		try {
			// check that output folder exists
			fs.lstatSync(outputDir).isDirectory();
		} catch (e) {
			compiler.errors.push(new Error('Plugin: Folder not found ' + outputDir));
			return callback();
		}

		var outputFilename = self.options.filename || 'webpack-assets.json';
		var outputFull = path.join(outputDir, outputFilename);
		self.writeOutput(compiler, hashes, outputFull);
		callback();
	});
};

Plugin.prototype.writeOutput = function(compiler, hashes, outputFull) {
	var json = JSON.stringify(hashes);
	fs.writeFile(outputFull, json, function(err) {
		if (err) {
			compiler.errors.push(new Error('Plugin: Unable to save to ' + outputFull));
		}
	});
	// compiler.assets[outputFilename] = {
	//  source: function() {
	//    return json;
	//  },
	//  size: function() {
	//    return json.length;
	//  }
	// };
};

Plugin.prototype.getHashes = function(compiler) {
	var webpackStatsJson = compiler.getStats().toJson();
	var assets = {};
	var filterDevChunks = function(value) {
		return !(
			/source-?map/.test(compiler.options.devtool) &&
			/\.map$/.test(value)
		);
	};

	for (var chunk in webpackStatsJson.assetsByChunkName) {
		var chunkValue = webpackStatsJson.assetsByChunkName[chunk];

		// Webpack outputs an array for each chunk when using sourcemaps and some plugins
		if (chunkValue instanceof Array) {
			// When using plugins like 'extract-text', for extracting CSS from JS, webpack
			// will push the new bundle to the array, so the last item will be the correct
			// chunk
			chunkValue = chunkValue.filter(filterDevChunks).pop();
		}

		if (compiler.options.output.publicPath) {
			chunkValue = compiler.options.output.publicPath + chunkValue;
		}
		assets[chunk] = chunkValue;
	}

	return assets;
};

module.exports = Plugin;
