import assert from 'assert';
import {it, describe} from 'mocha';
import {extractTestSuites} from './extractTextFromTests.js';

describe('Extract the text from tests', () => {
  describe('GIVEN a string', () => {
    it('WHEN it is empty THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites(''), {name: '', suites: [], tests: []});
    });
    it('WHEN it contains not test THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites('var x = 1; // but no test'), {name: '', suites: [], tests: []});
    });
    describe('WHEN it contains one `describe`', () => {
      it('THEN return one test suite', () => {
        assert.strictEqual(extractTestSuites('describe("")').suites.length, 1);
      });
      it('THEN return the test suite`s name', () => {
        const suites = extractTestSuites('describe("test suite")').suites;
        assert.strictEqual(suites[0].name, 'test suite');
      });
      describe('AND one `it()` inside', () => {
        const suites = () => extractTestSuites(`
          describe("test suite", () => {
            it('test 1', () => {});
          })`);
        it('THEN return one test', () => {
          assert.strictEqual(suites().suites[0].tests.length, 1);
        });
        it('THEN return the test`s name', () => {
          assert.strictEqual(suites().suites[0].tests[0].name, 'test 1');
        });
      });
      describe('AND many `it()`s inside', () => {
        const suites = () => extractTestSuites(`
          describe("test suite", () => {
            it('test 1', () => {});
            it('test 2', () => {});
            it('test 3', () => {});
          })`);
        it('THEN return many tests', () => {
          assert.strictEqual(suites().suites[0].tests.length, 3);
        });
        it('THEN return the tests` names', () => {
          assert.strictEqual(suites().suites[0].tests[0].name, 'test 1');
          assert.strictEqual(suites().suites[0].tests[1].name, 'test 2');
          assert.strictEqual(suites().suites[0].tests[2].name, 'test 3');
        });
      });
    });
    describe('WHEN it contains multiple (not nested) `describe`s', () => {
      it('THEN return all test suite`s names', () => {
        const sourceCode = `
          describe("test suite 1");
          describe("test suite 2");
          describe("test suite 3");
        `;
        const suites = extractTestSuites(sourceCode).suites;
        assert.strictEqual(suites[0].name, 'test suite 1');
        assert.strictEqual(suites[1].name, 'test suite 2');
        assert.strictEqual(suites[2].name, 'test suite 3');
      });
      it('THEN return ONLY test suites, no other', () => {
        const sourceCode = `
          describe("test suite 1");
          not_describe("test suite 2");
        `;
        const suites = extractTestSuites(sourceCode).suites;
        assert.strictEqual(suites.length, 1);
      });
    });
    describe('WHEN it contains multiple nested `describe`s', () => {
      it('one level deep THEN return all test suite`s names', () => {
        const sourceCode = `
          describe("test suite 1", () => {
            describe("test suite 1.1");
            describe("test suite 1.2");
          });
        `;
        const suites = extractTestSuites(sourceCode).suites;
        assert.strictEqual(suites[0].name, 'test suite 1');
        assert.strictEqual(suites[0].suites[0].name, 'test suite 1.1');
        assert.strictEqual(suites[0].suites[1].name, 'test suite 1.2');
      });
      it('many levels deep THEN return all test suite`s names', () => {
        const sourceCode = `
          describe("test suite 1", () => {
            describe("test suite 2", () => {
              describe("test suite 3", () => {
                describe("test suite 4", () => {});
              });
            });
          });
        `;
        const suites = extractTestSuites(sourceCode).suites;
        assert.strictEqual(suites[0].name, 'test suite 1');
        assert.strictEqual(suites[0].suites[0].name, 'test suite 2');
        assert.strictEqual(suites[0].suites[0].suites[0].name, 'test suite 3');
        assert.strictEqual(suites[0].suites[0].suites[0].suites[0].name, 'test suite 4');
      });
      it('multiple suites on many levels THEN return all test suite`s names', () => {
        const sourceCode = `
          describe("test suite 1", () => {
            describe("test suite 1.1", () => {});
            describe("test suite 1.2", () => {});
            describe("test suite 2", () => {
              describe("test suite 2.1", () => {});
              describe("test suite 2.2", () => {});
              describe("test suite 3", () => {});
            });
          });
        `;
        const suites = extractTestSuites(sourceCode).suites;
        assert.strictEqual(suites[0].name, 'test suite 1');
        assert.strictEqual(suites[0].suites[0].name, 'test suite 1.1');
        assert.strictEqual(suites[0].suites[1].name, 'test suite 1.2');
        assert.strictEqual(suites[0].suites[2].name, 'test suite 2');
        assert.strictEqual(suites[0].suites[2].suites[0].name, 'test suite 2.1');
        assert.strictEqual(suites[0].suites[2].suites[1].name, 'test suite 2.2');
        assert.strictEqual(suites[0].suites[2].suites[2].name, 'test suite 3');
      });
    });
  });
});