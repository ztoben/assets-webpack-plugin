var fs = require('fs');
var path = require('path');

// function extend(target, source) {
// 	for(var k in source){
// 		target[k] = source[k];
// 	}
// 	return target;
// }

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
			// check that output folder exists
			fs.lstatSync(outputDir).isDirectory();
		} catch (e) {
			compiler.errors.push(new Error('Plugin: Folder not found ' + outputDir));
			return callback();
		}

		var output         = _this.buildOutput(compiler);
		var outputFilename = _this.options.filename || 'webpack-assets.json';
		var outputFullPath = path.join(outputDir, outputFilename);

		// if (_this.options.multiCompiler) {
		// 	output =  extend(assets, output);
		// }
		_this.writeOutput(compiler, output, outputFullPath);

		callback();
	});
};


/*
Write output to file system
*/
Plugin.prototype.writeOutput = function(compiler, output, outputFullPath) {
	var json = JSON.stringify(output);
	fs.writeFile(outputFullPath, json, function(err) {
		if (err) {
			compiler.errors.push(new Error('Plugin: Unable to save to ' + outputFullPath));
		}
	});
};

Plugin.prototype.buildOutput = function(compiler) {

	var webpackStatsJson  = compiler.getStats().toJson();

	var assetsByChunkName = webpackStatsJson.assetsByChunkName;
	// assetsByChunkName contains a hash with the bundle names and the produced files
	// e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
	// in some cases (when using a plugin or source maps) it might contain an array of produced files
	// e.g. {
	// main:
  //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
  //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ] 
	// }

	var output            = {};

	// console.log(webpackStatsJson);

	for (var chunkName in assetsByChunkName) {
		var chunkValue = assetsByChunkName[chunkName];
		// Webpack outputs an array for each chunkName when using sourcemaps and some plugins

		var chunkMap = Plugin.getChunkMap(compiler.options, chunkValue);

		// if (compiler.options.output.publicPath) {
		// 	chunkMap = compiler.options.output.publicPath + chunkMap;
		// }

		output[chunkName] = chunkMap;
	}

	return output;
};

Plugin.getMapSegment = function(compilerOptions) {
	// For source maps we care about:
	// compilerOptions.output.sourceMapFilename;
	// compiler.devtool;

	var sourceMapFilename = compilerOptions.output.sourceMapFilename;
	// e.g. '[file].map[query]'
	// e.g. 'index-bundle-42b6e1ec4fa8c5f0303e.js.map'

	return sourceMapFilename
		.replace('[file]', '')
		.replace('[query]', '')
		.replace('[hash]', '')
		.replace(/\//, '\\/.*');
		// .replace('.', '');
};

Plugin.isSourceMap = function(compilerOptions, asset) {
	var mapSegment = Plugin.getMapSegment(compilerOptions);
	var mapRegex = new RegExp(mapSegment);

	return mapRegex.test(asset);
};

Plugin.getFileExt = function(compilerOptions, asset) {

	var isSourceMap = Plugin.isSourceMap(compilerOptions, asset);

	if (isSourceMap) {
		// remove the map segment
		var mapSegment = Plugin.getMapSegment(compilerOptions);
		asset = asset.replace(mapSegment, '');
		// remove queries
		var queryIx = asset.indexOf('?');
		if (queryIx > -1) asset = asset.slice(0, queryIx);
	}

	var extIx = asset.lastIndexOf('.');
	return asset.slice(extIx + 1);
};

Plugin.getAssetKind = function(compilerOptions, asset) {
	// console.log('compilerOptions', compilerOptions);
	// console.log(asset);

	var isSourceMap = Plugin.isSourceMap(compilerOptions, asset);
	var ext         = Plugin.getFileExt(compilerOptions, asset);

	if (isSourceMap) {
		return ext + 'Map';
	} else {
		return ext;
	}
};

/*
Create a map with information about this chunk

@param stringOrArray
String or an array of strings

@return
{
	js: 'source.js'
}
*/
Plugin.getChunkMap = function (compilerOptions, stringOrArray) {
	if (!stringOrArray)   throw new Error('stringOrArray required');
	if (!compilerOptions) throw new Error('compilerOptions required');

	// isAsset
	// Return true if a chunk is not a source map
	// @param {String} chunk value e.g. index-bundle.js.map
	// @return {Boolean}
	function isAsset(value) {
		return !isSourceMap(value);
	}
	var output = {};

	if (stringOrArray instanceof Array) {
		// When using plugins like 'extract-text', for extracting CSS from JS, webpack
		// will push the new bundle to the array, so the last item will be the correct
		// chunk
		// e.g. [ 'styles-bundle.js', 'styles-bundle.css' ]

		for (var a = 0; a < stringOrArray.length ; a++) {
			var asset = stringOrArray[a];
			var kind = Plugin.getAssetKind(compilerOptions, asset);
			output[kind] = asset;
		}
	} else {
		output.js = stringOrArray;
	}

	return output;
};

module.exports = Plugin;
