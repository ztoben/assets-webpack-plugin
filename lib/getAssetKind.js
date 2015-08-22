var getFileExt  = require('./getFileExt');
var isSourceMap = require('./isSourceMap');

function getAssetKind(compilerOptions, asset) {
	// console.log('compilerOptions', compilerOptions);
	// console.log(asset);

	var ext  = getFileExt(compilerOptions, asset);
	var isSM = isSourceMap(compilerOptions, asset);

	if (isSM) {
		return ext + 'Map';
	} else {
		return ext;
	}
};

module.exports = getAssetKind;
