'use strict'
const path = require('path')
const execa = require('execa')
const commitlintTravis = require('../src/checks/commitlint-travis')
const commitlintCircleCi = require('../src/checks/commitlint-circleci')

const EPILOG = `
Supports options forwarding with '--' for more info check https://conventional-changelog.github.io/commitlint/#/reference-cli
`

module.exports = {
  command: 'commitlint',
  aliases: ['cl', 'commit'],
  desc: 'Run `commitlint` cli with tasegir defaults.',
  builder: (yargs) => {
    yargs
      .epilog(EPILOG)
      .example('npx tasegir commitlint -- -E HUSKY_GIT_PARAMS', 'To use inside a package.json as a Husky commit-msg hook.')
      .options({
        travis: {
          describe: 'Run `commitlint` in Travis CI mode.',
          boolean: true
        },
        circleci: {
          describe: 'Run `commitlint` in CircleCI mode.',
          boolean: true
        }
      })
  },
  handler (argv) {
    if (argv.travis) {
      return commitlintTravis()
    }
    if (argv.circleci) {
      return commitlintCircleCi()
    }

    const input = argv._.slice(1)
    const forwardOptions = argv['--'] ? argv['--'] : []
    return execa('commitlint', [
      '--extends',
      '@commitlint/config-conventional',
      ...input,
      ...forwardOptions
    ], {
      stdio: 'inherit',
      localDir: path.join(__dirname, '..')
    })
  }
}
