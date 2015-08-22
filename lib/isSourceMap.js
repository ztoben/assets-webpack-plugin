function isSourceMap(compilerOptions, asset) {
	var mapSegment = Plugin.getMapSegment(compilerOptions);
	var mapRegex = new RegExp(mapSegment);

	return mapRegex.test(asset);
};

module.exports = isSourceMap;
