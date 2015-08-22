var getMapSegment = require('./getMapSegment');

function isSourceMap(compilerOptions, asset) {
	var mapSegment = getMapSegment(compilerOptions);
	var mapRegex = new RegExp(mapSegment);

	return mapRegex.test(asset);
};

module.exports = isSourceMap;
