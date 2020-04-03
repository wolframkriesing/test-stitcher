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
  return {name: 'root', suites: [suite], tests: [], origin: ''};
};

describe('Group test suites from multiple files and produce one containing them all', () => {
  describe('GIVEN every file has a relative path (e.g. src/file1 and src/file2)', () => {
    describe('WHEN given one file AND the suite has NO name ', () => {
      const suite = {name: '', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite as child-suite, with the name "root"', () => {
        const groupedSuite = groupSuites([suite]);
        assert.strictEqual(groupedSuite.name, 'root');
        assert.strictEqual(groupedSuite.suites.length, 1);
      });
      it('AND return the grouped suite with filename as suite name', () => {
        const groupedSuite = groupSuites([suite]);
        const childSuite = groupedSuite.suites[0];
        assert.strictEqual(childSuite.name, suite.origin);
        assert.deepStrictEqual(childSuite.suites, suite.suites);
        assert.deepStrictEqual(childSuite.tests, suite.tests);
        assert.strictEqual(childSuite.origin, suite.origin);
      });
      it('AND the suite must be cloned', () => {
        const groupedSuite = groupSuites([suite]);
        assert.notStrictEqual(groupedSuite.suites[0], suite);
      });
    });
    describe('WHEN given one file AND the suite has a name ', () => {
      const suite = {name: 'Existing name', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite as child-suite with original suite name', () => {
        const groupedSuite = groupSuites([suite]);
        const childSuite = groupedSuite.suites[0];
        assert.deepStrictEqual(childSuite, suite);
      });
    });
  });
});