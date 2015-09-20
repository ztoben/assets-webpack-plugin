
function isHotUpdate (compilerOptions, asset) {
    return asset.indexOf('.hot-update.') !== -1;
}

module.exports = isHotUpdate;
