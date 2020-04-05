import * as assert from 'assert';
import {describe, it} from 'mocha';
import {stats} from './stats.js';
import {emptySuite, createNewSuite} from './Suite.js';

describe('Provide statistics about test suites', () => {
  it('GIVEN no test suites and no tests THEN return 0 for everything', () => {
    const noSuites = emptySuite();
    assert.deepEqual(stats(noSuites), {counts: {tests: 0, suites: 0}});
  });
  it('GIVEN one test suite with no tests THEN return the counts: suites=1, tests=0', () => {
    const suite = createNewSuite('test suite');
    const suites = {name: '', suites: [suite], tests: [], origin: ''};
    assert.deepEqual(stats(suites), {counts: {tests: 0, suites: 1}});
  });
  it('GIVEN one test suite containing another one THEN return the counts: suites=2, tests=0', () => {
    const suite = {
      name: 'suite',
      suites: [createNewSuite('suite')],
      tests: [],
      origin: ''
    };
    const suites = {name: '', suites: [suite], tests: [], origin: ''};
    assert.deepEqual(stats(suites), {counts: {tests: 0, suites: 2}});
  });
  it('GIVEN two test suites containing two each THEN return the counts: suites=6, tests=0', () => {
    const aSuite = createNewSuite('suite');
    const suite = {name: 'suite', tests: [], suites: [aSuite, aSuite], origin: ''};
    const suites = {name: '', suites: [suite, suite], tests: [], origin: ''};
    assert.deepEqual(stats(suites), {counts: {tests: 0, suites: 6}});
  });
  it('GIVEN suites multiple levels deep THEN return the right counts', () => {
    const suites = [
      emptySuite(),
      {name: '', suites: [emptySuite()], tests: [], origin: ''},
      {
        name: '',
        suites: [{name: '', suites: [emptySuite()], tests: [], origin: ''}],
        tests: [],
        origin: '',
      },
      {
        name: '',
        suites: [{
          name: '',
          suites: [emptySuite(), emptySuite()],
          tests: [],
          origin: '',
        }],
        tests: [],
        origin: '',
      }
    ];
    assert.deepEqual(stats({name: '', suites, tests: [], origin: ''}), {counts: {tests: 0, suites: 10}});
  });
});

describe('Provide statistics about the tests', () => {
  it('GIVEN no suites, just one test THEN return the count=1', () => {
    const oneTest = {name: '', suites: [], tests: [{name: ''}], origin: ''};
    assert.deepEqual(stats(oneTest), {counts: {tests: 1, suites: 0}});
  });
  it('GIVEN a test on the 2nd level of nested suites THEN return count=1', () => {
    const oneTest = {
      name: '',
      suites: [{name: '', suites: [], tests: [{name: ''}], origin: ''}],
      tests: [],
      origin: '',
    };
    assert.deepEqual(stats(oneTest), {counts: {tests: 1, suites: 1}});
  });
  it('GIVEN tests on many levels THEN count correctly', () => {
    const test = {name: ''};
    const all = {
      name: '',
      suites: [
        {
          name: '',
          suites: [],
          tests: [test, test],
          origin: '',
        },
        {
          name: '',
          suites: [{name: '', suites: [], tests: [test], origin: ''}],
          tests: [test],
          origin: '',
        },
        {
          name: '',
          suites: [{
            name: '',
            suites: [{name: '', suites: [], tests: [test, test], origin: ''}],
            tests: [test],
            origin: ''
          }],
          tests: [test],
          origin: '',
        },
        {
          name: '',
          suites: [{
            name: '',
            suites: [
              emptySuite(),
              {name: '', suites: [], tests: [test, test], origin: ''}
            ],
            tests: [],
            origin: '',
          }],
          tests: [],
          origin: '',
        }
      ],
      tests: [test],
      origin: '',
    };
    assert.deepEqual(stats(all), {counts: {tests: 11, suites: 10}});
  });
});