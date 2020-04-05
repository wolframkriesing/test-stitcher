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
export const groupSuites = (suites) => {
  const suitesTree = generateSuiteTree(suites);
  const suitesByDir = {};
  const dirName = filename => filename.split('/').slice(0, -1).join('/');
  suites.forEach(suite => {
    const dir = dirName(suite.origin);
    if (!Reflect.has(suitesByDir, dir)) suitesByDir[dir] = [];
    suitesByDir[dir].push(suite);
  });
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

const newSuite = name => ({name, suites: [], tests: [], origin: name});
export const generateSuiteTree = (suites) => {
  const origins = suites.map(suite => suite.origin);
  const tree = buildPathnamesTree(origins);
  const createChildSuite = (leaf) => {
    const suite = newSuite(leaf.name);
    if (leaf.children.length > 0) {
      suite.suites = leaf.children.map(child => createChildSuite(child));
    }
    return suite;
  }
  const root = newSuite('root');
  root.suites = tree.children.map(child => createChildSuite(child));
  return root;
};

export const buildPathnamesTree = (filenamesWithPath) => {
  const createdDirs = new Map();
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

const uniques = arr => [...new Set(arr)];
const removeFilenames = f => f.split('/').slice(0, -1).join('/');
const removeEmptyStrings = f => f.trim() !== '';
export const findRoots = (files) => {
  const dirs = uniques(files.map(removeFilenames).filter(removeEmptyStrings)).sort();
  const isSubDir = name => dirs.some(dir => name.startsWith(`${dir}/`));
  return dirs
    .map(d => ({value: d, isRoot: true}))
    .map(d => isSubDir(d.value) ? {...d, isRoot: false} : d)
    .filter(d => d.isRoot)
    .map(d => d.value)
  ;
}

export const splitOutPathnames = (files) => {
  const roots = findRoots(files);
  const pathnames = uniques(files.map(removeFilenames).filter(removeEmptyStrings)).sort();
  const findRoot = n => roots.filter(r => n.startsWith(r + '/') || r === n)[0];
  return pathnames
    .map(path => ({root: findRoot(path), path}))
    .map(name => {
      if (name.root === name.path) return [name.root];
      return [name.root, ...name.path.replace(name.root + '/', '').split('/')]
    })
  ;
};
