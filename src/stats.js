/**
 * @param {import("./stats").Suite[]} suites
 * @returns {number}
 */
const countSuites = (suites) => {
  /**
   * @param {number} count
   * @param {import("./stats").Suite} suite
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
 * @param {import("./stats").Suite[]} suites
 * @returns {number}
 */
const countTestsInSuites = (suites) =>
  suites.reduce(
      /**
       * @param {number} count
       * @param {import("./stats").Suite} suite
       * @returns {number}
       */  
    (count, suite) => {
      const countInChildSuites = countTestsInSuites(suite.suites);
      return count + suite.tests.length + countInChildSuites;
    }, 0
  );
/**
 * @param {import("./stats").Suite} all
 * @returns {number}
 */
const countTests = (all) => countTestsInSuites(all.suites) + all.tests.length;
/**
 * @param {import("./stats").Suite} all
 * @returns {import("./stats").Stats}
 */
export const stats = (all) => {
  const {suites} = all;
  const testsCount = countTests(all);
  const suitesCount = countSuites(suites);
  return {counts: {tests: testsCount, suites: suitesCount}};
};
