const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const error = require('../utils/error')

function sortAssets (assets) {
  return Object.keys(assets).map(i => ({ [i]: assets[i] })).sort((a, b) => {
    if (a.manifest) {
      return -1
    }

    if (b.manifest) {
      return 1
    }

    return 0
  })
}

function orderAssets (assets, options) {
  return options.manifestFirst
    ? Object.assign({}, ...sortAssets(assets))
    : assets
}

module.exports = function (options) {
  const update = options.update
  let firstRun = true

  options.processOutput = options.processOutput || function (assets) {
    return JSON.stringify(assets, null, options.prettyPrint ? 2 : null)
  }

  return function writeOutput (fileStream, newAssets, next) {
    // if options.update is false and we're on the first pass of a (possibly) multicompiler
    const overwrite = !update && firstRun
    const localFs = options.keepInMemory ? fileStream : fs

    function mkdirCallback (err) {
      if (err) handleMkdirError(err)

      const outputPath = options.keepInMemory
        ? localFs.join(options.path, options.filename)
        : path.join(options.path, options.filename)

      localFs.readFile(outputPath, 'utf8', function (err, data) {
        // if file does not exist, just write data to it
        if (err && err.code !== 'ENOENT') {
          return next(error('Could not read output file ' + outputPath, err))
        }

        // if options.update is false and we're on first run, so start with empty data
        data = overwrite ? '{}' : data || '{}'

        let oldAssets
        try {
          oldAssets = JSON.parse(data)
        } catch (err) {
          oldAssets = {}
        }

        const assets = orderAssets(_.merge({}, oldAssets, newAssets), options)
        const output = options.processOutput(assets)
        if (output !== data) {
          localFs.writeFile(outputPath, output, function (err) {
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
    }

    function handleMkdirError (err) {
      return next(error('Could not create output folder ' + options.path, err))
    }

    if (options.keepInMemory) {
      localFs.mkdir(options.path, { recursive: true }, mkdirCallback)
    } else {
      fs.mkdir(options.path, { recursive: true }, mkdirCallback)
    }
  }
}
