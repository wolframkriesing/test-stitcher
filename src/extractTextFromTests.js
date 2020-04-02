import * as ts from 'typescript';

/**
 * @param {string} sourceCode
 * @returns {Suite}
 */
const parseTestsOutOfSourceCode = (sourceCode) => {
  const sourceFile = ts.createSourceFile(
      "fileName",
      sourceCode,
      ts.ScriptTarget.ES2020,
      true
    );
  return allSuites(sourceFile);
};
/**
 * @param {ts.SourceFile} sourceFile
 * @returns {Suite}
 */
const allSuites = (sourceFile) => {
  const suites = {name: '', suites: [], tests: []};
  /**
   * @param {ts.Node} node
   * @param {Suite} parentSuite
   */
  const searchDescendants = (node, parentSuite) => {
    const children = node.getChildren(sourceFile);
    for (const child of children) {
      if (ts.isCallLikeExpression(child)) {
        const functionName = child.expression.escapedText;
        if (functionName === 'describe') {
          const newSuite = {name: child['arguments'][0].text, suites: [], tests: []};
          parentSuite.suites.push(newSuite);
          searchDescendants(child, newSuite);
        } else if (functionName === 'it') {
          const newTest = {name: child['arguments'][0].text};
          parentSuite.tests.push(newTest);
        }
      } else {
        searchDescendants(child, parentSuite);
      }
    }
  };
  searchDescendants(sourceFile, suites);
  return suites;
};

export const extractTestSuites = parseTestsOutOfSourceCode;
