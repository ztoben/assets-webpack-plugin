# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning].

[Semantic Versioning]: http://semver.org/

## 5.1.2 - 2020-09-22

* Add a new option to include assets that aren't in any chunk using the `includeFilesWithoutChunk` option.
* Closes [#204](https://github.com/ztoben/assets-webpack-plugin/issues/204)

## 5.1.1 - 2020-08-17

* Allow more than one entry in `includeManifest`.
* Closes [#84](https://github.com/ztoben/assets-webpack-plugin/issues/84)

## 5.1.0 - 2020-08-17

* Implements using more relaxed dependencies.
* Fixes [#240](https://github.com/ztoben/assets-webpack-plugin/issues/240)

## 5.0.5 - 2020-08-17

* Plugin will now parse the `.mjs` file extension.

## 5.0.4 - 2020-08-14

* Fixes [#251](https://github.com/ztoben/assets-webpack-plugin/issues/251)

## 5.0.3 - 2020-07-09

* Bumps several dependencies.

## 5.0.2 - 2020-06-15

* Fixes an error when `keepInMemory` was turn on.

## 5.0.1 - 2020-06-15

* Fixes [#234](https://github.com/ztoben/assets-webpack-plugin/issues/234)

## 5.0.0 - 2020-06-11

* Unfortunately must bump to v5 instead of v4 due to an old botched release that can't be unpublished
* Major bump due to now requiring node 10
* Maintains the same changes as `3.10.0`, but properly warns when using an older version of node

## 3.10.0 - 2020-06-08 (Deprecated)

* Updates several dependencies
* Fixes [#226](https://github.com/ztoben/assets-webpack-plugin/issues/226)

## 3.9.10 - 2019-02-28

* Fixes [#169](https://github.com/ztoben/assets-webpack-plugin/issues/169)

## 3.9.9 - 2019-02-28

* Adds the `integrity` option to add output from webpack-subresource-integrity to the json file
* Fixes [#63](https://github.com/ztoben/assets-webpack-plugin/issues/63)

## 3.9.8 - 2019-02-27

* Dependency updates
* Fixes [#167](https://github.com/ztoben/assets-webpack-plugin/issues/167)

## 3.9.7 - 2018-10-04

* Allow webpack 4 entrypoints chunks
* Fixes [#108](https://github.com/ztoben/assets-webpack-plugin/issues/108)

## 3.9.6 - 2018-08-20

* Fixes [#125](https://github.com/ztoben/assets-webpack-plugin/issues/125)

## 3.9.5 - 2018-08-09

* Adds the `keepInMemory` option to toggle whether you want the assets file generated when running in `webpack-dev-server`.

## 3.9.4 - 2018-08-08

* Adds the `includeAllFileTypes`, and `fileTypes` options for controlling which files are included in the assets file.

## 3.9.3 - 2018-08-07

* Fixes an issue where `useCompilerPath` wasn't correctly resolving the path.

## 3.9.2 - 2018-08-07

* Reverts [#109](https://github.com/ztoben/assets-webpack-plugin/pull/109), fixes [#118](https://github.com/ztoben/assets-webpack-plugin/issues/118).

## 3.9.1 - 2018-08-06

* `useCompilerPath` option to override path with webpack output path set in config.

## 3.9.0 - 2018-08-06

* ~~Now supports webpack 4 entries with multiple chunks. See [#109](https://github.com/ztoben/assets-webpack-plugin/pull/109) for details.~~
* Use compiler.outputFileSystem for output.
* Fixes [#108](https://github.com/ztoben/assets-webpack-plugin/issues/108), [#111](https://github.com/ztoben/assets-webpack-plugin/issues/111), and [#92](https://github.com/ztoben/assets-webpack-plugin/issues/92).

## 3.8.4 - 2018-06-20

### Changed

* No code changed. Purely for testing tagged releases on git.

## 3.8.3 - 2018-06-18

### Changed

* Package json was pointing to the wrong index file.

## 3.8.2 - 2018-06-18

### Changed

* Add babel to the build process.

## 3.8.1 - 2018-06-18

### Changed

* Support for listing the manifest entry first when `manifestFirst` option is set. See [#66](https://github.com/ztoben/assets-webpack-plugin/issues/66) for details.

## 3.8.0 - 2018-06-15

### Changed

* Reverts [#90](https://github.com/ztoben/assets-webpack-plugin/pull/90), fixes [#93](https://github.com/ztoben/assets-webpack-plugin/issues/93) and [#92](https://github.com/ztoben/assets-webpack-plugin/issues/92)

## 3.7.2 - 2018-06-14

### Changed

* Reduces npm package size [#67](https://github.com/ztoben/assets-webpack-plugin/issues/67)

## 3.7.1 - 2018-06-13

### Changed

* Fixes a parsing error with the asset path introduced by the fix for [#88](https://github.com/ztoben/assets-webpack-plugin/issues/88)

## 3.7.0 - 2018-06-13

### Changed

* Adds all assets to the manifest that aren't in a chunk (kudos to [@Kronuz](https://github.com/Kronuz) see [#65](https://github.com/ztoben/assets-webpack-plugin/pull/65))

## 3.6.3 - 2018-06-13

### Changed

* Add support for multiple files of the same extension (kudos to [@aaronatmycujoo](https://github.com/aaronatmycujoo) see [#79](https://github.com/ztoben/assets-webpack-plugin/pull/79) and [@Kronuz](https://github.com/Kronuz) see [#64](https://github.com/ztoben/assets-webpack-plugin/pull/64))

## 3.6.2 - 2018-06-13

### Changed

* Fixed incorrect concatination of asset file names and directory path see [#88](https://github.com/ztoben/assets-webpack-plugin/issues/88)

## 3.6.1 - 2018-06-13

### Changed

* webpack-dev-server (which uses memory-fs) correctly generates the manifest inside the memory file system (kudos to [@Kronuz](https://github.com/Kronuz) see [#90](https://github.com/ztoben/assets-webpack-plugin/pull/90))

## 3.6.0 - 2018-05-29

### Changed

* webpack 4 support (kudos to [@ztoben](https://github.com/ztoben) and [@saveman71](https://github.com/saveman71) see [#89](https://github.com/ztoben/assets-webpack-plugin/pull/89))

## 3.5.1 - 2017-01-20

### Fixed

* Support for source maps when `includeManifest` option is set.

## 3.5.0 - 2016-10-21

### Added

* `includeManifest` option (kudos to Matt Krick [@mattkrick](https://github.com/mattkrick)).
  [See docs](./README.md#includemanifest) for more details.

## 3.4.0 - 2016-03-09

### Changed

* Do not write to assets file if output hasn't changed.

## 3.2.0 - 2015-11-17

### Added

* `processOutput` option.

## 3.1.0 - 2015-10-24

### Added

* Config now accepts a `fullPath` option.
