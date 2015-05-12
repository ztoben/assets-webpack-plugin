var fs = require('fs');
var path = require('path');

var extend = require('extend');

var assets = {};

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
		self.writeOutput(compiler, self.options.multiCompiler ? extend(assets,hashes) : hashes, outputFull);
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

	// webpackStatsJson.assetsByChunkName contains a hash with the bundle names and the produced files
	// e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
	// in some cases (when using a plugin or source maps) it might contain an array of produced files
	// e.g. { main: [ 'index-bundle.js', 'index-bundle.js.map' ] }
	for (var chunk in webpackStatsJson.assetsByChunkName) {
		var chunkValue = webpackStatsJson.assetsByChunkName[chunk];
		// Webpack outputs an array for each chunk when using sourcemaps and some plugins

		chunkValue = Plugin.getAssetChunk(chunkValue, compiler.options);

		if (compiler.options.output.publicPath) {
			chunkValue = compiler.options.output.publicPath + chunkValue;
		}

		assets[chunk] = chunkValue;
	}

	return assets;
};

Plugin.getAssetChunk = function (stringOrArray, compilerOptions) {
	if (!stringOrArray) throw new Error('stringOrArray required');
	if (!compilerOptions) throw new Error('compilerOptions required');

	// For source maps we care about:
	// compilerOptions.output.sourceMapFilename;
	// compiler.devtool;

	var sourceMapFilename = compilerOptions.output.sourceMapFilename;
	// e.g. '[file].map[query]'
	var mapSegment = sourceMapFilename
		.replace('[file]', '')
		.replace('[query]', '')
		.replace('[hash]', '')
		.replace('.', '');
	var mapRegex = new RegExp(mapSegment);

	function isSourceMap(value) {
		return mapRegex.test(value);
	}

	// isAsset
	// Return true if a chunk is not a source map
	// @param {String} chunk value e.g. index-bundle.js.map
	// @return {Boolean}
	function isAsset(value) {
		return !isSourceMap(value);
	}

	if (stringOrArray instanceof Array) {
		// When using plugins like 'extract-text', for extracting CSS from JS, webpack
		// will push the new bundle to the array, so the last item will be the correct
		// chunk
		// e.g. [ 'styles-bundle.js', 'styles-bundle.css' ]

		return stringOrArray
			.filter(isAsset)
			.pop();
	} else {
		return stringOrArray;
	}
};

module.exports = Plugin;
