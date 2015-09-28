var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

var getAssetKind = require('./lib/getAssetKind');
var isHMRUpdate = require('./lib/isHMRUpdate');
var isSourceMap = require('./lib/isSourceMap');


function AssetsWebpackPlugin (options) {
    this.options = this.getOptions(options || {});
    this.outputPath = path.join(this.options.path, this.options.filename);
}

AssetsWebpackPlugin.prototype = {
    constructor: AssetsWebpackPlugin,

    getOptions: function (options) {
        var defaults = {
            path: '.',
            filename: 'webpack-assets.json',
            prettyPrint: false
        };
        return Object.keys(defaults).reduce(function (map, option) {
            map[option] = options.hasOwnProperty(option) ? options[option] : defaults[option];
            return map;
        }, {});
    },

    apply: function (compiler) {
        var self = this;

        compiler.plugin("emit", function (compilation, callback) {
            var options = compiler.options;
            stats = compilation.getStats().toJson({
                hash: true,
                publicPath: true,
                assets: true,
                chunks: false,
                modules: false,
                source: false,
                errorDetails: false,
                timings: false
            });
            // publicPath with resolved [hash] placeholder
            var publicPath = stats.publicPath || '';
            // assetsByChunkName contains a hash with the bundle names and the produced files
            // e.g. { one: 'one-bundle.js', two: 'two-bundle.js' }
            // in some cases (when using a plugin or source maps) it might contain an array of produced files
            // e.g. {
            // main:
            //   [ 'index-bundle-42b6e1ec4fa8c5f0303e.js',
            //     'index-bundle-42b6e1ec4fa8c5f0303e.js.map' ] 
            // }
            var assetsByChunkName = stats.assetsByChunkName;

            var output = Object.keys(assetsByChunkName).reduce(function (chunkMap, chunkName) {
                var assets = assetsByChunkName[chunkName];
                if (!Array.isArray(assets)) {
                    assets = [assets];
                }
                chunkMap[chunkName] = assets.reduce(function (typeMap, asset) {
                    if (isHMRUpdate(options, asset) || isSourceMap(options, asset)) {
                        return typeMap;
                    }

                    var typeName = getAssetKind(options, asset);
                    typeMap[typeName] = publicPath + asset;

                    return typeMap;
                }, {});

                return chunkMap;
            }, {});

            self.writeOutput(output, compilation);

            callback();
        });
    },

    writeOutput: function (assets, compiler) {
        try {
            mkdirp.sync(this.options.path);
        } catch (e) {
            compiler.errors.push(new Error(
                '[AssetsWebpackPlugin]: Could not create output folder' + this.options.path
            ));
            return;
        }
        var json = JSON.stringify(assets, null, this.options.prettyPrint ? 2 : null);
        fs.writeFile(this.outputPath, json, function (err) {
            if (err) {
                compiler.errors.push(new Error(
                    '[AssetsWebpackPlugin]: Unable to write to ' + this.outputPath
                ));
            }
        });
    },

};

module.exports = AssetsWebpackPlugin;
