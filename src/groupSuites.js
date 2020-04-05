import {createNewSuiteAndSetOrigin, cloneSuiteAndNameIt} from './Suite.js';

/**
 * @param {Suite[]} suites
 * @returns {Suite}
 */
export const groupSuites = (suites) => {
  const suitesTree = generateSuiteTree(suites);
  /** @type {{[key: string]: Suite[]}} */
  const suitesByDir = {};
  /**
   * @param {Filename} filename
   * @returns {string}
   */
  const dirName = filename => filename.split('/').slice(0, -1).join('/');
  suites.forEach(suite => {
    const dir = dirName(suite.origin);
    if (!Reflect.has(suitesByDir, dir)) suitesByDir[dir] = [];
    suitesByDir[dir].push(suite);
  });
  /**
   * @param {Suite[]} suites
   * @param {string} dir
   */
  const cloneFileSuitesInto = (suites, dir) => {
    suites.forEach(suite => {
      if (suite.suites.length > 0) {
        cloneFileSuitesInto(suite.suites, (dir ? dir + '/' : '') + suite.name);
      }
      const suitesDir = (dir ? dir + '/' : '') + suite.origin;
      if (Reflect.has(suitesByDir, suitesDir))
        suitesByDir[suitesDir].forEach(s => { suite.suites.push(cloneSuiteAndNameIt(s)); });
    });
    if (Reflect.has(suitesByDir, dir))
      suitesByDir[dir].forEach(s => suites.push(cloneSuiteAndNameIt(s)));
  }
  
  cloneFileSuitesInto(suitesTree.suites, '');
  return suitesTree;
};
/**
 * @param {Suite[]} suites
 * @returns {Suite}
 */
export const generateSuiteTree = (suites) => {
  const origins = suites.map(suite => suite.origin);
  const tree = buildPathnamesTree(origins);
  /**
   * @param {import("./groupSuites").PathnamesTree} leaf
   * @returns {Suite}
   */
  const createChildSuite = (leaf) => {
    const suite = createNewSuiteAndSetOrigin(leaf.name);
    if (leaf.children.length > 0) {
      suite.suites = leaf.children.map(child => createChildSuite(child));
    }
    return suite;
  }
  const root = createNewSuiteAndSetOrigin('root');
  root.suites = tree.children.map(child => createChildSuite(child));
  return root;
};

/**
 * @param {Filename[]} filenamesWithPath
 * @returns {import("./groupSuites").PathnamesTree}
 */
export const buildPathnamesTree = (filenamesWithPath) => {
  const createdDirs = new Map();
  /**
   * @param {string[]} dirNames
   * @param {number} depth
   * @param {import("./groupSuites").PathnamesTree} parent
   */
  const buildDirTree = (dirNames, depth, parent) => {
    const curDirName = dirNames[depth];
    const curFullDir = dirNames.slice(0, depth + 1).join('/');
    if (!createdDirs.has(curFullDir)) {
      createdDirs.set(curFullDir, {name: curDirName, children: []});
      parent.children.push(createdDirs.get(curFullDir));
    }
    if (dirNames.length > depth + 1) {
      buildDirTree(dirNames, depth + 1, createdDirs.get(curFullDir));
    }
  };
  const root = {name: 'root', children: []};
  splitOutPathnames(filenamesWithPath).forEach(dir => { buildDirTree(dir, 0, root); });
  return root;
};

/**
 * @param {Filename[]} arr
 * @returns {Filename[]}
 */
const uniques = arr => [...new Set(arr)];
/**
 * @param {string} f
 * @returns {string}
 */
const trimFilename = f => f.split('/').slice(0, -1).join('/');
/**
 * @param {string} f
 * @returns {boolean}
 */
const isEmptyString = f => f.trim() !== '';
/**
 * @param {Filename[]} files
 * @returns {string[]}
 */
export const findRoots = (files) => {
  const dirs = uniques(files.map(trimFilename).filter(isEmptyString)).sort();
  /**
   * @param {Filename} name
   * @returns {boolean}
   */
  const isSubDir = name => dirs.some(dir => name.startsWith(`${dir}/`));
  return dirs
    .map(d => ({value: d, isRoot: true}))
    .map(d => isSubDir(d.value) ? {...d, isRoot: false} : d)
    .filter(d => d.isRoot)
    .map(d => d.value)
  ;
}

/**
 * @param {Filename[]} files
 * @returns {string[][]}
 */
export const splitOutPathnames = (files) => {
  const roots = findRoots(files);
  const pathnames = uniques(files.map(trimFilename).filter(isEmptyString)).sort();
  /**
   * @param {string} n
   * @returns {string}
   */
  const findRoot = n => roots.filter(r => n.startsWith(r + '/') || r === n)[0];
  return pathnames
    .map(path => ({root: findRoot(path), path}))
    .map(name => {
      if (name.root === name.path) return [name.root];
      return [name.root, ...name.path.replace(name.root + '/', '').split('/')]
    })
  ;
};
