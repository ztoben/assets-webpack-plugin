const camelcase = require('camelcase')

const getFileExtension = require('./getFileExtension')

module.exports = function getAssetKind (options, asset) {
  const ext = getFileExtension(asset)
  return camelcase(ext)
}
