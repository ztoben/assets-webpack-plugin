var merge = require('lodash.merge')

var getAssetKind = require('./lib/getAssetKind')
var isHMRUpdate = require('./lib/isHMRUpdate')
var isSourceMap = require('./lib/isSourceMap')

var createQueuedWriter = require('./lib/output/createQueuedWriter')
var createOutputWriter = require('./lib/output/createOutputWriter')

function AssetsWebpackPlugin (options) {
  this.options = merge({}, {
    path: '.',
    filename: 'webpack-assets.json',
    prettyPrint: false,
    update: false,
    fullPath: true,
    /**
     * binaryRegex something like /^(\w+)\.(png|jpg)$/,
     * which will match the chunk created by file-loader of options `name=[name].[ext]`
     * first captured will be used as name of chunk,
     * last captured will be used as ext of chunk
     */
    binaryRegex: undefined,
    /**
     * key for binary files, default 'assets'
     * manifest.json
     * {
     *   ...,
     *    assets: {
     *      key: v,
     *      key, v
     *    }
     * }
    */
    binaryKey: 'assets'
  }, options)
  this.writer = createQueuedWriter(createOutputWriter(this.options))
}

AssetsWebpackPlugin.prototype = {

  constructor: AssetsWebpackPlugin,

  apply: function (compiler) {
    var self = this

    compiler.plugin('after-emit', function (compilation, callback) {
      var options = compiler.options
      var stats = compilation.getStats().toJson({
        hash: true,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false
      })
            // publicPath with resolved [hash] placeholder

      var assetPath = (stats.publicPath && self.options.fullPath) ? stats.publicPath : ''
            // assetsByChunkName contains a hash with the bundle names and the produced files
            // e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
            // in some cases (when using a plugin or source maps) it might contain an array of produced files
            // e.g. {
            // main:
            //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
            //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ]
            // }
      var assetsByChunkName = stats.assetsByChunkName
      var allAssets = stats.assets
      var chunkSet = []

      var output = Object.keys(assetsByChunkName).reduce(function (chunkMap, chunkName) {
        var assets = assetsByChunkName[chunkName]
        if (!Array.isArray(assets)) {
          assets = [assets]
        }
        chunkMap[chunkName] = assets.reduce(function (typeMap, asset) {
          if (isHMRUpdate(options, asset) || isSourceMap(options, asset)) {
            return typeMap
          }

          chunkSet.push(asset)

          var typeName = getAssetKind(options, asset)
          typeMap[typeName] = assetPath + asset

          return typeMap
        }, {})

        return chunkMap
      }, {})

      if (self.options.binaryRegex) {
        var assetObj = allAssets.reduce(function (chunkMap, asset) {
          // if asset isn't in assetsByChunkNameObject
          // then try to add it to assetManifest
          var assetName = asset.name;
          if (chunkSet.indexOf(assetName) === -1) {
            var matches = assetName.match(self.options.binaryRegex)
            if (matches) {
              var name = matches[1]
              var ext = matches[matches.length - 1] || '';
              var chunkKey = ext ? name + '.' + ext : name;
              chunkMap[chunkKey] = assetPath + assetName
            }
          }
          return chunkMap
        }, {})

        output[self.options.binaryKey] = assetObj;
      }

      var manifestName = self.options.includeManifest === true ? 'manifest' : self.options.includeManifest
      if (manifestName) {
        var manifestEntry = output[manifestName]
        if (manifestEntry) {
          var manifestAssetKey = manifestEntry.js.substr(assetPath.length)
          var parentSource = compilation.assets[manifestAssetKey]
          var entryText = parentSource.source()
          if (!entryText) {
            throw new Error('Could not locate manifest function in source', parentSource)
          }
          // use _value if the uglify plugin was applied
          manifestEntry.text = entryText
        }
      }

      if (self.options.metadata) {
        output.metadata = self.options.metadata
      }

      self.writer(output, function (err) {
        if (err) {
          compilation.errors.push(err)
        }
        callback()
      })
    })
  }
}

module.exports = AssetsWebpackPlugin
