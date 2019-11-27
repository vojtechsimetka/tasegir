'use strict'

const execa = require('execa')
const commitlint = require('@commitlint/cli')

// Allow to override used bins for testing purposes
const GIT = process.env.CIRCLECI_COMMITLINT_GIT_BIN || 'git'
const COMMITLINT = process.env.CIRCLECI_COMMITLINT_BIN

const REQUIRED = [
  'CIRCLE_SHA1',
  'CIRCLE_REPOSITORY_URL',
]

const COMMIT = process.env.CIRCLE_SHA1
const REPO_URL = process.env.CIRCLE_REPOSITORY_URL
const PR_URL = process.env.CIRCLE_PULL_REQUEST
const COMPARE_URL = process.env.CIRCLE_COMPARE_URL
const IS_PR = PR_URL !== undefined

module.exports = async function main () {
  validate()

  // Stash changes in working copy if needed
  const pop = await stash()

  // Make base and source available as dedicated remotes
  await Promise.all([
    () => fetch({ name: 'base', url: REPO_URL }),
    IS_PR
      ? () => fetch({ name: 'source', url: PR_URL })
      : async () => {}
  ])

  // Restore stashed changes if any
  await pop()

  // Lint all commits in TRAVIS_COMMIT_RANGE if available
  if (IS_PR && COMPARE_URL) {
    const [start, end] = getRange(COMPARE_URL)
    await lint(['--from', start, '--to', end])
  } else {
    const input = await log(COMMIT)
    await lint([], { input })
  }
}

function getRange (compareUrl) {
  const matches = compareUrl.match(/([a-zA-Z0-9]+)\.\.\.([a-zA-Z0-9]+)$/)

  if (matches.length !== 3) {
    throw new Error(`Compare URL has unexpected format: ${compareUrl}`)
  }

  return [matches[1], matches[2]]
}

function git (args, options) {
  return execa(GIT, args, Object.assign({}, { stdio: 'inherit' }, options))
}

async function fetch ({ name, url }) {
  await git(['remote', 'add', name, url])
  await git(['fetch', name, '--quiet'])
}

async function isClean () {
  const result = await git(['status', '--porcelain'], {
    stdio: ['pipe', 'pipe', 'pipe']
  })
  return !(result.stdout && result.stdout.trim())
}

function lint (args, options) {
  return execa(
    COMMITLINT || commitlint,
    [
      '--extends',
      '@commitlint/config-conventional',
      ...args
    ],
    Object.assign({}, { stdio: ['pipe', 'inherit', 'inherit'] }, options)
  )
}

async function log (hash) {
  const result = await execa('git', [
    'log',
    '-n',
    '1',
    '--pretty=format:%B',
    hash
  ])
  return result.stdout
}

async function stash () {
  if (await isClean()) {
    return async () => {}
  }
  await git(['stash', '-k', '-u', '--quiet'])
  return () => git(['stash', 'pop', '--quiet'])
}

function validate () {
  if (process.env.CI !== 'true' || process.env.CIRCLECI !== 'true') {
    throw new Error(
      '@commitlint/circleci-cli is intended to be used on Circle CI'
    )
  }

  const missing = REQUIRED.filter(envVar => !(envVar in process.env))

  if (missing.length > 0) {
    const stanza = missing.length > 1 ? 'they were not' : 'it was not'
    throw new Error(
      `Expected ${missing.join(', ')} to be defined globally, ${stanza}.`
    )
  }
}
