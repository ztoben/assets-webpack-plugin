var getAssetKind = require('./getAssetKind');

/*
Create a map with information about this chunk

@param stringOrArray
String or an array of strings

@return
{
	js: 'source.js'
}
*/
function getChunkMap(compilerOptions, stringOrArray) {
	if (!stringOrArray)   throw new Error('stringOrArray required');
	if (!compilerOptions) throw new Error('compilerOptions required');

	// isAsset
	// Return true if a chunk is not a source map
	// @param {String} chunk value e.g. index-bundle.js.map
	// @return {Boolean}
	function isAsset(value) {
		return !isSourceMap(value);
	}
	var output     = {};
	var publicPath = compilerOptions.output.publicPath || '';

	if (stringOrArray instanceof Array) {
		// When using plugins like 'extract-text', for extracting CSS from JS, webpack
		// will push the new bundle to the array, so the last item will be the correct
		// chunk
		// e.g. [ 'styles-bundle.js', 'styles-bundle.css' ]

		for (var a = 0; a < stringOrArray.length ; a++) {
			var asset      = stringOrArray[a];
			var kind       = getAssetKind(compilerOptions, asset);
			output[kind]   = publicPath + asset;
		}
	} else {
		output.js = publicPath + stringOrArray;
	}

	return output;
};

module.exports = getChunkMap;

