const { fromRoot } = require('./utils')
const tsconfig = require('./config/tsconfig.js')
const execa = require('execa')
const globby = require('globby')
const path = require('path')
const rimraf = require('rimraf')

const isProduction = process.env.NODE_ENV === 'production'
const COMPILE_DIR = fromRoot('lib')

module.exports = async function compile (argv) {
  const forwardOptions = argv['--'] ? argv['--'] : []

  // Clean-up
  rimraf.sync(COMPILE_DIR)

  if (isProduction) {
    forwardOptions.push('--declaration', '--declarationDir', fromRoot('types'))
  }

  const paths = await globby([fromRoot('src', '**', '*.ts'), fromRoot('src', '*.ts')]);

  return execa('tsc', [
    '--outDir',
    COMPILE_DIR,
    ...tsconfig(),
    ...forwardOptions,
    ...paths
  ], {
    stdio: 'inherit',
    cwd: process.cwd(),
    localDir: path.join(__dirname, '..')
  })
}
