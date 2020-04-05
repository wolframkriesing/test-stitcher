# Test Stitcher

Stitch all tests together, to see the big picture.

Get insights on tests. Get a tree structure of all tests, their test descriptions and some stats about each
test and each test suite (or group of tests).  
**This project lets you read (and analyze) the test descriptions, to understand what the code does.**  
Test descriptions are the human-readable describing a test, see examples below.

## TL;DR
- `git clone <this repo>`
- install docker
- `./run.sh npm install` install app inside a docker container (or if you really should still have
  a global nodejs installation, you can also do `npm install`)
- `./run.sh npm run parse-files src/extractTextFromTests.spec.js`
  show all test descriptions of a local test file
- `./run.sh npm run parse-files https://katas.tddbin.com/katas/es1/language/global-api/parseInt.js https://katas.tddbin.com/katas/es1/language/array-api/sort-basics.js` show the tests from remote files (here two katas as used on [jskatas.org](https://jskatas.org))
- ``./run.sh npm run parse-files `find ./src -iname *spec.js` `` to stitch all the tests for this project together  
  Note: using `./run.sh` mounts the project as a volume inside a docker container, that means only those 
  files are visible and therefore just findable!

## A use case
Given a test file like the following
```javascript
describe('Extract the text from tests', () => {
  describe('GIVEN a string', () => {
    it('WHEN it is empty THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites(''), []);
    });
    it('WHEN it contains not test THEN return no test suites', () => {
      assert.deepStrictEqual(extractTestSuites('var x = 1; // but no test'), []);
    });
    describe('WHEN it contains one `describe`', () => {
      it('THEN return one test suite', () => {
        assert.strictEqual(extractTestSuites('describe("")').length, 1);
      });
      it('THEN return the test suite`s name', () => {
        const suites = extractTestSuites('describe("test suite")');
        assert.strictEqual(suites[0].name, 'test suite');
      });
    });
  });
});
```
When you run `npm run parse-files <the-filename-of-the-file-above>`, you will get this on the
command line:
```text
Extract the text from tests
  GIVEN a string
    WHEN it is empty THEN return no test suites
    WHEN it contains not test THEN return no test suites
    WHEN it contains one `describe`
      THEN return one test suite
      THEN return the test suite`s name

Statistics
-----------
{
    "counts": {
        "tests": 4,
        "suites": 3
    }
}
```

## Why?
I believe tests are not just for validating the code one writes, I believe **tests
are the driver for the code one writes**. That means, writing a test has been preceeded
by thinking what one wants. The tests are only the result of that thought process,
and become a structured mean that reflects the use cases and the responsibilities 
that the code shall fulfill. Therefore, I strongly believe (and try to practice) 
writing tests that state what I expect the code to do. That means a colleague (and not
just another developer) should be able to read and make sense of my tests.
That's why the real domain language and not the tech language shall be used in tests.

**__Test-stitcher__ lets you read (and analyze) the test descriptions, to understand what the code does.**

## Develop and run
This project requires only docker to run. Every excutable can be prefixed simply by `./run.sh`
which runs the command inside the docker container.
You can also run it when nodejs is installed on your machine, just leave out the prefix `./run.sh`.

Getting started:
- `./run.sh npm i` - will install all nodejs dependencies this project needs to run
- `./run.sh npm test` - run the tests
- `./run.sh npm run parse-files src/extractTextFromTests.spec.js` - print the test descriptions
  of the given file

The most important commands:
- `./run.sh /bin/bash` to enter the docker container that contains the environment and the app
- `./run.sh npm i` to install all the dependencies
- `./run.sh npm test` to run the tests
- `./run.sh npm run parse-files <path/to/testfile.js>` (many files are separated by a space) 
  to parse the test descriptions out of the given file and write it to stdout
- if you want to have multiple terminals for entering the docker container, you can use `docker exec -it test-stitcher /bin/bash`