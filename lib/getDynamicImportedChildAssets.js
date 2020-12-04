'use strict'

const getAssetsFromChildChunk = (options, chunk, loadingBehaviour) => {
  const assets = []
  if (chunk.assets) {
    chunk.assets.forEach(asset => {
      asset.loadingBehaviour = loadingBehaviour
      assets.push(asset)
    })
  }
  if (options.includeAuxiliaryAssets && chunk.auxiliaryAssets) {
    chunk.auxiliaryAssets.forEach(asset => {
      asset.loadingBehaviour = loadingBehaviour
      assets.push(asset)
    })
  }
  return assets
}

module.exports = function getDynamicImportedChildAssets (options, children) {
  let assets = []

  if (children.preload) {
    children.preload.forEach(childChunk => {
      const assetsFromChildChunk = getAssetsFromChildChunk(options, childChunk, 'preload')
      assets = [...assets, ...assetsFromChildChunk]
    })
  }

  if (children.prefetch) {
    children.prefetch.forEach(childChunk => {
      const assetsFromChildChunk = getAssetsFromChildChunk(options, childChunk, 'prefetch')
      assets = [...assets, ...assetsFromChildChunk]
    })
  }

  return assets
}
