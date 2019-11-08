'use strict'

module.exports = {
  extends: [
    'standard',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    mocha: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  plugins: [
    'no-only-tests'
  ],
  rules: {
    'array-bracket-newline': ['error', { 'multiline': true }],
    strict: [2, 'safe'],
    curly: 'error',
    'block-scoped-var': 2,
    complexity: 1,
    'default-case': 2,
    'dot-notation': 1,
    'guard-for-in': 1,
    'linebreak-style': [1, 'unix'],
    'no-alert': 2,
    'no-case-declarations': 2,
    'no-console': 2,
    'no-constant-condition': 2,
    'no-continue': 1,
    'no-div-regex': 2,
    'no-empty': 1,
    'no-empty-pattern': 2,
    'no-extra-semi': 2,
    'no-implicit-coercion': 2,
    'no-labels': 2,
    'no-loop-func': 2,
    'no-nested-ternary': 1,
    'no-only-tests/no-only-tests': 2,
    'no-script-url': 2,
    'no-warning-comments': 1,
    'quote-props': [2, 'as-needed'],
    'require-yield': 2,
    'max-nested-callbacks': [2, 4],
    'max-depth': [2, 4],
    'require-await': 2,
    'padding-line-between-statements': [
      'error',
      { 'blankLine': 'always', 'prev': '*', 'next': 'if' },
      { 'blankLine': 'always', 'prev': '*', 'next': 'function' },
    ],
    'no-useless-constructor': 'off',
    'no-dupe-class-members': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/member-delimiter-style': ['error', {
      'multiline': {
        'delimiter': 'none',
        'requireLast': true
      },
      'singleline': {
        'delimiter': 'comma',
        'requireLast': false
      }
    }]
  }
}
