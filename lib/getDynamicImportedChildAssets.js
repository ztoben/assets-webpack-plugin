const getAssetsFromChildChunk = (options, chunk, loadingBehavior) => {
  const assets = []

  if (chunk.assets) {
    chunk.assets.forEach(asset => {
      asset.loadingBehavior = loadingBehavior
      assets.push(asset)
    })
  }

  if (options.includeAuxiliaryAssets && chunk.auxiliaryAssets) {
    chunk.auxiliaryAssets.forEach(asset => {
      asset.loadingBehavior = loadingBehavior
      assets.push(asset)
    })
  }

  return assets
}

module.exports = function getDynamicImportedChildAssets (options, children) {
  const loadingBehaviors = ['preload', 'prefetch']
  let assets = []

  loadingBehaviors.forEach(loadingBehavior => {
    if (children[loadingBehavior]) {
      children[loadingBehavior].forEach(childChunk => {
        assets = [...assets, ...getAssetsFromChildChunk(options, childChunk, loadingBehavior)]
      })
    }
  })

  return assets
}
