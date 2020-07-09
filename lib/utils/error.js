const _ = require('lodash')

module.exports = function pluginError (message, previousError) {
  const err = new Error('[AssetsWebpackPlugin] ' + message)

  return previousError ? _.assign(err, previousError) : err
}
