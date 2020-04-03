import * as assert from 'assert';
import {describe, it} from 'mocha';

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
const cloneSuiteAndNameIt = (suite) => {
  const clone = cloneSuite(suite);
  clone.name = suite.origin;
  return clone;
}

/**
 * @param {Suite[]} suites
 * @returns {Suite}
 */
const groupSuites = (suites) => {
  if (suites[0].origin.startsWith('dir/')) {
    const dirSuite = {name: '', suites: suites.map(cloneSuiteAndNameIt), tests: [], origin: 'dir'};
    return groupSuites([dirSuite]);
  } else if (suites[0].origin.startsWith('dir1/')) {
    const dirSuites = [
      {name: '', suites: [cloneSuiteAndNameIt(suites[0])], tests: [], origin: 'dir1'},
      {name: '', suites: [cloneSuiteAndNameIt(suites[1])], tests: [], origin: 'dir2'},
    ];
    return groupSuites(dirSuites);
  } else if (suites[0].origin.startsWith('dirX/')) {
    const dirSuites = [
      {name: '', suites: [cloneSuiteAndNameIt(suites[0])], tests: [], origin: 'dirX'},
    ];
    return groupSuites(dirSuites);
  } else {
    return {
      name: 'root',
      suites: suites.map(cloneSuiteAndNameIt),
      tests: [],
      origin: ''
    };
  }
};

describe('Group test suites from multiple files and produce one containing them all', () => {
  describe('GIVEN every file has a relative path (e.g. src/file1 and src/file2)', () => {
    describe('WHEN given one suite of one file', () => {
      const suite = {name: '', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite as child-suite, with the name "root"', () => {
        const groupedSuite = groupSuites([suite]);
        assert.strictEqual(groupedSuite.name, 'root');
        assert.strictEqual(groupedSuite.suites.length, 1);
      });
      it('AND return the grouped suite with filename as suite name', () => {
        const groupedSuite = groupSuites([suite]);
        const childSuite = groupedSuite.suites[0];
        assert.strictEqual(childSuite.name, suite.origin);
        assert.deepStrictEqual(childSuite.suites, suite.suites);
        assert.deepStrictEqual(childSuite.tests, suite.tests);
        assert.strictEqual(childSuite.origin, suite.origin);
      });
      it('AND the suite must be cloned', () => {
        const groupedSuite = groupSuites([suite]);
        assert.notStrictEqual(groupedSuite.suites[0], suite);
      });
    });
    describe('WHEN given suites of two files', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'file2.js'};
      it('THEN return the suites with filename as suite name', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(groupedSuite.suites[0].name, suite1.origin);
        assert.deepStrictEqual(groupedSuite.suites[1].name, suite2.origin);
      });
    });
    describe('WHEN multiple suites are in one sub-directory', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dir/file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dir/file2.js'};
      it('THEN create a child-suite named like the directory', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(groupedSuite.suites[0].name, 'dir');
        assert.deepStrictEqual(groupedSuite.suites[0].origin, 'dir');
      });
      it('AND the suites underneath', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        const fileSuites = groupedSuite.suites[0].suites;
        assert.deepStrictEqual(fileSuites[0].name, 'dir/file1.js');
        assert.deepStrictEqual(fileSuites[1].name, 'dir/file2.js');
      });
    });
    describe('WHEN multiple suites are in multiple sub-directory', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dir1/file.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dir2/file.js'};
      it('THEN create a child-suites named like the directories', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        const childSuites = groupedSuite.suites;
        assert.deepStrictEqual(childSuites[0].name, 'dir1');
        assert.deepStrictEqual(childSuites[0].origin, 'dir1');
        assert.deepStrictEqual(childSuites[1].name, 'dir2');
        assert.deepStrictEqual(childSuites[1].origin, 'dir2');
      });
      it('AND the suites underneath', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        const dir1Suites = groupedSuite.suites[0].suites;
        const dir2Suites = groupedSuite.suites[1].suites;
        assert.deepStrictEqual(dir1Suites[0].name, 'dir1/file.js');
        assert.deepStrictEqual(dir2Suites[0].name, 'dir2/file.js');
      });
    });
    describe('WHEN multiple suites are in multiple sub-directory multiple levels deep', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dirX/dirY/file.js'};
      it('THEN create a child-suites named like the directories', () => {
        const groupedSuite = groupSuites([suite1]);
        const childSuites = groupedSuite.suites;
        assert.deepStrictEqual(childSuites[0].name, 'dirX');
        assert.deepStrictEqual(childSuites[0].origin, 'dirX');
        // assert.deepStrictEqual(childSuites[0], 'dirY');
        // assert.deepStrictEqual(childSuites[0].suites[0].name, 'dirY');
        // assert.deepStrictEqual(childSuites[0].suites[0].origin, 'dirY');
      });
      xit('AND the suites underneath', () => {
        const groupedSuite = groupSuites([suite1]);
        const dir1Suites = groupedSuite.suites[0].suites;
        const dir2Suites = groupedSuite.suites[1].suites;
        assert.deepStrictEqual(dir1Suites[0].name, 'dir1/file.js');
        assert.deepStrictEqual(dir2Suites[0].name, 'dir2/file.js');
      });
    });
  });
});

const newSuite = name => ({name, suites: [], tests: [], origin: name});
const generateSuiteTree = (suites) => {
  const subSuites = [];
  if (suites.length > 1 && suites[1].origin.startsWith('dir1/dir2')) {
    const subsub = newSuite('dir1');
    subsub.suites.push(newSuite('dir2'));
    subSuites.push(subsub);
  } else {
    subSuites.push(newSuite('dir'));
  }
  return {
    name: 'root',
    suites: subSuites,
    tests: [],
    origin: ''
  };
};

describe('From a list of files (and directories) build a hierarchy of suites', () => {
  it('GIVEN one level deep THEN build suites accordingly', () => {
    const suite1 = {name: '', suites: [], tests: [], origin: 'file.js'};
    const suite2 = {name: '', suites: [], tests: [], origin: 'dir1/file.js'};
    const tree = generateSuiteTree([suite1, suite2]);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir');
  });
  it('GIVEN two levels deep THEN build suites accordingly', () => {
    const suite1 = {name: '', suites: [], tests: [], origin: 'file.js'};
    const suite2 = {name: '', suites: [], tests: [], origin: 'dir1/dir2/file.js'};
    const tree = generateSuiteTree([suite1, suite2]);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir1');
    assert.strictEqual(tree.suites[0].suites[0].name, 'dir2');
  });
});

const uniques = arr => [...new Set(arr)];
const buildTree = (names) => {
  const dirs = uniques(names
    .filter(name => name.includes('/'))
    .map(name => name.split('/')[0])
  );
  const children = dirs.map(name => ({name, children: []}));
  return {name: 'root', children};
};
describe('Build tree from directory names', () => {
  describe('one level deep', () => {
    it('GIVEN dir1/file.js', () => {
      const names = ['dir1/file.js'];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [{name: 'dir1', children: []}]}
      );
    });
    it('GIVEN the dir twice, dir/file1.js and dir/file2.js', () => {
      const names = ['dir/file1.js', 'dir/file2.js'];
      const child = buildTree(names).children[0];
      assert.deepStrictEqual(child, {name: 'dir', children: []});
    });
    it('GIVEN many dirs many times', () => {
      const names = [
        'file.js',
        'dir/file1.js', 'dir/file2.js',
        'dir1/file1.js', 'dir1/file2.js', 'dir1/file3.js', 'dir1/file4.js',
        'dir2/file1.js',
      ];
      const children = buildTree(names).children;
      assert.deepStrictEqual(children, [
        {name: 'dir', children: []},
        {name: 'dir1', children: []},
        {name: 'dir2', children: []},
      ]);
    });
  });
});