'use strict'

const git = require('simple-git')(process.cwd())
const pify = require('pify')
const inquirer = require('inquirer')
const execa = require('execa')
const globalConfig = require('../config/global')

const GHTOKEN_QUESTION = [
  {
    type: 'password',
    message: 'Enter a GitHub personal access token',
    name: 'ghtoken',
    mask: '*',
    validate: (token) => token.match(/^[a-z0-9]{40}$/) !== null
  }
]

async function evaluateGhtoken (value) {
  if (typeof value === 'function') {
    return await value()
  }

  if (typeof value !== 'string') {
    throw new TypeError('Unknown type of release.ghtoken property.')
  }

  if (!value.startsWith('shell:')) {
    return value
  }

  const cmd = value.replace('shell:', '')
  const result = await execa(cmd, [], {
    shell: true,
  })

  return result.stdout
}

// Check if there are valid GitHub credentials for publishing this module
async function validGh (opts) {
  if (!opts.ghrelease || opts.ghtoken) {
    return opts
  }

  const config = globalConfig()
  if (config.release.ghtoken) {
    opts.ghtoken = await evaluateGhtoken(config.release.ghtoken)
  } else {
    opts.ghtoken = (await inquirer.prompt(GHTOKEN_QUESTION))['ghtoken']
  }

  return opts
}

// Is the current git workspace dirty?
function isDirty () {
  return pify(git.raw.bind(git))(['status', '-s'])
    .then((out) => {
      if (out && out.trim().length > 0) {
        throw new Error('Dirty git repo, aborting')
      }
    })
}

// Validate that all requirements are met before starting the release
// - No dirty git
// - github token for github release, if github release is enabled
async function prerelease (opts) {
  await isDirty()
  return validGh(opts)
}

module.exports = prerelease
