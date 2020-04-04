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
    const childSuite = cloneSuiteAndNameIt(suites[0]);
    const dirYSuite = newSuite('dirY');
    dirYSuite.suites.push(cloneSuiteAndNameIt(suites[1]));
    const dirSuites = [
      {name: '', suites: [dirYSuite, childSuite], tests: [], origin: 'dirX'},
    ];
    return groupSuites(dirSuites);
  } else if (suites[0].origin.startsWith('dirA/dirB/fil')) {
    const childSuite = cloneSuiteAndNameIt(suites[0]);
    const dirCSuite = newSuite('dirC');
    dirCSuite.suites.push(cloneSuiteAndNameIt(suites[1]));
    const dirSuites = [
      {name: '', suites: [dirCSuite, childSuite], tests: [], origin: 'dirA/dirB'},
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
      it('THEN return this one suite as child-suite AND with the name "root"', () => {
        const groupedSuite = groupSuites([suite]);
        assert.strictEqual(groupedSuite.suites.length, 1);
        assert.strictEqual(groupedSuite.name, 'root');
      });
      it('THEN return the grouped suite AND filename as suite name', () => {
        const groupedSuite = groupSuites([suite]);
        assert.deepStrictEqual(groupedSuite.suites, [{
          name: suite.origin,
          suites: suite.suites,
          tests: suite.tests,
          origin: suite.origin,
        }]);
      });
      it('THEN the suite must be cloned (not the same)', () => {
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
      it('AND the files` suites underneath', () => {
        const groupedSuite = groupSuites([suite1, suite2]);
        const dir1Suites = groupedSuite.suites[0].suites;
        const dir2Suites = groupedSuite.suites[1].suites;
        assert.deepStrictEqual(dir1Suites[0].name, 'dir1/file.js');
        assert.deepStrictEqual(dir2Suites[0].name, 'dir2/file.js');
      });
    });
    describe('WHEN multiple suites are in multiple sub-directory multiple levels deep', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dirX/file.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dirX/dirY/file.js'};
      it('THEN create a child-suites named like the directories', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        assert.strictEqual(rootSuite.name, 'root');
        assert.strictEqual(rootSuite.suites.length, 1); // the subdir dirX (dirY is underneath)
        assert.strictEqual(rootSuite.suites[0].name, 'dirX');
        assert.strictEqual(rootSuite.suites[0].suites[0].name, 'dirY');
      });
      it('AND the files` suites underneath', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        const dirXSuites = rootSuite.suites[0].suites;
        const dirYSuites = rootSuite.suites[0].suites[0].suites;
        assert.deepStrictEqual(dirXSuites[1].name, 'dirX/file.js'); // dirXSuites[0] is "dirY"
        assert.deepStrictEqual(dirYSuites[0].name, 'dirX/dirY/file.js');
      });
    });
    describe('WHEN multiple sub-directory but no suites on every level', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dirA/dirB/file.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC/file.js'};
      it('THEN dont create a sub dir for the first levels', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        assert.strictEqual(rootSuite.name, 'root');
        assert.strictEqual(rootSuite.suites.length, 1); // the subdir dirA/dirB
        assert.strictEqual(rootSuite.suites[0].name, 'dirA/dirB');
        assert.strictEqual(rootSuite.suites[0].suites[0].name, 'dirC');
      });
      it('AND the files` suites underneath', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        const dirBSuites = rootSuite.suites[0].suites;
        const dirCSuites = rootSuite.suites[0].suites[0].suites;
        assert.deepStrictEqual(dirBSuites[1].name, 'dirA/dirB/file.js');
        assert.deepStrictEqual(dirCSuites[0].name, 'dirA/dirB/dirC/file.js');
      });
    });
  });
});

const newSuite = name => ({name, suites: [], tests: [], origin: name});
const generateSuiteTree = (suites) => {
  const subSuites = [];
  if (suites[0].origin.startsWith('dir1/') && suites[1].origin.startsWith('dir1/dir2')) {
    const subsub = newSuite('dir1');
    subsub.suites.push(newSuite('dir2'));
    subSuites.push(subsub);
  } else if (suites[1].origin.startsWith('dir1/dir2')) {
    const subsub = newSuite('dir1/dir2');
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
  it('GIVEN two levels deep WHEN a file is only at the end THEN render just one child suite', () => {
    const suite1 = {name: '', suites: [], tests: [], origin: 'file.js'};
    const suite2 = {name: '', suites: [], tests: [], origin: 'dir1/dir2/file.js'};
    const tree = generateSuiteTree([suite1, suite2]);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir1/dir2');
  });
  it('GIVEN two levels deep WHEN a file on every level THEN render each as child', () => {
    const suite1 = {name: '', suites: [], tests: [], origin: 'dir1/file.js'};
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
  const root = {name: 'root', children: []};
  splitPaths(names).forEach(dir => { buildDirTree(dir, 0, root); });
  return root;
};
describe('Build tree from directory names', () => {
  describe('one level deep', () => {
    it('GIVEN dir1/file.js THEN return one child, the "dir1"', () => {
      const names = ['dir1/file.js'];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [{name: 'dir1', children: []}]}
      );
    });
    it('GIVEN the dir twice, dir/file1.js and dir/file2.js THEN return one child, the "dir"', () => {
      const names = ['dir/file1.js', 'dir/file2.js'];
      const child = buildTree(names).children[0];
      assert.deepStrictEqual(child, {name: 'dir', children: []});
    });
    it('GIVEN many dirs many times THEN return each ONCE', () => {
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
    it('GIVEN dir1/dir2/file.js THEN return one child "dir1/dir2" (we dont want to have empty dirs at the top of the hierarchy)', () => {
      const names = ['file.js', 'dir1/dir2/file1.js', 'dir1/dir2/file2.js'];
      assert.deepStrictEqual(
        buildTree(names), 
        {name: 'root', children: [
          {name: 'dir1/dir2', children: []}
        ]}
      );
    });
    it('GIVEN multiple dirs over many levels (just to make sure ;)) THEN do it right ;)', () => {
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
    it('GIVEN recurring dir names THEN dont fail (was a bug) #regressionTest', () => {
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
    it('GIVEN some URLs with just one path THEN return one child', () => {
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
    it('GIVEN some long paths and just one dir in use THEN return one child', () => {
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

const splitPaths = (paths) => {
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
describe('Split path names where files are under', () => {
  it('GIVEN a deep path THEN return just one path, not all parts', () => {
    const names = [
      'http://st.itch/tests/more/2.js',
      'http://st.itch/tests/1.js',
      'http://st.itch/tests/2.js',
    ];
    assert.deepStrictEqual(splitPaths(names), [['http://st.itch/tests', 'more']]);    
  });
  it('GIVEN a simple path WHEN every level has a file THEN return each part', () => {
    const names = [
      'tests/1.js',
      'tests/more/2.js',
    ];
    assert.deepStrictEqual(splitPaths(names), [['tests', 'more']]);    
  });
  it('GIVEN a simple path with a file at the root THEN return every level', () => {
    const names = [
      'tests/1.js',
      'tests/more/more1/1.js',
    ];
    assert.deepStrictEqual(splitPaths(names), [['tests', 'more', 'more1']]);    
  });
  it('GIVEN many paths THEN every level is returned', () => {
    const names = [
      'fast/1.js',
      'fast/more/more1/1.js',
      'slow/1.js',
      'slow/more/more1/1.js',
      'http://slow/more/more1/1.js',
    ];
    assert.deepStrictEqual(splitPaths(names), [
      ['fast', 'more', 'more1'], ['http://slow/more/more1'], ['slow', 'more', 'more1'],
    ]);    
  });
});
