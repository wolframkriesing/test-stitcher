import * as ts from 'typescript';

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
      if (ts.isCallExpression(child)) {
        const functionName = child.expression.getText();
        if (functionName === 'describe') {
          const firstArgument = child.arguments[0];
          if (ts.isStringLiteral(firstArgument)) {
            const newSuite = {name: firstArgument.text, suites: [], tests: []};
            parentSuite.suites.push(newSuite);
            searchDescendants(child, newSuite);
          }
        } else if (functionName === 'it') {
          const firstArgument = child.arguments[0];
          if (ts.isStringLiteral(firstArgument)) {
            const newTest = {name: firstArgument.text};
            parentSuite.tests.push(newTest);
          }
        }
      } else {
        searchDescendants(child, parentSuite);
      }
    }
  };
  searchDescendants(sourceFile, suites);
  return suites;
};

/**
 * @param {string} sourceCode
 * @returns {Suite}
 */
export const extractTestSuites = (sourceCode) => {
  const sourceFile = ts.createSourceFile(
      "fileName",
      sourceCode,
      ts.ScriptTarget.ES2020,
      true
    );
  return allSuites(sourceFile);
};
