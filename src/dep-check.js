'use strict'
const userConfig = require('./config/user')
const path = require('path')
const execa = require('execa')

const DEFAULT_IGNORE = ['@types/*', 'tasegir']

const DEFAULT_INPUTS = [
  'package.json',
  './test/**/*.ts',
  './src/**/*.ts',
  '!./test/fixtures/**/*.ts'
]

module.exports = function depCheck (argv) {
  const config = userConfig()

  const input = argv._.slice(1)
  const forwardOptions = argv['--'] ? argv['--'] : []
  const defaults = input.length ? input : (config.depCheck && config.depCheck.files ? config.depCheck.files : DEFAULT_INPUTS)

  const ignored = (config.depCheck && config.depCheck.ignore) || DEFAULT_IGNORE
  const formattedIgnored = ignored.flatMap(value => ['--ignore-module', value])

  return execa('dependency-check', [
    ...defaults,
    '--missing',
    '--unused',
    '--extensions', 'ts:precinct',
    '--detective', 'precinct',
    ...formattedIgnored,
    ...forwardOptions
  ], {
    stdio: 'inherit',
    localDir: path.join(__dirname, '..')
  })
}
