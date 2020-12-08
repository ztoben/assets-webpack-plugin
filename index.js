const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const getAssetKind = require('./lib/getAssetKind')
const isHMRUpdate = require('./lib/isHMRUpdate')
const isSourceMap = require('./lib/isSourceMap')
const getDynamicImportedChildAssets = require('./lib/getDynamicImportedChildAssets')

const createQueuedWriter = require('./lib/output/createQueuedWriter')
const createOutputWriter = require('./lib/output/createOutputWriter')

function AssetsWebpackPlugin (options) {
  this.options = _.merge({}, {
    filename: 'webpack-assets.json',
    prettyPrint: false,
    update: false,
    fullPath: true,
    manifestFirst: true,
    useCompilerPath: false,
    fileTypes: ['js', 'css'],
    includeAllFileTypes: true,
    includeFilesWithoutChunk: false,
    includeAuxiliaryAssets: false,
    includeDynamicImportedAssets: false,
    keepInMemory: false,
    integrity: false,
    removeFullPathAutoPrefix: false
  }, options)
}

AssetsWebpackPlugin.prototype = {
  constructor: AssetsWebpackPlugin,

  apply: function (compiler) {
    const self = this

    self.options.path = path.resolve(
      self.options.useCompilerPath
        ? (compiler.options.output.path || '.')
        : (self.options.path || '.')
    )
    self.writer = createQueuedWriter(createOutputWriter(self.options))

    const afterEmit = (compilation, callback) => {
      const options = compiler.options
      const stats = compilation.getStats().toJson({
        hash: true,
        publicPath: true,
        assets: true,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false
      })

      let assetPath = (stats.publicPath && self.options.fullPath) ? stats.publicPath : ''
      // assetsByChunkName contains a hash with the bundle names and the produced files
      // e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
      // in some cases (when using a plugin or source maps) it might contain an array of produced files
      // e.g. {
      // main:
      //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
      //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ]
      // }
      // starting with webpack 5, the public path is automatically determined when possible and the path is prefaced
      // with `/auto/`, the `removeAutoPrefix` option can be set to turn this off

      if (self.options.removeFullPathAutoPrefix) {
        if (assetPath.startsWith('auto')) {
          assetPath = assetPath.substring(4)
        }
      }

      const seenAssets = {}
      let chunks

      if (self.options.entrypoints) {
        chunks = Object.keys(stats.entrypoints)
        if (self.options.includeFilesWithoutChunk) {
          chunks.push('') // push "unnamed" chunk
        }
      } else {
        chunks = Object.keys(stats.assetsByChunkName)
        chunks.push('') // push "unnamed" chunk
      }

      const output = chunks.reduce(function (chunkMap, chunkName) {
        let assets

        if (self.options.entrypoints) {
          assets = chunkName ? stats.entrypoints[chunkName].assets : stats.assets
        } else {
          assets = chunkName ? stats.assetsByChunkName[chunkName] : stats.assets
        }

        if (self.options.includeAuxiliaryAssets && chunkName && stats.entrypoints[chunkName].auxiliaryAssets) {
          assets = [...assets, ...stats.entrypoints[chunkName].auxiliaryAssets]
        }

        if (self.options.includeDynamicImportedAssets && chunkName && stats.entrypoints[chunkName].children) {
          const dynamicImportedChildAssets = getDynamicImportedChildAssets(options, stats.entrypoints[chunkName].children)
          assets = [...assets, ...dynamicImportedChildAssets]
        }

        if (!Array.isArray(assets)) {
          assets = [assets]
        }
        let added = false
        const typeMap = assets.reduce(function (typeMap, obj) {
          const asset = obj.name || obj

          if (isHMRUpdate(options, asset) || isSourceMap(options, asset) || (!chunkName && seenAssets[asset])) {
            return typeMap
          }

          const typeName = getAssetKind(options, asset)
          if (self.options.includeAllFileTypes || self.options.fileTypes.includes(typeName)) {
            const combinedPath = assetPath && assetPath.slice(-1) !== '/' ? `${assetPath}/${asset}` : assetPath + asset
            const type = typeof typeMap[typeName]
            const compilationAsset = compilation.assets[asset]
            const integrity = compilationAsset && compilationAsset.integrity
            const loadingBehavior = obj.loadingBehavior

            if (type === 'undefined') {
              typeMap[typeName] = combinedPath

              if (self.options.integrity && integrity) {
                typeMap[typeName + 'Integrity'] = integrity
              }
            } else {
              if (type === 'string') {
                typeMap[typeName] = [typeMap[typeName]]
              }

              if (self.options.includeDynamicImportedAssets && loadingBehavior) {
                const typeNameWithLoadingBehavior = typeName + ':' + loadingBehavior

                typeMap[typeNameWithLoadingBehavior] = typeMap[typeNameWithLoadingBehavior] || []
                typeMap[typeNameWithLoadingBehavior].push(combinedPath)
              } else {
                typeMap[typeName].push(combinedPath)
              }
            }

            added = true
            seenAssets[asset] = true
          }
          return typeMap
        }, {})

        if (added) {
          chunkMap[chunkName] = typeMap
        }
        return chunkMap
      }, {})

      let manifestNames = self.options.includeManifest === true ? ['manifest'] : self.options.includeManifest

      if (typeof manifestNames === 'string') {
        manifestNames = [manifestNames]
      }

      if (manifestNames) {
        for (let i = 0; i < manifestNames.length; i++) {
          const manifestName = manifestNames[i]
          const manifestEntry = output[manifestName]

          if (manifestEntry) {
            let js = manifestEntry.js || manifestEntry.mjs
            if (!Array.isArray(js)) {
              js = [js]
            }
            const manifestAssetKey = js[js.length - 1].substr(assetPath.length)
            const parentSource = compilation.assets[manifestAssetKey]
            const entryText = parentSource.source()
            if (!entryText) {
              throw new Error('Could not locate manifest function in source', parentSource)
            }
            manifestEntry.text = entryText
          }
        }
      }

      if (self.options.metadata) {
        output.metadata = self.options.metadata
      }

      if (!compiler.outputFileSystem.readFile) {
        compiler.outputFileSystem.readFile = fs.readFile.bind(fs)
      }

      if (!compiler.outputFileSystem.join) {
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
      const plugin = { name: 'AssetsWebpackPlugin' }

      compiler.hooks.afterEmit.tapAsync(plugin, afterEmit)
    } else {
      compiler.plugin('after-emit', afterEmit)
    }
  }
}

module.exports = AssetsWebpackPlugin
