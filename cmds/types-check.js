'use strict'

const { fromRoot } = require('../src/utils')
const tsconfig= require('../src/config/tsconfig')
const execa = require('execa')
const path = require('path')
const globby = require('globby')

const EPILOG = `
Supports options forwarding with '--' for more info check https://www.typescriptlang.org/docs/handbook/compiler-options.html
`

module.exports = {
  command: 'types-check',
  desc: 'Run static types-check',
  builder: (yargs) => {
    yargs
      .epilog(EPILOG)
      .example('npx tasegir types-check -- --watch', 'To continuously watch changes.')
  },
  async handler (argv) {
    const forwardOptions = argv['--'] ? argv['--'] : []
    const paths = await globby([fromRoot('src', '**', '*.ts'), fromRoot('src', '*.ts')])
    return execa('tsc', [
      '--noEmit',
      ...tsconfig.compilerCliOptions(),
      ...forwardOptions,
      ...paths
    ], {
      stdio: 'inherit'
    })
  }
}
