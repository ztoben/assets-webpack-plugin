var getAssetKind = require('./getAssetKind')
var isHMRUpdate = require('./isHMRUpdate')
var isSourceMap = require('./isSourceMap')

/**
 * Takes in a processor function, and returns a writer function.
 *
 * @param {Function} processor
 *
 * @return {Function} queuedWriter
 */
module.exports = function generateAssetsManifest (stats, pluginOptions, compilerOptions) {
  var output = {}

  // publicPath with resolved [hash] placeholder
  var assetPath = (stats.publicPath && pluginOptions.fullPath) ? stats.publicPath : ''

  // assetsByChunkName contains a hash with the bundle names and the produced files
  // e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
  // in some cases (when using a plugin or source maps) it might contain an array of produced files
  // e.g. {
  // main:
  //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
  //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ]
  // }
  var assetsByChunkName = stats.assetsByChunkName

  output.entries = Object.keys(assetsByChunkName).reduce(function (chunkMap, chunkName) {
    var assets = assetsByChunkName[chunkName]

    if (!Array.isArray(assets)) {
      assets = [assets]
    }

    chunkMap[chunkName] = assets.reduce(function (typeMap, asset) {
      if (isHMRUpdate(compilerOptions, asset) || isSourceMap(compilerOptions, asset)) {
        return typeMap
      }

      var typeName = getAssetKind(compilerOptions, asset)
      typeMap[typeName] = assetPath + asset

      return typeMap
    }, {})

    return chunkMap
  }, {})

  output.assets = stats.assets.filter(function (asset) {
    return pluginOptions.assetsRegex.test(asset.name)
  }).map(function (asset) {
    return { name: asset.name, path: assetPath + asset.name }
  })

  if (pluginOptions.metadata) {
    output.metadata = pluginOptions.metadata
  }

  return output
}
