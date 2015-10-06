var camelcase = require('camelcase');

var isSourceMap = require('./isSourceMap');
var getFileExtension = require('./getFileExtension');


module.exports = function getAssetKind (options, asset) {
    var isMap = isSourceMap(options, asset);
    if (isMap) {
        asset = asset.replace(/\.(?:source[ _.-]?)?map/i, '');
    }
    var ext = getFileExtension(asset);
    if (isMap) {
        ext += 'SourceMap';
    }
    return camelcase(ext);
};
