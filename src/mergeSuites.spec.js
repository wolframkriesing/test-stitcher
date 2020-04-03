import * as assert from 'assert';
import {it, describe} from 'mocha';
import {Suite} from './Suite.js';

/**
 * @param {Suite} suite1
 * @param {Suite} suite2
 * @returns {Suite}
 */
const mergeSuites = (suite1, suite2) => Suite.empty();

describe('Merge two test suites', () => {
  it('GIVEN two suites WHEN both contain no items THEN return empty suite', () => {
    const emptySuite = Suite.empty();
    const mergedSuite = mergeSuites(emptySuite, emptySuite);
    assert.ok(Suite.isEmpty(mergedSuite))
  });
});