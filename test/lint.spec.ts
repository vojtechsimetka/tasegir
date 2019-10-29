/* eslint-env mocha */
import del from 'del'
import series from 'async/series'
import lint from '../src/lint'
import { expect } from 'chai'
import path from 'path'
import fs from 'fs'

const TEMP_FOLDER = path.join(__dirname, '../node_modules/.temp-test')
const setupProjectWithDeps = (deps) => {
  const tmpDir = path.join(TEMP_FOLDER, `test-${Math.random()}`)

  return new Promise((resolve, reject) => {
    series([
      (cb) => fs.mkdir(tmpDir, cb),
      (cb) => fs.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify({
        name: 'my-project',
        dependencies: deps
      }), cb)
    ], (error) => {
      if (error) {
        return reject(error)
      }

      process.chdir(tmpDir)

      resolve()
    })
  })
}
const dependenciesShouldPassLinting = (deps) => {
  return setupProjectWithDeps(deps)
    .then(() => lint())
}

const dependenciesShouldFailLinting = (deps) => {
  return setupProjectWithDeps(deps)
    .then(() => lint())
    .then(() => {
      throw new Error('Should have failed!')
    })
    .catch(error => {
      expect(error.message).to.contain('Dependency version errors')
    })
}

describe('lint', () => {
  const cwd = process.cwd()
  before(() => {
    fs.mkdirSync(TEMP_FOLDER, { recursive: true })
  })

  after(() => {
    process.chdir(cwd)
    del(TEMP_FOLDER)
  })

  it.skip('lint itself (tasegir)', function () {
    this.timeout(20 * 1000) // slow ci is slow
    return lint({ fix: false })
  })

  it('succeeds when package.json contains dependencies with good versions', function () {
    return dependenciesShouldPassLinting({
      'some-unstable-dep': '~0.0.1',
      'some-dev-dep': '^0.1.0',
      'some-other-dev-dep': '~0.1.0',
      'some-stable-dep': '^1.0.0',
      'some-pinned-dep': '1.0.0'
    })
  })

  it('fails when package.json contains dependencies with carets for unstable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '^0.0.1'
    })
  })

  it('fails when package.json contains dependencies with <= for unstable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '<=0.0.1'
    })
  })

  it('fails when package.json contains dependencies with > for unstable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '>0.0.1'
    })
  })

  it('fails when package.json contains dependencies with < for unstable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '<0.0.1'
    })
  })

  it('fails when package.json contains dependencies with >= for unstable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '>=0.0.1'
    })
  })

  it('fails when package.json contains dependencies with <= for development deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '<=0.1.0'
    })
  })

  it('fails when package.json contains dependencies with > for development deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '>0.1.0'
    })
  })

  it('fails when package.json contains dependencies with < for development deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '<0.1.0'
    })
  })

  it('fails when package.json contains dependencies with >= for development deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '>=0.1.0'
    })
  })

  it('fails when package.json contains dependencies with tildes for stable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '~1.0.0'
    })
  })

  it('fails when package.json contains dependencies with > for stable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '>1.0.0'
    })
  })

  it('fails when package.json contains dependencies with < for stable deps', function () {
    return dependenciesShouldFailLinting({
      'some-dep': '<1.0.0'
    })
  })

  it('should pass in user defined path globs', () => {
    return setupProjectWithDeps([])
      .then(() => {
        // Directory not included in the default globs
        const dir = `test-${Date.now()}`

        fs.mkdirSync(dir)
        fs.writeFileSync(`${dir}/test.js`, '\'use strict\'\n\nmodule.exports = {}\n')
        fs.writeFileSync(
          '.tasegir.js',
          `module.exports = { lint: { files: ['${dir}/*.ts'] } }`
        )
      })
      .then(() => lint())
  })

  it.skip('should fail in user defined path globs', () => {
    return setupProjectWithDeps([])
      .then(() => {
        // Directory not included in the default globs
        const dir = `test-${Date.now()}`

        fs.mkdirSync(dir)
        fs.writeFileSync(`${dir}/test.js`, '() .> {')
        fs.writeFileSync(
          '.tasegir.js',
          `module.exports = { lint: { files: ['${dir}/*.ts'] } }`
        )
      })
      .then(() => lint())
      .then(() => { throw new Error('Should have failed!') })
      .catch(error => expect(error.message).to.contain('Lint errors'))
  })
})
