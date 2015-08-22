var isSourceMap   = require('./isSourceMap');
var getMapSegment = require('./getMapSegment');

function getFileExt() {

	var isSM = isSourceMap(compilerOptions, asset);

	if (isSM) {
		// remove the map segment
		var mapSegment = getMapSegment(compilerOptions);
		asset = asset.replace(mapSegment, '');
		// remove queries
		var queryIx = asset.indexOf('?');
		if (queryIx > -1) asset = asset.slice(0, queryIx);
	}

	var extIx = asset.lastIndexOf('.');
	return asset.slice(extIx + 1);
}

module.exports = getFileExt;
