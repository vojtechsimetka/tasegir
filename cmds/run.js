'use strict'

const run = require('../src/run')

module.exports = {
  command: 'run <file>',
  desc: 'Run TypeScript file using Node',
  builder: (yargs) => {
    yargs
      .options({
        watch: {
          type: 'boolean',
          describe: 'Automatically reloads files on change',
          default: false
        },
        inspect: {
          type: 'boolean',
          describe: 'Runs node in inspect mode',
          default: false
        },
        'inspect-brk': {
          type: 'boolean',
          describe: 'Runs node in inspect mode, but break in beginning',
          default: false
        },
      })
      .example('tasegir run ./src/cli.ts -- --with="some argument"', 'To pass arguments to the file.')
  },
  handler (argv) {
    run(argv)
  }
}
