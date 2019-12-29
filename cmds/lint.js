'use strict'

const EPILOG = `
Lint happens in three phases:
  - Linting of package.json
  - Checking version number of all dependencies (normal, dev, peer, optional and bundled)
  - Code linting

Supports options forwarding with '--' which are passed to 'npm-package-json-lint'
`

module.exports = {
  command: 'lint',
  desc: 'Lint all project files',
  builder: (yargs) => {
    yargs
      .options({
        fix: {
          alias: 'f',
          type: 'boolean',
          describe: 'Automatically fix errors if possible',
          default: false
        },
      })
      .epilog(EPILOG)
  },
  handler (argv) {
    const lint = require('../src/lint')
    const onError = require('../src/error-handler')
    lint(argv).catch(onError)
  }
}
