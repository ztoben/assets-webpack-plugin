var fs = require('fs')
var path = require('path')
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
    manifestFirst: true
  }, options)
  this.writer = createQueuedWriter(createOutputWriter(this.options))
}

AssetsWebpackPlugin.prototype = {
  constructor: AssetsWebpackPlugin,

  apply: function (compiler) {
    var self = this

    var afterEmit = (compilation, callback) => {
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

      var assetPath =
        stats.publicPath && self.options.fullPath ? stats.publicPath : ''
      var entries = stats.entrypoints || stats.assetsByChunkName
      var seenAssets = {}

      var chunks = Object.keys(entries)
      chunks.push('') // push "unamed" chunk
      var output = chunks.reduce(function(chunkMap, chunkName) {
        var assets = chunkName
          ? entries[chunkName].assets || entries[chunkName]
          : stats.assets
        if (!Array.isArray(assets)) {
          assets = [assets]
        }
        var added = false
        var typeMap = assets.reduce(function (typeMap, obj) {
          var asset = obj.name || obj
          if (isHMRUpdate(options, asset) || isSourceMap(options, asset) || (!chunkName && seenAssets[asset])) {
            return typeMap
          }

          var typeName = getAssetKind(options, asset)
          var combinedPath = assetPath && assetPath.slice(-1) !== '/' ? `${assetPath}/${asset}` : assetPath + asset
          var type = typeof typeMap[typeName]
          if (type === 'undefined') {
            typeMap[typeName] = combinedPath
          } else {
            if (type === 'string') {
              typeMap[typeName] = [typeMap[typeName]]
            }
            typeMap[typeName].push(combinedPath)
          }

          added = true
          seenAssets[asset] = true
          return typeMap
        }, {})

        if (added) {
          chunkMap[chunkName] = typeMap
        }
        return chunkMap
      }, {})

      var manifestName = self.options.includeManifest === true ? 'manifest' : self.options.includeManifest
      if (manifestName) {
        var manifestEntry = output[manifestName]
        if (manifestEntry) {
          var js = manifestEntry.js
          if (!Array.isArray(js)) {
            js = [js]
          }
          var manifestAssetKey = js[js.length - 1].substr(assetPath.length)
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

      if (!compiler.outputFileSystem.readFile) {
        compiler.outputFileSystem.readFile = fs.readFile.bind(fs)
        compiler.outputFileSystem.join = path.join.bind(path)
      }

      self.writer(compiler.outputFileSystem, output, function (err) {
        if (err) {
          compilation.errors.push(err)
        }
        callback()
      })
    }

    if (compiler.hooks) {
      var plugin = {name: 'AssetsWebpackPlugin'}

      compiler.hooks.afterEmit.tapAsync(plugin, afterEmit)
    } else {
      compiler.plugin('after-emit', afterEmit)
    }
  }
}

module.exports = AssetsWebpackPlugin
