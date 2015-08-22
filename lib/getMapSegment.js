function getMapSegment(compilerOptions) {
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

module.exports = getMapSegment;
