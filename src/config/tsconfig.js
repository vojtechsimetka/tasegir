const fs = require('fs-extra')
const { fromTasegir } = require('../utils')
const userConfig = require('./user')

module.exports = function () {
  const defaultOptions = fs.readJsonSync(fromTasegir('src', 'config', 'tsconfig.json')).compilerOptions
  const options = Object.assign(defaultOptions, userConfig().tsconfig)
  const out = []

  for (const optionName in options) {
    if (!options.hasOwnProperty(optionName)) continue

    out.push(`--${optionName}`, options[optionName])
  }

  return out
}
