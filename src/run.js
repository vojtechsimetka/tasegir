const execa = require('execa')
const path = require('path')
const fs = require('fs-extra')
const { fromTasegir } = require('./utils')

const userConfig = require('./config/user')

module.exports = function (argv) {
  const defaultOptions = fs.readJsonSync(fromTasegir('src', 'config', 'tsconfig.json')).compilerOptions
  const compilerOptions = Object.assign(defaultOptions, userConfig().tsconfig)

  const env = {
    TS_NODE_COMPILER_OPTIONS: JSON.stringify(compilerOptions)
  }

  const args = argv.watch ? [] : [ '-r', 'ts-node/register' ]

  if (argv.inspect) {
    args.push('--inspect')
  } else if (argv['inspect-brk']) {
    args.push('--inspect-brk')
  }

  args.push(
    '--',
    argv.file,
    ...argv.args
  )

  return execa(argv.watch ? 'ts-node-dev' : 'node',
    args,
    {
      env,
      stdio: 'inherit',
      cwd: process.cwd(),
      localDir: path.join(__dirname, '..')
    })
}
