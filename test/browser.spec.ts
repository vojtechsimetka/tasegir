/* eslint-env mocha */

import loadFixture from '../fixtures'
import { expect } from 'chai'

describe('browser', () => {
  it('fixtures', () => {
    const myFixture = loadFixture('test/fixtures/test.txt')
    expect(myFixture.toString()).to.be.eql('Hello Fixture\n')
  })

  it('non existing fixtures', () => {
    expect(() => loadFixture('test/fixtures/asdalkdjaskldjatest.txt'))
      .to.throw()
  })
})
