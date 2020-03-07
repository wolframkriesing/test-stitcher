import assert from 'assert';
import {it, describe} from 'mocha';
import * as ts from 'typescript';

const parseTestsOutOfSourceCode = (sourceCode) => {
  const sourceFile = ts.createSourceFile(
      "fileName",
      sourceCode,
      ts.ScriptTarget.ES2020,
      true
    );
  return allTests(sourceFile);
};

const allTests = (sourceFile) => {
  const nodes = [];
  const childNodes = node => {
    const nodes = [];
    node.forEachChild(child => {
        nodes.push(child);
        return undefined;
    });
    return nodes;
  };
  let depth = 0;
  const searchDescendants = node => {
    const children = childNodes(node);
    depth++;
    for (const child of children) {
      if (ts.isCallLikeExpression(child)) {
        nodes.push({name: child.arguments[0].text});
      }
      searchDescendants(child);
    }
  };
  searchDescendants(sourceFile);
  return nodes;
};

const extractTestSuites = sourceCode => {
  return parseTestsOutOfSourceCode(sourceCode);
};

describe('Extract the text from tests', () => {
  describe('GIVEN a string', () => {
    it('WHEN it is empty THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites(''), []);
    });
    it('WHEN it contains not test THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites('var x = 1; // but no test'), []);
    });
    describe('WHEN it contains one `describe`', () => {
      it('THEN return one test suite', () => {
        assert.strictEqual(extractTestSuites('describe("")').length, 1);
      });
      it('THEN return the test suite`s name', () => {
        const suites = extractTestSuites('describe("test suite")');
        assert.strictEqual(suites[0].name, 'test suite');
      });
    });
    describe('WHEN it contains multiple (not nested) `describe`s', () => {
      it('THEN return all test suite`s names', () => {
        const sourceCode = `
          describe("test suite 1");
          describe("test suite 2");
          describe("test suite 3");
        `;
        const suites = extractTestSuites(sourceCode);
        assert.strictEqual(suites[0].name, 'test suite 1');
        assert.strictEqual(suites[1].name, 'test suite 2');
        assert.strictEqual(suites[2].name, 'test suite 3');
      });
    });
  });
});