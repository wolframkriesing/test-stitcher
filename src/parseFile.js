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
  console.log(`Number of suites: ${stats.counts.suites}`);
  console.log(`Number of tests : ${stats.counts.tests}`);
};

import clipp from 'clipp';
const {strayparams: filenames, flags = []} = clipp.parse();
const asJson = flags.includes('json');

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
  if (asJson) {
    console.log(JSON.stringify({suites: rootSuite.suites, stats: stats(rootSuite)}));
  } else {
    printTestSuites(rootSuite);
    printStats(stats(rootSuite));
  }
};

printAllFilesSuites(filenames);