import {extractTextFromFile} from './extractTextFromFile.js';
import {stats} from './stats.js';

/**
 * @param {Test[]} tests
 * @param {number} depth
 */
const printTests = (tests, depth) => {
  const prefix = new Array(depth).fill('  ').join('');
  tests.forEach(test => console.log(prefix + test.name));
};
/**
 * @param {Suite} all
 * @param {number} depth
 */
const printTestSuites = (all, depth = 0) => {
  const {suites} = all;
  const prefix = new Array(depth).fill('  ').join('');
  suites.forEach(suite => {
    console.log(prefix + suite.name);
    printTests(suite.tests, depth + 1);
    suite.suites ? printTestSuites(suite, depth + 1) : null;
  });
};
/**
 * @param {Stats} stats
 */
const printStats = (stats) => {
  console.log("\nStatistics\n-----------");
  console.log(JSON.stringify(stats, null, 4));
};
const allCommandLineArgs = process.argv;
const indexWhereFileNamesStart = allCommandLineArgs.findIndex(arg => arg === __filename) + 1;
const filenames = allCommandLineArgs.slice(indexWhereFileNamesStart);

import {groupSuites} from './groupSuites.js';

/**
 * @param {Filename[]} filenames
 * @returns {Promise<void>}
 */
const printAllFilesSuites  = async (filenames) => {
  let rootSuite;
  const readAll = filenames.map(extractTextFromFile);
  try {
    rootSuite = groupSuites(await Promise.all(readAll));
  } catch(e) {
    console.log(`ERROR reading file, error was: ${e}`);
    return;
  }
  printTestSuites(rootSuite);
  printStats(stats(rootSuite));
};

printAllFilesSuites(filenames);