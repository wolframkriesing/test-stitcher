export type PathnamesTree = {
    name: string
    children: PathnamesTree[], 
};

export function findRoots(files: Filename[]): string[];
export function generateSuiteTree(suites: Suite[]): Suite;
export function splitOutPathnames(files: Filename[]): string[][];
export function buildPathnamesTree(filenamesWithPath: Filename[]): PathnamesTree;
export function groupSuites(suites: Suite[]): Suite;
