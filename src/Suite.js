/**
 * @returns {Suite}
 */
export const emptySuite = () => ({name: '', suites: [], tests: [], origin: ''});

/**
 * @param {string} name
 * @returns {Suite}
 */
export const createNewSuite = name => {
  const suite = emptySuite();
  suite.name = name;
  return suite;
};

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
export const cloneSuiteAndNameIt = (suite) => {
  const clone = cloneSuite(suite);
  clone.name = suite.origin;
  return clone;
}

/**
 * @param {string} name
 * @returns {Suite}
 */
export const createNewSuiteAndSetOrigin = name => {
  const suite = createNewSuite(name);
  suite.origin = name;
  return suite;
};
