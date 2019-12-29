# tAsEgir

[![Travis CI](https://flat.badgen.net/travis/auhau/tasegir)](https://travis-ci.com/auhau/tasegir)
[![Dependency Status](https://david-dm.org/auhau/tasegir.svg?style=flat-square)](https://david-dm.org/auhau/tasegir)
[![Managed by tAsEgir](https://img.shields.io/badge/%20managed%20by-tasegir-blue)](https://github.com/auhau/tasegir)

> Automated TypeScript project management.

*Fork of [aegir](https://github.com/ipfs/aegir) specializing on TypeScript projects. Thanks [Protocol Labs](https://protocol.ai/) for all the work!* 

**Warning: this project is still in quite active transition phase to support TypeScript. Things might break, please report them!**

## Lead Maintainer

[Adam Uhlíř](https://github.com/AuHau)

## Project Structure

The project structure when using this is quite strict, to ease replication and configuration overhead.

All source code should be placed under `src`, with the main entry point being `src/index.ts`.

All test files should be placed under `test`. Individual test files should end in `.spec.ts` and setup files for the node and the browser should be `test/node.ts` and `test/browser.ts` respectively.

Your `package.json` should have the following entries and should pass `tasegir lint-package-json`.

```json
{
  "main": "src/index.ts",
  "files": [
    "src",
    "dist",
    "lib",
    "types"
  ],
  
  "scripts": {
    "compile": "tasegir compile",
    "compile:watch": "tasegir compile -- --watch",
    "types-check": "tasegir types-check",
    "exec": "tasegir run",
    "lint": "tasegir lint",
    "release": "tasegir release",
    "build": "tasegir build",
    "test": "tasegir test",
    "test:node": "tasegir test --target node",
    "test:browser": "tasegir test --target browser"
  }
}
```

## Stack and requirement

To bring you its many benefits, `tasegir` requires

- TS written in [Standard](https://github.com/feross/standard) style enforced using [ESlint](https://eslint.org/).
- Tests written in [Mocha](https://github.com/mochajs/mocha)
- [Karma](https://github.com/karma-runner/karma) for browser tests

TypeScript is supported using [tsc](https://www.npmjs.com/package/typescript) (for compilation), [ts-node](https://www.npmjs.com/package/ts-node) (for execution)
and [babel/preset-typescript](https://www.npmjs.com/package/@babel/preset-typescript) (for browser bundling).

## Development

As TypeScript needs to be compiled to run, there are several options how to do that based on your flow.

 - It can be compiled using [`compile`](#compile) task, which produces JavaScript files in `lib` folder.
 - If you want just do an type analysis you can run [`types-check`](#types-check) task. 
 - If you want to execute some TS file, you can use [`run`](#run) task to execute specific file.

## Configuration

It is possible to overload the default configuration of most tools that `tasegir` integrates. You can do so by creating
a `.tasegir.js` file in the root of the project. It has to export an object with this schema:

```javascript
module.exports = {
  bundlesize: {}, // bundleSize config
  webpack: {}, // webpack.config.js content
  karma: {}, // karma.conf.js content
  hooks: {}, // See Tests -> Hooks
  lint: {
    files: [] // Globby list of paths to lint
  },
  depCheck: {
    files: [], // Globby list of paths to check allowing overriding the default setting
    ignore: [] // Array of modules to ignore, '*' is supported for globbing. Overrides the default setting.
  },
  tsconfig: {}, // Place for tsconfig.json configuration, only compilerOptions are used though.
  entry: utils.fromRoot('src', 'index.ts'), // Entry point 
}
``` 

## IDE support

If you use an IDE that has support for the tools used, you can point your IDE towards the proper configuration files.

 - `./node_modules/tasegir/src/config/eslintrc.js` for ESlint
 - `./node_modules/tasegir/src/config/tsconfig.json` for TypeScript

## Tasks

### Compile

Compile task will compile all TypeScript files in `/src` folder into `/lib` folder. It performs type checking as well.

You can watch for changes passing `--watch` flag like: `tasegir compile -- --watch`.

### Run

If you need to run just specific file (for example web server/CLI command) you can use the `tasegir run <file> [args...]` task.
It is executed using [ts-node](https://www.npmjs.com/package/ts-node)

This task also support `--watch` parameter (`tasegir run --watch <file> [args...]`) which will automatically reload
modified files. It uses [ts-node-dev](https://github.com/whitecolor/ts-node-dev) package for it.

If you need to debug some script you can use node's `--inspect` and `--inspect-brk` flags.

### Linting

Linting happens in three phases:
  - Linting of package.json using [npm-package-json-lint](https://www.npmjs.com/package/npm-package-json-lint)
  - Checking version number of all dependencies (normal, dev, peer, optional and bundled)
  - Code linting

Code linting uses [eslint](http://eslint.org/), [standard](https://github.com/feross/standard), [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin)
with [some custom rules](https://github.com/auhau/tasegir/tree/master/src/config/eslintrc.js) to enforce some more strictness.

You can run it using

```bash
$ tasegir lint
$ tasegir lint-package-json
```
### Types check

When you want to perform just a type check without TypeScript compilation you can run `tasegir types-check`. This step is also part of the CI pipeline.

### Dependency check

Dependency check parses code and check if all dependencies used in code are declared in `package.json` and also vice versa
if all dependencies declared in `package.json` are actually used in the code.

It is quite common to have dependencies that are not used directly in the code in such a case use the [`tasegir`'s config
file](#configuration) capabilities to ignore out these modules.

### Testing

You can run it using

```bash
$ tasegir test
```

There are also browser and node specific tasks

```bash
$ tasegir test --target node
$ tasegir test --target browser
$ tasegir test --target webworker
```

#### Hooks

You can specify hooks that are run before/after the tests. Definition of the hooks is done using [Configuration](#configuration) and the `hooks` property.
It has following syntax:

```javascript
module.exports = {
  hooks: {
    node: {
      pre: () => {},
      post: () => {},
    },
    browser: {
      pre: () => {},
      post: () => {},
    },
  }
}
```

#### Fixtures

Loading fixture files in node and the browser can be painful, that's why tasegir provides
a method to do this. For it to work you have to put your fixtures in the folder `test/fixtures`, and then

```js
// test/awesome.spec.js
const loadFixture = require('tasegir/fixtures')

const myFixture = loadFixture('test/fixtures/largefixture')
```

The path to the fixture is relative to the module root.

If you write a module
which is to be consumed by other modules tests you need to pass in a third parameter such that
the server is able to serve the correct files.

For example

```js
// awesome-tests module
const loadFixture = require('tasegir/fixtures')

const myFixture = loadFixture('test/fixtures/coolfixture', 'awesome-tests')
```


```js
// tests for module using the awesome-tests
require('awesome-tests')
```

```js
// .tasegir.js file in the module using the awesome-tests module
'use strict'

module.exports = {
  karma: {
    files: [{
      pattern: 'node_modules/awesome-tests/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }]
  }
}
```

#### Coverage

The tests are automatically ran with test coverage support and basic text reporting. If you don't want to ran
tests with test coverage you can pass `--no-coverage` flag to the `tasegir test` command. The coverage is currently supported
only on `node` target.

If you want to specify some other `nyc` reporter to be used use `--reporter` flag.

```bash
$ tasegir test -t node --reporter html && open coverage/index.html
```

To auto publish coverage reports from Travis to Codecov use this in
your `.travis.yml` file.

```yml

script: npx tasegir test -t node --reporter lcovonly -- --bail
after_success: npx codecov
```

### Building

You can run it using

```bash
$ tasegir build
```
This will build a browser ready version into `dist`, so after publishing the results will be available under

```
https://unpkg.com/<module-name>/dist/index.js
https://unpkg.com/<module-name>/dist/index.min.js
```

**Specifying a custom entry file for Webpack**

By default, `tasegir` uses `src/index.js` as the entry file for Webpack. If you want to modify this value use `entry` field in `tasegir` configuration as mentioned in [Configuration](#configuration):

```javascript
module.exports = {
  entry: "src/browser-index.js",
}
```

Webpack will use the specified file as the entry point and output it to `dist/<filename>`, eg. `dist/browser-index.js`.


#### Generating Webpack stats.json

Pass the `--analyze` option to have Webpack generate a `stats.json` file for the bundle and save it in the project root (see https://webpack.js.org/api/stats/). e.g.

```bash
tasegir build --analyze
```

### Releasing

1. Run linting
2. Run tests
3. Build everything
4. Compile everything in `/src` to `/lib`
4. Bump the version in `package.json`
5. Generate a changelog based on the git log
6. Commit the version change & `CHANGELOG.md`
7. Create a git tag
8. Run `git push` to `origin/master`
9. Publish a release to Github releases
10. Generate documentation and push to github
11. Publish to npm

```bash
# Major release
$ tasegir release --type major
# Minor relase
$ tasegir release --type minor
# Patch release
$ tasegir release

# Major prerelease (1.0.0 -> 2.0.0-rc.0)
$ tasegir release --type premajor --preid rc --dist-tag next
# Minor prerelease (1.0.0 -> 1.1.0-rc.0)
$ tasegir release --type preminor --preid rc --dist-tag next
# Patch prerelease (1.0.0 -> 1.0.1-rc.0)
$ tasegir release --type prepatch --preid rc --dist-tag next

# Increment prerelease (1.1.0-rc.0 -> 1.1.0-rc.1)
$ tasegir release --type prerelease --preid rc --dist-tag next
```

> This requires `TASEGIR_GHTOKEN` to be set.

You can also specify the same targets as for `test`.

If no `CHANGELOG.md` is present, one is generated the first time a release is done.

You can skip all changelog generation and the github release by passing
in `--no-changelog`.

If you want no documentation generation you can pass `--no-docs` to the release task to disable documentation builds.

#### Scoped Github Token

Performing a release involves creating new commits and tags and then pushing them back to the repository you are releasing from. In order to do this you should create a [GitHub personal access token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) and store it in the environmental variable `TASEGIR_GHTOKEN`.   

The only access scope it needs is `public_repo`.

Be aware that by storing it in `~/.profile` or similar you will make it available to any program that runs on your computer.

### Documentation

You can use `tasegir docs` to generate documentation. This uses [documentation.js](http://documentation.js.org/) with the theme [clean-documentation-theme](https://github.com/dignifiedquire/clean-documentation-theme).

To publish the documentation automatically to the `gh-pages` branch you can run

```bash
$ tasegir docs --publish
```

## Add CI to your repo
  
### Activate Travis
Create a file named .travis.yml with the following content:

```yaml
language: node_js
cache: npm
stages:
  - check
  - test
  - cov

node_js:
  - '12'
  - '10'

os:
  - linux
  - osx
  - windows

script: npx tasegir test -t node --reporter lcovonly -- --bail
after_success: npx codecov

jobs:
  include:
    - stage: check
      script:
        - npx tasegir commitlint --travis
        - npx tasegir dep-check
        - npm run lint

    - stage: test
      name: chrome
      addons:
        chrome: stable
      script: npx tasegir test -t browser -t webworker

    - stage: test
      name: firefox
      addons:
        firefox: latest
      script: npx tasegir test -t browser -t webworker -- --browsers FirefoxHeadless
    
    - stage: test
      name: electron-main
      os: osx
      script:
        - npx tasegir test -t electron-main --bail
    
    - stage: test
      name: electron-renderer
      os: osx
      script:
        - npx tasegir test -t electron-renderer --bail

notifications:
  email: false

```
To add a CI badge to your README use :

```markdown
[![Travis CI](https://flat.badgen.net/travis/<path_to_your_repo>)](https://travis-ci.com/<path_to_your_repo>)
```

#### Commit linting

Travis does commit linting prior any tests run. The commit's schema is based on [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
and [commitlint](https://github.com/conventional-changelog/commitlint) implementation.

The support commit types are: *build, chore, ci, docs, feat, fix, improvement, perf, refactor, revert, style, test*

### Troubleshooting Windows jobs

#### Caches timeout   

If you get something like this 
<img width="1082" alt="screenshot 2019-02-12 at 12 52 10" src="https://user-images.githubusercontent.com/314190/52636718-4f934f80-2ec5-11e9-9b8d-2d368ec4cf4a.png">
Clean the caches for that repo/branch and restart.

#### Secrets problem

<img width="1062" alt="screenshot 2019-02-13 at 16 08 22" src="https://user-images.githubusercontent.com/314190/52725701-9eb2b080-2fa9-11e9-9508-2bd00ad31062.png">

If your build stops in the  `nvs add 10` step you probably have secrets (ENV vars) in your Travis config and Windows doesn't work with secrets. You must delete all the secrets to make it works.

<img width="1082" alt="screenshot 2019-02-13 at 16 06 56" src="https://user-images.githubusercontent.com/314190/52725628-7f1b8800-2fa9-11e9-995a-39341a3c7785.png">

#### Allow failure on windows
add the following 
```yaml
matrix:
  fast_finish: true
  allow_failures:
    - os: windows
```
before this line https://github.com/libp2p/js-libp2p/blob/master/.travis.yml#L14

## License

MIT
