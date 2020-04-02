/**
 * @param {Suite[]} suites
 * @returns {number}
 */
const countSuites = (suites) => {
  /**
   * @param {number} count
   * @param {Suite} suite
   * @returns {number}
   */
  const reducer = (count, suite) => {
    const childSuites = suite.suites ? suite.suites : [];
    return count + countSuites(childSuites);
  };
  const childrenCount = suites.reduce(reducer, 0);
  return childrenCount + suites.length;
};
/**
 * @param {Suite[]} suites
 * @returns {number}
 */
const countTestsInSuites = (suites) => {
  /**
   * @param {number} count
   * @param {Suite} suite
   * @returns {number}
   */
  const reducer = (count, suite) => {
    const countInChildSuites = countTestsInSuites(suite.suites);
    return count + suite.tests.length + countInChildSuites;
  }
  return suites.reduce(reducer, 0);
}
/**
 * @param {Suite} all
 * @returns {number}
 */
const countTests = (all) => countTestsInSuites(all.suites) + all.tests.length;
/**
 * @param {Suite} all
 * @returns {Stats}
 */
export const stats = (all) => {
  const {suites} = all;
  const testsCount = countTests(all);
  const suitesCount = countSuites(suites);
  return {counts: {tests: testsCount, suites: suitesCount}};
};
