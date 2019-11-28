'use strict'

const execa = require('execa')
const path = require('path')
const { hook, fromTasegir } = require('../utils')
const tsconfig = require('../config/tsconfig.js')

const DEFAULT_TIMEOUT = global.DEFAULT_TIMEOUT || 5 * 1000

function testNode (ctx) {
  let exec = 'mocha'
  const compilerOptions = tsconfig(true).compilerOptions

  const env = {
    NODE_ENV: 'test',
    TASEGIR_RUNNER: 'node',
    TS_NODE_COMPILER_OPTIONS: JSON.stringify(compilerOptions)
  }
  const timeout = ctx.timeout || DEFAULT_TIMEOUT

  let args
  if(ctx.coverage){
    exec = 'nyc'
    args = [
      `--nycrc-path='./node_modules/tasegir/src/config/.nycrc'`,
      'mocha',
      '--compilers ts-node/register',
      '--require source-map-support/register',
      '--full-trace',
    ]
  }else{
    args = [
      '--require', 'ts-node/register',
      ctx.progress && '--reporter=progress',
      '--ui', 'bdd',
      '--timeout', timeout
    ].filter(Boolean)

    if (ctx['100']) {
      args = [
        '--check-coverage',
        '--branches=100',
        '--functions=100',
        '--lines=100',
        '--statements=100',
        exec
      ].concat(args)
      exec = 'nyc'
    }
  }

  let files = [
    'test/node.ts',
    'test/**/*.spec.ts'
  ]

  if (ctx.colors) {
    args.push('--colors')
  } else {
    args.push('--no-colors')
  }

  if (ctx.grep) {
    args.push(`--grep=${ctx.grep}`)
  }

  if (ctx.files && ctx.files.length > 0) {
    files = ctx.files
  }

  if (ctx.verbose) {
    args.push('--verbose')
  }

  if (ctx.watch) {
    args.push('--watch')
  }

  if (ctx.exit) {
    args.push('--exit')
  }

  if (ctx.bail) {
    args.push('--bail')
  }

  const postHook = hook('node', 'post')
  const preHook = hook('node', 'pre')

  let err
  
  return preHook(ctx).then(() => {
    return execa(exec, args.concat(files.map((p) => path.normalize(p))), {
      env: env,
      cwd: process.cwd(),
      preferLocal: true,
      localDir: path.join(__dirname, '../..'),
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr
    }).catch((_err) => {
      err = _err
    })
  }).then(() => postHook(ctx))
    .then(() => {
      if (err) {
        throw err
      }
    })
}

module.exports = testNode
