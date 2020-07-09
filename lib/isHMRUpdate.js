const pathTemplate = require('./pathTemplate')

module.exports = function isHMRUpdate (options, asset) {
  const hotUpdateChunkFilename = options.output.hotUpdateChunkFilename
  const hotUpdateTemplate = pathTemplate(hotUpdateChunkFilename)
  return hotUpdateTemplate.matches(asset)
}
