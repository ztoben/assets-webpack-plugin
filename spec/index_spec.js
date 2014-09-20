var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var rm_rf = require('rimraf');
var mkdirp = require('mkdirp');
var Plugin = require('../index.js');

var OUTPUT_DIR = path.join(__dirname, '../dist');

function testPlugin(webpackConfig, expectedResults, outputFile, done) {
  // Create output folder
  mkdirp(OUTPUT_DIR, function(err) { 
    expect(err).toBeFalsy();

    outputFile = outputFile || 'webpack-assets.json';

    webpack(webpackConfig, function(err, stats) {
      expect(err).toBeFalsy();
      expect(stats.hasErrors()).toBe(false);
      
      var content = fs.readFileSync(path.join(OUTPUT_DIR, outputFile)).toString();

      for (var i = 0; i < expectedResults.length; i++) {
        var expectedResult = expectedResults[i];
        if (expectedResult instanceof RegExp) {
          expect(content).toMatch(expectedResult);
        } else {
          expect(content).toContain(expectedResult);
        }
      }
      done();
    });

  });
}

describe('Plugin', function() {
  beforeEach(function(done) {
    rm_rf(OUTPUT_DIR, done);
  });

  it('generates a default webpack-assets.json file for a single entry point', function(done) {
    var webpackConfig = {
      entry: path.join(__dirname, 'fixtures/one.js'),
      output: {
        path: OUTPUT_DIR,
        filename: 'index_bundle.js'
      },
      plugins: [new Plugin({path: 'dist'})]
    };

    testPlugin(webpackConfig, ['{"main":"index_bundle.js"}'], null, done);

  });

  // it('generates a default index.html file with multiple entry points', function(done) {
  //   testPlugin({
  //     entry: {
  //       util: path.join(__dirname, 'fixtures/util.js'),
  //       app: path.join(__dirname, 'fixtures/index.js')
  //     },
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: '[name]_bundle.js'
  //     },
  //     plugins: [new Plugin()]
  //   }, ['<script src="util_bundle.js"', '<script src="app_bundle.js"'], null, done);
  // });

  // it('allows you to specify your own HTML template file', function(done) {
  //   testPlugin({
  //     entry: {
  //       app: path.join(__dirname, 'fixtures/index.js')
  //     },
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: '[name]_bundle.js'
  //     },
  //     plugins: [new Plugin({template: path.join(__dirname, 'fixtures/test.html')})]
  //   },
  //   ['<script src="app_bundle.js"', 'Some unique text'], null, done);
  // });

  // it('allows you to specify your own HTML template string', function(done) {
  //   testPlugin({
  //     entry: {app: path.join(__dirname, 'fixtures/index.js')},
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'app_bundle.js'
  //     },
  //     plugins: [new Plugin({
  //       templateContent: fs.readFileSync(path.join(__dirname, 'fixtures/test.html'), 'utf8')
  //     })]
  //   },
  //   ['<script src="app_bundle.js"'], null, done);
  // });

  // it('registers a webpack error both template and template content are specified', function(done) {
  //   webpack({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin({
  //       template: path.join(__dirname, 'fixtures/test.html'),
  //       templateContent: 'whatever'
  //     })]
  //   }, function(err, stats) {
  //     expect(stats.hasErrors()).toBe(true);
  //     expect(stats.toJson().errors[0]).toContain('Plugin');
  //     done();
  //   });
  // });

  // it('works with source maps', function(done) {
  //   testPlugin({
  //     devtool: 'sourcemap',
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin()]
  //   }, ['<script src="index_bundle.js"'], null, done);
  // });

  // it('handles hashes in bundle filenames', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle_[hash].js'
  //     },
  //     plugins: [new Plugin()]
  //   }, [/<script src="index_bundle_[0-9a-f]+\.js"/], null, done);
  // });

  // it('prepends the webpack public path to script src', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js',
  //       publicPath: 'http://cdn.example.com/assets/'
  //     },
  //     plugins: [new Plugin()]
  //   }, ['<script src="http://cdn.example.com/assets/index_bundle.js"'], null, done);
  // });

  // it('handles subdirectories in the webpack output bundles', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'assets/index_bundle.js'
  //     },
  //     plugins: [new Plugin()]
  //   }, ['<script src="assets/index_bundle.js"'], null, done);
  // });

  // it('handles subdirectories in the webpack output bundles along with a public path', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'assets/index_bundle.js',
  //       publicPath: 'http://cdn.example.com/'
  //     },
  //     plugins: [new Plugin()]
  //   }, ['<script src="http://cdn.example.com/assets/index_bundle.js"'], null, done);
  // });

  // it('allows you to configure the title of the generated HTML page', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin({title: 'My Cool App'})]
  //   }, ['<title>My Cool App</title>'], null, done);
  // });

  // it('allows you to configure the output filename', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin({filename: 'test.html'})]
  //   }, ['<script src="index_bundle.js"'], 'test.html', done);
  // });

  // it('allows you to configure the output filename with a path', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin({filename: 'assets/test.html'})]
  //   }, ['<script src="index_bundle.js"'], 'assets/test.html', done);
  // });

  // it('allows you write multiple HTML files', function(done) {
  //   testPlugin({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [
  //       new Plugin(),
  //       new Plugin({
  //         filename: 'test.html',
  //         template: path.join(__dirname, 'fixtures/test.html')
  //       })
  //     ]
  //   }, ['<script src="index_bundle.js"'], null, done);

  //   expect(fs.existsSync(path.join(__dirname, 'fixtures/test.html'))).toBe(true);
  // });

  // it('registers a webpack error if the template cannot be opened', function(done) {
  //   webpack({
  //     entry: path.join(__dirname, 'fixtures/index.js'),
  //     output: {
  //       path: OUTPUT_DIR,
  //       filename: 'index_bundle.js'
  //     },
  //     plugins: [new Plugin({template: 'fixtures/does_not_exist.html'})]
  //   }, function(err, stats) {
  //     expect(stats.hasErrors()).toBe(true);
  //     expect(stats.toJson().errors[0]).toContain('Plugin');
  //     done();
  //   });
  // });

});