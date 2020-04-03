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
 * @param {Suite} suite
 * @returns {Suite}
 */
const cloneSuiteAndNameIt = (suite) => {
  const clone = cloneSuite(suite);
  clone.name = suite.origin;
  return clone;
}

/**
 * @param {Suite[]} suites
 * @returns {Suite}
 */
const groupSuites = (suites) => {
  return {
    name: 'root', 
    suites: suites.map(cloneSuiteAndNameIt), 
    tests: [], 
    origin: ''
  };
};

describe('Group test suites from multiple files and produce one containing them all', () => {
  describe('GIVEN every file has a relative path (e.g. src/file1 and src/file2)', () => {
    describe('WHEN given one suite of one file', () => {
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
    describe('WHEN given suites of two files', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'file2.js'};
      it('THEN return the suites with filename as suite name', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(groupedSuite.suites[0].name, suite1.origin);
        assert.deepStrictEqual(groupedSuite.suites[1].name, suite2.origin);
      });
    });
    xdescribe('WHEN multiple suites are in one sub-directory', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dir1/file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dir1/file2.js'};
      it('THEN create a child-suite named like the directory', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(groupedSuite.suites[0].name, 'dir1');
      });
      it('AND the suites underneath', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        const childSuite = groupedSuite.suites[0];
        assert.deepStrictEqual(childSuite.suites[0].name, 'file1.js');
        assert.deepStrictEqual(childSuite.suites[1].name, 'file2.js');
      });
    });
  });
});