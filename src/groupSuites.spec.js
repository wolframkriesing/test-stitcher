import * as assert from 'assert';
import {describe, it} from 'mocha';
import {groupSuites, splitOutPathnames, findRoots, buildPathnamesTree, generateSuiteTree} from './groupSuites.js';

describe('Group test suites from multiple files and produce one containing them all', () => {
  describe('GIVEN every file has a relative path (e.g. src/file1 and src/file2)', () => {
    describe('WHEN given one suite of one file', () => {
      const suite = {name: '', suites: [], tests: [], origin: 'file.js'};
      it('THEN return this one suite as child-suite AND with the name "root"', () => {
        const rootSuite = groupSuites([suite]);
        assert.strictEqual(rootSuite.suites.length, 1);
        assert.strictEqual(rootSuite.name, 'root');
      });
      it('THEN return the grouped suite AND filename as suite name', () => {
        const rootSuite = groupSuites([suite]);
        assert.deepStrictEqual(rootSuite.suites, [{
          name: suite.origin,
          suites: suite.suites,
          tests: suite.tests,
          origin: suite.origin,
        }]);
      });
      it('THEN the suite must be cloned (not the same)', () => {
        const rootSuite = groupSuites([suite]);
        assert.notStrictEqual(rootSuite.suites[0], suite);
      });
    });
    describe('WHEN given suites of two files', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'file2.js'};
      it('THEN return the suites with filename as suite name', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(rootSuite.suites[0].name, suite1.origin);
        assert.deepStrictEqual(rootSuite.suites[1].name, suite2.origin);
      });
    });
    describe('WHEN multiple suites are in one sub-directory', () => {
      const suite1 = {name: '', suites: [], tests: [], origin: 'dir/file1.js'};
      const suite2 = {name: '', suites: [], tests: [], origin: 'dir/file2.js'};
      it('THEN create a child-suite named like the directory', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        assert.deepStrictEqual(rootSuite.suites[0].name, 'dir');
        assert.deepStrictEqual(rootSuite.suites[0].origin, 'dir');
      });
      it('AND the suites underneath', () => {
        const rootSuite = groupSuites([suite1, suite2]);
        const fileSuites = rootSuite.suites[0].suites;
        assert.deepStrictEqual(fileSuites[0].name, 'dir/file1.js');
        assert.deepStrictEqual(fileSuites[1].name, 'dir/file2.js');
      });
    });
    describe('WHEN multiple suites are in multiple sub-directory', () => {
      const suites = [
        {name: '', suites: [], tests: [], origin: 'dir1/file.js'},
        {name: '', suites: [], tests: [], origin: 'dir2/file.js'},
      ];
      it('THEN create a child-suites named like the directories', () => {
        const rootSuite = groupSuites(suites);
        const childSuites = rootSuite.suites;
        assert.deepStrictEqual(childSuites[0].name, 'dir1');
        assert.deepStrictEqual(childSuites[0].origin, 'dir1');
        assert.deepStrictEqual(childSuites[1].name, 'dir2');
        assert.deepStrictEqual(childSuites[1].origin, 'dir2');
      });
      it('AND the files` suites underneath', () => {
        const rootSuite = groupSuites(suites);
        const dir1Suites = rootSuite.suites[0].suites;
        const dir2Suites = rootSuite.suites[1].suites;
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
    describe('WHEN paths, URLs, etc.', () => {
      const suites = [
        {name: '', suites: [], tests: [], origin: 'dirA/dirB/1.js'},
        {name: '', suites: [], tests: [], origin: 'dirA/dirB/2.js'},
        {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC/dirD/file.js'},
        {name: '', suites: [], tests: [], origin: 'http://sti.tch/1/2/3.js'},
      ];
      it('THEN dont create a sub dir for the first levels', () => {
        const rootSuite = groupSuites(suites);
        assert.strictEqual(rootSuite.suites[0].name, 'dirA/dirB');
        assert.strictEqual(rootSuite.suites[0].suites[1].origin, 'dirA/dirB/1.js');
        assert.strictEqual(rootSuite.suites[0].suites[2].origin, 'dirA/dirB/2.js');
        
        assert.strictEqual(rootSuite.suites[0].suites[0].name, 'dirC');
        assert.strictEqual(rootSuite.suites[0].suites[0].suites[0].name, 'dirD');
        assert.strictEqual(rootSuite.suites[0].suites[0].suites[0].suites[0].origin, 'dirA/dirB/dirC/dirD/file.js');
        
        assert.strictEqual(rootSuite.suites[1].name, 'http://sti.tch/1/2');
        assert.strictEqual(rootSuite.suites[1].suites[0].origin, 'http://sti.tch/1/2/3.js');
      });
    });
  });
});

describe('From a list of files (and directories) build a hierarchy of suites', () => {
  it('GIVEN one level deep THEN build suites accordingly', () => {
    const suite1 = {name: '', suites: [], tests: [], origin: 'file.js'};
    const suite2 = {name: '', suites: [], tests: [], origin: 'dir1/file.js'};
    const tree = generateSuiteTree([suite1, suite2]);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir1');
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
  it('GIVEN various levels AND multiple files THEN render right ;)', () => {
    const suites = [
      {name: '', suites: [], tests: [], origin: 'dir1/file.js'},
      {name: '', suites: [], tests: [], origin: 'dir1/dir2/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC1/file.js'},
    ];
    const tree = generateSuiteTree(suites);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir1');
    assert.strictEqual(tree.suites[0].suites[0].name, 'dir2');
    assert.strictEqual(tree.suites[1].name, 'dirA/dirB');
    assert.strictEqual(tree.suites[1].suites[0].name, 'dirC');
    assert.strictEqual(tree.suites[1].suites[1].name, 'dirC1');
  });
  it('GIVEN various levels AND multiple files, URLs THEN render right ;)', () => {
    const suites = [
      {name: '', suites: [], tests: [], origin: 'file.js'},
      {name: '', suites: [], tests: [], origin: 'dir1/dir2/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC/dirD/file.js'},
      {name: '', suites: [], tests: [], origin: 'dirA/dirB/dirC1/file.js'},
      {name: '', suites: [], tests: [], origin: 'http://x.de/1/2/3/a.js'},
      {name: '', suites: [], tests: [], origin: 'http://x.de/1/2/3/b.js'},
    ];
    const tree = generateSuiteTree(suites);
    assert.strictEqual(tree.name, 'root');
    assert.strictEqual(tree.suites[0].name, 'dir1/dir2');
    assert.strictEqual(tree.suites[1].name, 'dirA/dirB/dirC');
    assert.strictEqual(tree.suites[1].suites[0].name, 'dirD');
    assert.strictEqual(tree.suites[2].name, 'dirA/dirB/dirC1');
    assert.strictEqual(tree.suites[3].name, 'http://x.de/1/2/3');
  });
});

describe('Build tree from directory names', () => {
  describe('one level deep', () => {
    it('GIVEN dir1/file.js THEN return one child, the "dir1"', () => {
      const names = ['dir1/file.js'];
      assert.deepStrictEqual(
        buildPathnamesTree(names), 
        {name: 'root', children: [{name: 'dir1', children: []}]}
      );
    });
    it('GIVEN the dir twice, dir/file1.js and dir/file2.js THEN return one child, the "dir"', () => {
      const names = ['dir/file1.js', 'dir/file2.js'];
      const child = buildPathnamesTree(names).children[0];
      assert.deepStrictEqual(child, {name: 'dir', children: []});
    });
    it('GIVEN many dirs many times THEN return each ONCE', () => {
      const names = [
        'file.js',
        'dir/file1.js', 'dir/file2.js',
        'dir1/file1.js', 'dir1/file2.js', 'dir1/file3.js', 'dir1/file4.js',
        'dir2/file1.js',
      ];
      const children = buildPathnamesTree(names).children;
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
        buildPathnamesTree(names), 
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
        buildPathnamesTree(names),
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
    it('GIVEN multiple dirs over many levels and multiple children on one level THEN do it right ;)', () => {
      const names = [
        'file.js', 
        'dirA/dirB/file1.js',
        'dirA/dirB/dirC/file1.js',
        'dirA/dirB/dirC1/file1.js',
        'dirA/dirB/dirC2/file1.js',
      ];
      assert.deepStrictEqual(
        buildPathnamesTree(names), 
        {name: 'root', children: [
          {name: 'dirA/dirB', children: [
              {name: 'dirC', children: []},
              {name: 'dirC1', children: []},
              {name: 'dirC2', children: []},
          ]},
        ]}
      );
    });
    it('GIVEN recurring dir names THEN dont fail (was a bug) #regressionTest', () => {
      const names = [
        'dir1/dir1/dir1/file1.js'
      ];
      assert.deepStrictEqual(
        buildPathnamesTree(names), 
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
        buildPathnamesTree(names), 
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
        buildPathnamesTree(names), 
        {name: 'root', children: [
          {name: '/Users/wolframkriesing/github.com/wolframkriesing/test-stitcher/tests', children: []}
        ]}
      );
    });
  });
});

describe('Split a set of file names for building a suites tree structure', () => {
  describe('HELPER tests: find roots', () => {
    describe('just files', () => {
      it('GIVEN a file at the root THEN return no path names', () => {
        const files = ['1.js'];
        assert.deepStrictEqual(findRoots(files), []);
      });
      it('GIVEN many file at the root THEN return no path names', () => {
        const files = ['1.js', '2.js'];
        assert.deepStrictEqual(findRoots(files), []);
      });
    });
    describe('one level deep dirs', () => {
      it('GIVEN a file in a dir THEN return that path name', () => {
        const files = ['1/2.js'];
        assert.deepStrictEqual(findRoots(files), ['1']);
      });
      it('GIVEN files in many dirs THEN return that path names', () => {
        const files = ['1/2.js', '3/4.js', '5/6.js', '7/8.js'];
        assert.deepStrictEqual(findRoots(files), ['1', '3', '5', '7']);
      });
      it('AND every dir only once', () => {
        const files = ['1/2a.js', '1/2b.js', '3/4x.js', '3/4y.js', '3/4z.js'];
        assert.deepStrictEqual(findRoots(files), ['1', '3']);
      });
      it('AND sorted by name', () => {
        assert.deepStrictEqual(findRoots(['b/1.js', 'a/1.js']), ['a', 'b']);
        assert.deepStrictEqual(findRoots(['a/1.js', '1/1.js']), ['1', 'a']);
        assert.deepStrictEqual(findRoots(['bCd/1.js', 'aCd/1.js']), ['aCd', 'bCd']);
      });
    });
    describe('multiple levels deep', () => {
      it('GIVEN a file in every dir THEN return the root only', () => {
        const files = ['a/b/1.js', 'a/1.js'];
        assert.deepStrictEqual(findRoots(files), ['a']);
      });
      it('GIVEN a file in the 3rd level dir THEN return the root as a/b/c', () => {
        const files = ['a/b/c/1.js', 'c/1.js'];
        assert.deepStrictEqual(findRoots(files), ['a/b/c', 'c']);
      });
      it('GIVEN a mix of it all', () => {
        const files = [
          'one-level/1.js',
          'one-level/2.js',
          'one/two/three/four/2.js',
          '1/2/3/4/5/6/7.js',
          '1/2.js'
        ];
        assert.deepStrictEqual(findRoots(files), [
          '1',
          'one-level',
          'one/two/three/four',
        ]);
      });
    });
    describe('URLs too', () => {
      it('GIVEN a URL THEN return it as root', () => {
        const files = ['http://pico.stitch/t.js'];
        assert.deepStrictEqual(findRoots(files), ['http://pico.stitch']);
      });
      it('GIVEN many URLs one with a subdir THEN return each as root', () => {
        const files = ['http://pico.stitch/t.js', 'http://site.stitch/test/t.js'];
        assert.deepStrictEqual(findRoots(files), [
          'http://pico.stitch', 'http://site.stitch/test'
        ]);
      });
      it('GIVEN URLs and files THEN just do it right', () => {
        const files = [
          'file.js',
          'http://pico.stitch/t.js', 'http://site.stitch/test/1/2/3/t.js',
          'dir/1/2/3.js',
        ];
        assert.deepStrictEqual(findRoots(files), [
          'dir/1/2',
          'http://pico.stitch', 'http://site.stitch/test/1/2/3',
        ]);
      });
    });
  });
  describe('GIVEN a list of file names, local filesystem or URLs, or mixed', () => {
    describe('WHEN local relative files are given', () => {
      it('AND one file THEN return no path names', () => {
        const files = ['1.js'];
        assert.deepStrictEqual(splitOutPathnames(files), []);
      });
      it('AND many files THEN return no path names', () => {
        const files = ['1.js', '2.js'];
        assert.deepStrictEqual(splitOutPathnames(files), []);
      });
      it('AND dirs one level deep THEN return that path name', () => {
        const files = ['1/2.js', '3/4.js'];
        assert.deepStrictEqual(splitOutPathnames(files), [['1'], ['3']]);
      });
      it('AND dirs many levels deep THEN return that path names', () => {
        const files = ['0/1/2/3/4.js', '0/1/2.js', '0/1/2/3.js'];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['0/1'],
          ['0/1', '2'],
          ['0/1', '2', '3'],
        ]);
      });
      it('AND many files on one level THEN return each path name once', () => {
        const files = [
          'a/b/c/e.js', 'a/b/c/d/f.js', 'a/b/c/d/g.js', 
          '1/2.js',
        ];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['1'],
          ['a/b/c'],
          ['a/b/c', 'd'],
        ]);
      });
      it('AND overlapping names (dir, dir1) THEN returns them separately', () => {
        const names = [
          'file.js',
          'dir/file1.js', 'dir/file2.js',
          'dir1/file1.js', 'dir1/file2.js', 'dir1/file3.js', 'dir1/file4.js',
          'dir2/file1.js',
        ];
        assert.deepStrictEqual(splitOutPathnames(names), [
          ['dir'],
          ['dir1'],
          ['dir2'],
        ]);
      });
    });
    describe('WHEN local absolute files are given', () => {
      it('AND many files on one level THEN return each path name once', () => {
        const files = [
          '/a/b/c/e.js', '/a/b/c/d/f.js', '/a/b/c/d/g.js', 
          '/1/2.js',
        ];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['/1'],
          ['/a/b/c'],
          ['/a/b/c', 'd'],
        ]);
      });
    });
    describe('WHEN local relative+absolute files are given', () => {
      it('AND many files on one level THEN return each path name once', () => {
        const files = [
          '/a/b/c/e.js', '/a/b/c/d/f.js',
          'a/b/c/d/g.js', 
          '1/2.js',
        ];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['/a/b/c'],
          ['/a/b/c', 'd'],
          ['1'],
          ['a/b/c/d'],
        ]);
      });
    });
    describe('WHEN URLs are given', () => {
      it('AND many files on one level THEN return each path name once', () => {
        const files = [
          'http://c.es/e.js', 'http://c.es/1/2/e.js', 'http://c.es/1/2/a.js',
        ];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['http://c.es'],
          ['http://c.es', '1', '2'],
        ]);
      });
    });
    describe('WHEN URLs, local and absolute files are given', () => {
      it('AND many files on one level THEN return each path name once', () => {
        const files = [
          'http://c.es/e.js', 'http://c.es/1/2/e.js', 'http://c.es/1/2/a.js',
          'a/b/1.js',
          '1/2.js', '1/3.js', 
        ];
        assert.deepStrictEqual(splitOutPathnames(files), [
          ['1'],
          ['a/b'],
          ['http://c.es'],
          ['http://c.es', '1', '2'],
        ]);
      });
    });
  });
});
