const assign = require('lodash.assign')

module.exports = function pluginError (message, previousError) {
  const err = new Error('[AssetsWebpackPlugin] ' + message)

  return previousError ? assign(err, previousError) : err
}
