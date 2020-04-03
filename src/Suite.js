export const Suite = {
  /**
   * @returns {Suite}
   */
  empty: () => ({name: '', suites: [], tests: []}),

  /**
   * @param {Suite} suite
   * @returns {boolean}
   */
  isEmpty: (suite) => {
    return suite.name === '' && suite.suites.length === 0 && suite.tests.length === 0;
    ;
  }
};
