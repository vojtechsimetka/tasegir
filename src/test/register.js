'use strict'
const { fromTasegir } = require('./../utils')

require('@babel/register')({
  presets: [fromTasegir('src/config/babelrc.js')]
})
