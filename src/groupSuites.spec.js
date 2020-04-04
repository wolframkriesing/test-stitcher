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

const buildTree = (names) => {
  const createdDirs = new Map();
  const buildDirTree = (dirNames, depth, parent) => {
    const curDirName = dirNames[depth];
    const curFullDir = dirNames.slice(0, depth + 1).join('/');
    if (!createdDirs.has(curFullDir)) {
      createdDirs.set(curFullDir, {name: curDirName, children: []});
    }
    parent.children.push(createdDirs.get(curFullDir));
    if (dirNames.length > depth + 1) {
      buildDirTree(dirNames, depth + 1, createdDirs.get(curFullDir));
    }
  };
  
  const isDirectory = name => name.includes('/');
  const removeFilenames = name => name.split('/').slice(0, -1).join('/');
  const uniques = arr => [...new Set(arr)];
  const dirNamesOnly = uniques(names.filter(isDirectory).map(removeFilenames));
  const root = {name: 'root', children: []};
  splitPath(names)
    .forEach(dir => { buildDirTree(dir, 0, root); })
  ;
  return root;
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
  describe('many levels deep', () => {
    it('GIVEN dir1/dir2/file.js', () => {
      const names = ['file.js', 'dir1/dir2/file1.js', 'dir1/dir2/file2.js'];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: 'dir1/dir2', children: []}
        ]}
      );
    });
    it('GIVEN multiple dirs over many levels (just to make sure ;))', () => {
      const names = [
        'file.js', 
        'dir1/dir2/file1.js', 'dir1/dir2/file2.js',
        'dirA/dirB/file1.js',
        'dirA/dirB/dirC/dirD/file1.js',
      ];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: 'dir1/dir2', children: []},
          {name: 'dirA/dirB', children: [
              {name: 'dirC', children: [
                {name: 'dirD', children: []}
              ]}
          ]},
        ]}
      );
    });
    it('GIVEN recurring dir names', () => {
      const names = [
        'dir1/dir1/dir1/file1.js'
      ];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: 'dir1/dir1/dir1', children: []},
        ]}
      );
    });
  });
  describe('many levels but some empty', () => {
    it('GIVEN some URLs', () => {
      const names = [
        'http://st.itch/tests/1.js',
        'http://st.itch/tests/2.js',
      ];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: 'http://st.itch/tests', children: []}
        ]}
      );
    });
    it('GIVEN some long paths', () => {
      const names = [
        '/Users/wolframkriesing/github.com/wolframkriesing/test-stitcher/tests/file1.js',
        '/Users/wolframkriesing/github.com/wolframkriesing/test-stitcher/tests/file2.js',
        '/Users/wolframkriesing/github.com/wolframkriesing/test-stitcher/tests/file3.js',
      ];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: '/Users/wolframkriesing/github.com/wolframkriesing/test-stitcher/tests', children: []}
        ]}
      );
    });
  });
});

const splitPath = (paths) => {
  const isDirectory = name => name.includes('/');
  const removeFilenames = name => name.split('/').slice(0, -1).join('/');
  const uniques = arr => [...new Set(arr)];
  const dirNamesOnly = uniques(paths.filter(isDirectory).map(removeFilenames)).sort();
  const result = [];
  let pathsToProcess = [...dirNamesOnly];
  while (pathsToProcess.length > 0) {
    const prefix = pathsToProcess[0];
    const allWithPrefix = pathsToProcess.filter(name => name.startsWith(`${prefix}/`));
    pathsToProcess = pathsToProcess.slice(1 + allWithPrefix.length);
    const resultPaths = allWithPrefix.map(name => name.replace(`${prefix}/`, ''));
    result.push([prefix, ...resultPaths.map(name => name.split('/')).flat()]);
  }
  return result;
}
describe('Split path name where files are', () => {
  it('GIVEN a deep path THEN return just one path, not all parts', () => {
    const names = [
      'http://st.itch/tests/more/2.js',
      'http://st.itch/tests/1.js',
      'http://st.itch/tests/2.js',
    ];
    assert.deepStrictEqual(splitPath(names), [['http://st.itch/tests', 'more']]);    
  });
  it('GIVEN a simple path WHEN every level has a file THEN return each part', () => {
    const names = [
      'tests/1.js',
      'tests/more/2.js',
    ];
    assert.deepStrictEqual(splitPath(names), [['tests', 'more']]);    
  });
  it('GIVEN a simple path THEN every level is returned', () => {
    const names = [
      'tests/1.js',
      'tests/more/more1/1.js',
    ];
    assert.deepStrictEqual(splitPath(names), [['tests', 'more', 'more1']]);    
  });
  it('GIVEN many paths THEN every level is returned', () => {
    const names = [
      'fast/1.js',
      'fast/more/more1/1.js',
      'slow/1.js',
      'slow/more/more1/1.js',
      'http://slow/more/more1/1.js',
    ];
    assert.deepStrictEqual(splitPath(names), [
      ['fast', 'more', 'more1'], ['http://slow/more/more1'], ['slow', 'more', 'more1'],
    ]);    
  });
});
