'use strict'

const path = require('path')
const execa = require('execa')
const rimraf = require('rimraf')
const { fromTasegir } = require('./../utils')
const userConfig = require('../config/user')

const config = userConfig()

module.exports = (argv) => {
  const analyze = Boolean(process.env.TASEGIR_BUILD_ANALYZE || argv.analyze)
  const input = argv._.slice(1)
  const forwardOptions = argv['--'] ? argv['--'] : []
  const useBuiltinConfig = !forwardOptions.includes('--config')
  const progress = !forwardOptions.includes('--progress') && !process.env.CI ? ['--progress'] : []
  const webpackConfig = useBuiltinConfig
    ? ['--config', fromTasegir('src/config/webpack.config.js')]
    : []

  // Clean dist
  rimraf.sync(path.join(process.cwd(), 'dist'))

  // Run webpack
  const webpack = execa('webpack-cli', [
    ...webpackConfig,
    ...progress,
    ...input,
    ...forwardOptions
  ], {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      TASEGIR_BUILD_ANALYZE: analyze || ''
    },
    localDir: path.join(__dirname, '../..'),
    stdio: 'inherit'
  })

  if (argv.bundlesize) {
    return webpack
      .then(r => {
        return execa('bundlesize', ['-f', config.bundlesize.path, '-s', config.bundlesize.maxSize], {
          localDir: path.join(__dirname, '..'),
          stdio: 'inherit'
        })
      })
  }
  return webpack
}
