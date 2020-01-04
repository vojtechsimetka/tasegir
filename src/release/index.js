'use strict'

const Listr = require('listr')

const lint = require('../lint')
const test = require('../test')
const build = require('../build')
const compile = require('../compile')
const utils = require('../utils')
const docs = require('../docs')

const releaseChecks = require('./prerelease')
const bump = require('./bump')
const changelog = require('./changelog')
const commit = require('./commit')
const contributors = require('./contributors')
const github = require('./github')
const publish = require('./publish')
const push = require('./push')

function release (opts) {
  // enable publishing for docs
  opts.publish = true

  // if nothing is set we want to release production ready code!
  if(process.env.NODE_ENV === undefined || process.env.NODE_ENV === null){
    process.env.NODE_ENV = 'production'
  }

  const tasks = new Listr([{
    title: 'Lint',
    task: lint,
    enabled: (ctx) => ctx.lint
  }, {
    title: 'Test',
    task: (ctx) => test.run(ctx),
    enabled: (ctx) => ctx.test
  }, {
    title: 'Bump Version',
    task: bump,
    enabled: (ctx) => ctx.bump
  }, {
    title: 'Build',
    task: (ctx) => build(ctx),
    enabled: (ctx) => ctx.build
  }, {
    title: 'Compile',
    task: (ctx) => compile(ctx),
    enabled: (ctx) => ctx.compile
  }, {
    title: 'Update Contributors',
    task: contributors,
    enabled: (ctx) => ctx.contributors
  }, {
    title: 'Generate Changelog',
    task: changelog,
    enabled: (ctx) => ctx.changelog
  }, {
    title: 'Commit to Git',
    task: commit,
    enabled: (ctx) => ctx.commit
  }, {
    title: 'Push to GitHub',
    task: push
  }, {
    title: 'Generate GitHub Release',
    task: github,
    enabled: (ctx) => ctx.ghrelease
  }, {
    title: 'Publish documentation',
    task: () => docs,
    enabled: (ctx) => ctx.docs
  }, {
    title: 'Publish to npm',
    task: publish,
    enabled: (ctx) => ctx.publish
  }], utils.getListrConfig())

  return releaseChecks(opts).then(validatedOpts => tasks.run(validatedOpts))
}

module.exports = release
