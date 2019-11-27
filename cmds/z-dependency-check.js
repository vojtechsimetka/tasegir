'use strict'
const path = require('path')
const execa = require('execa')

const EPILOG = `
Supports options forwarding with '--' for more info check https://github.com/maxogden/dependency-check#cli-usage
`
const defaultInput = [
  'package.json',
  './test/**/*.ts',
  './src/**/*.ts',
  '!./test/fixtures/**/*.ts'
]

module.exports = {
  command: 'dependency-check',
  aliases: ['dep-check', 'dep'],
  desc: 'Run `dependency-check` cli with tasegir defaults.',
  builder: (yargs) => {
    yargs
      .epilog(EPILOG)
      .example('tasegir dependency-check -- --unused', 'To check unused packages in your repo.')
  },
  handler (argv) {
    const input = argv._.slice(1)
    const forwardOptions = argv['--'] ? argv['--'] : []
    const defaults = input.length ? input : defaultInput

    return execa('dependency-check', [
      ...defaults,
      '--missing',
      '--extensions', 'ts:precinct',
      '--detective', 'precinct',
      ...forwardOptions
    ], {
      stdio: 'inherit',
      localDir: path.join(__dirname, '..')
    })
  }
}
