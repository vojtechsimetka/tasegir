'use strict'
const depCheck = require('../src/dep-check')

const EPILOG = `
Supports options forwarding with '--' for more info check https://github.com/maxogden/dependency-check#cli-usage
`

module.exports = {
  command: 'dependency-check',
  aliases: ['dep-check', 'dep'],
  desc: 'Run `dependency-check` cli with tasegir defaults.',
  builder: (yargs) => {
    yargs
      .options({
        ignore: {
          alias: 'i',
          describe: 'Ignore some modules.',
        },
      })
      .epilog(EPILOG)
      .example('tasegir dependency-check -- --unused', 'To check unused packages in your repo.')
  },
  handler: depCheck
}
