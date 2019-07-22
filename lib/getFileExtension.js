module.exports = function getFileExtension (asset) {
  const extRegex = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/i
  const ext = asset.match(extRegex)

  return ext ? ext[0].slice(1) : ''
}
