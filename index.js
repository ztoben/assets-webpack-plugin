var fs = require('fs');
var path = require('path');

function Plugin(options) {
  this.options = options || {};
}

Plugin.prototype.apply = function(compiler) {
  var self = this;

  compiler.plugin('emit', function(compiler, callback) {
    var hashes = self.getHashes(compiler);
    var outputDir = self.options.path || '.';

    // check that output folder exists
    if (fs.lstatSync(outputDir).isDirectory()){
      var outputFilename = self.options.filename || 'webpack-assets.json';
      var outputFull = path.join(outputDir, outputFilename);
      self.writeOutput(compiler, hashes, outputFull);
      callback();
    } else {
      compiler.errors.push(new Error('Plugin: Folder not found ' + outputDir));
      callback();
    }

  });
};

Plugin.prototype.writeOutput = function(compiler, hashes, outputFull) {
  var json = JSON.stringify(hashes);
  fs.writeFile(outputFull, json, function(err) {
    if(err) {
      compiler.errors.push(new Error('Plugin: Unable to save to ' + outputFull));
    }
  }); 
  // compiler.assets[outputFilename] = {
  //  source: function() {
  //    return json;
  //  },
  //  size: function() {
  //    return json.length;
  //  }
  // };
};

Plugin.prototype.getHashes = function(compiler) {
  var webpackStatsJson = compiler.getStats().toJson();
  var assets = {};
  for (var chunk in webpackStatsJson.assetsByChunkName) {
    var chunkValue = webpackStatsJson.assetsByChunkName[chunk];

    // Webpack outputs an array for each chunk when using sourcemaps
    if (chunkValue instanceof Array) {
      // Is the main bundle always the first element?
      chunkValue = chunkValue[0];
    }

    if (compiler.options.output.publicPath) {
      chunkValue = compiler.options.output.publicPath + chunkValue;
    }
    assets[chunk] = chunkValue;
  }

  return assets;
};

module.exports = Plugin;