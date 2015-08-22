var getChunkMap = require('./getChunkMap');

function buildOutput(compiler) {

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

		var chunkMap = getChunkMap(compiler.options, chunkValue);

		output[chunkName] = chunkMap;
	}

	return output;
};

module.exports = buildOutput;
