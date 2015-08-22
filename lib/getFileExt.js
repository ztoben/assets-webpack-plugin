var isSourceMap   = require('./isSourceMap');
var getMapSegment = require('./getMapSegment');

function getFileExt(compilerOptions, asset) {

	var isSM = isSourceMap(compilerOptions, asset);

	// remove query string
	var queryIx = asset.indexOf('?');
	if (queryIx > -1) asset = asset.slice(0, queryIx);

	if (isSM) {
		// remove the map segment
		var mapSegment = getMapSegment(compilerOptions);
		asset = asset.replace(mapSegment, '');
	}

	var extIx = asset.lastIndexOf('.');
	return asset.slice(extIx + 1);
}

module.exports = getFileExt;
