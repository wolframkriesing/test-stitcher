import * as assert from 'assert';
import {it, describe} from 'mocha';

/**
 * @param {Suite} suite
 * @returns {Suite}
 */
const cloneSuite = (suite) => {
  const clone = {...suite};
  return clone;
};

/**
 * @param {Suite[]} suites
 * @returns {Suite}
 */
const groupSuites = (suites) => {
  const suite = cloneSuite(suites[0]);
  if (!suite.name) {
    suite.name = suite.origin;
  }
  return suite;
};

describe('Group test suites from multiple files and produce one containing them all', () => {
  describe('GIVEN every file has a relative path (e.g. src/file1 and src/file2)', () => {
    describe('WHEN given one file AND the suite has NO name ', () => {
      const suite = {name: '', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite with filename as suite name', () => {
        const groupedSuite = groupSuites([suite]);
        assert.strictEqual(groupedSuite.name, suite.origin);
        assert.deepStrictEqual(groupedSuite.suites, suite.suites);
        assert.deepStrictEqual(groupedSuite.tests, suite.tests);
        assert.strictEqual(groupedSuite.origin, suite.origin);
      });
      it('THEN the suite must be cloned', () => {
        const groupedSuite = groupSuites([suite]);
        assert.notStrictEqual(groupedSuite, suite);
      });
    });
    describe('WHEN given one file AND the suite has a name ', () => {
      const suite = {name: 'Existing name', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite with original suite name', () => {
        const groupedSuite = groupSuites([suite]);
        assert.deepStrictEqual(groupedSuite, suite);
      });
    });
  });
});