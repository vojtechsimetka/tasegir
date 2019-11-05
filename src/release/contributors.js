'use strict'

const _ = require('lodash')
const pify = require('pify')
const fs = require('fs-extra')
const git = require('simple-git')(process.cwd())

const getPathToPkg = require('../utils').getPathToPkg

function getContributors () {
  return pify(git.log.bind(git))([
    '--no-merges',
    '--format="%aN|%aE"'
  ]).then((log) => {
    const raw = log.all[0].hash
      .replace(/"/mig, '')
      .split('\n')

    return _(raw)
      .map((l) => l.split('|'))
      .map((items) => ({ name: items[0], email: items[1] }))
      .uniqBy('email')
      .sortBy('name')
      .map((val) => `${val.name} <${val.email}>`)
      .value()
  })
}

function areNewContributors (pkg, contributors) {
  if (!pkg.contributors)
    return true

  return _.difference(contributors, pkg.contributors).length > 0
}

async function contributors (ctx) {
  const [pkg, contributors] = await Promise.all([
    fs.readJson(getPathToPkg()),
    getContributors()
  ])

  if (!areNewContributors(pkg, contributors))
    return

  pkg.contributors = contributors
  await fs.writeJson(getPathToPkg(), pkg, { spaces: 2 })

  return pify(git.commit.bind(git))(
    'chore: update contributors',
    getPathToPkg(),
    {
      '--no-verify': true,
      '--allow-empty': true
    }
  )
}

module.exports = contributors
