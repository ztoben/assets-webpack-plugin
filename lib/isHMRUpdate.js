const pathTemplate = require('./pathTemplate')

module.exports = function isHMRUpdate (options, asset) {
  if (asset.includes('.hot-update.')) return true

  const hotUpdateChunkFilename = options.output.hotUpdateChunkFilename
  const hotUpdateTemplate = pathTemplate(hotUpdateChunkFilename)
  return hotUpdateTemplate.matches(asset)
}
