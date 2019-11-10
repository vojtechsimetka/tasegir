const fs = require('fs-extra')
const { fromTasegir, fromRoot } = require('../utils')
const userConfig = require('./user')
const _ = require('lodash')

function compilerCliOptions () {
  const out = []
  const compilerOptions = options().compilerOptions

  for (const optionName in compilerOptions) {
    if (!compilerOptions.hasOwnProperty(optionName)) continue
    let value = compilerOptions[optionName]

    if (Array.isArray(value)) {
      value = `"${value.join(',')}"`
    }

    out.push(`--${optionName}`, value.toString())
  }

  return out
}

function options (types = false) {
  let defaultOptions = fs.readJsonSync(fromTasegir('src', 'config', 'tsconfig.json'))

  if (types) {
    const typeRoots = [
      fromRoot('node_modules/@types'),
      fromRoot('src/@types')
    ]
    defaultOptions = _.merge(defaultOptions, { compilerOptions: { typeRoots } })
  }

  return _.merge(defaultOptions, userConfig().tsconfig)
}

module.exports = options
module.exports.compilerCliOptions = compilerCliOptions
