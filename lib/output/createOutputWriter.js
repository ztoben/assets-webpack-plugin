var path = require('path')
var merge = require('lodash.merge')

var error = require('../utils/error')

module.exports = function (options) {
  var outputPath = path.join(options.path, options.filename)
  var update = options.update
  var firstRun = true

  options.processOutput = options.processOutput || function (assets) {
    return JSON.stringify(assets, null, options.prettyPrint ? 2 : null)
  }

  return function writeOutput (ifs, ofs, newAssets, next) {
    // if potions.update is false and we're on the first pass of a (possibly) multicompiler
    var overwrite = !update && firstRun

    ofs.mkdirp(options.path, function (err) {
      if (err) {
        return next(error('Could not create output folder ' + options.path, err))
      }
      ifs.readFile(outputPath, function (err, data) {
        // if file does not exist, just write data to it
        if (err && err.code !== 'ENOENT') {
          return next(error('Could not read output file ' + outputPath, err))
        }
        // if options.update is false and we're on first run,
        // start with empty data
        if (overwrite) {
          data = '{}'
        } else if (data) {
          data = data.toString('utf8')
        } else {
          data = '{}'
        }

        var oldAssets
        try {
          oldAssets = JSON.parse(data)
        } catch (err) {
          oldAssets = {}
        }

        var assets = merge({}, oldAssets, newAssets)
        var output = options.processOutput(assets)
        if (output !== data) {
          ofs.writeFile(outputPath, output, function (err) {
            if (err) {
              return next(error('Unable to write to ' + outputPath, err))
            }
            firstRun = false
            next()
          })
        } else {
          next()
        }
      })
    })
  }
}
