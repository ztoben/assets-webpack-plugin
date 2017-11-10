/**
 * Takes in a processor function, and returns a writer function.
 *
 * @param {Function} processor
 *
 * @return {Function} queuedWriter
 */
module.exports = function createQueuedWriter (processor) {
  var queue = []

  var iterator = function (callback) {
    return function (err) {
      queue.shift()
      callback(err)

      var next = queue[0]
      if (next) {
        processor(next.ifs, next.ofs, next.data, iterator(next.callback))
      }
    }
  }

  return function queuedWriter (ifs, ofs, data, callback) {
    var empty = !queue.length
    queue.push({ifs: ifs, ofs: ofs, data: data, callback: callback})

    if (empty) {
            // start processing
      processor(ifs, ofs, data, iterator(callback))
    }
  }
}
