# ideas
- [ ] stats: LOC of a test
- [ ] all `suites` need to be renamed to a better name, it used to be
      an array `[]` but it became `{suites: [], tests: []}` - What is a good name for it?
      ... not sure there is a better name, sticking to suite for now
- [ ] Reading many files: test speed - make it fast (reading many files and so on)
- [ ] put a `stats` attrribute in each `Suite` to have stats per suite
- [ ] lint ideas: 
  - [ ] words used in test description and identifiers used in test code
        if there is no overlap WARN, show the overlap ...
        e.g. `it("counts the number of elements", () { assert(lengthOfAttrributes(...)) })`
        there is no overlap in words "counts" vs. "length", "elements" vs. "attributes"
        the test and its description should not use different language
  - [ ] if all tests start with `render element ...` this can be grouped into a suite with that name
- [ ] add stats:
  - [ ] LOC in test
  - [ ] number of assertions in test
  - [ ] identifiers used (all identifiers that are used in the test, variables, class names, etc.)
  - [ ] type: file|directory|suite|test
- [ ] does it add value, if the type `Filename` will be made of `Dirname + / + Filename`?

# v2
- [x] take multiple test files as parameter and parse them
      challenges are:
   - [x] ~~name this group of tests :) (might be a file, might be a `describe`)~~ sticking with `suite`
   - [x] Q: how are parameters (many files) passed? 
         A: as usually for scripts, separated by a space
   - [x] must work for URLs and files
- [x] introduce TS
- [x] fix the types, currently failing
- [x] extend the Suite type (with origin)
- [ ] `./run.sh npm run parse-file <path/to/testfile.js> -- --json` to parse the test descriptions out of the given file as JSON
- [x] allow `./run.sh` to be called in multiple terminal sessions and enter always the same one docker container

# v1 - Run on one file
- [x] `./run.sh npm i` to install all the dependencies
- [x] `./run.sh npm test` to run the tests
- [x] `./run.sh npm run parse-file <path/to/testfile.js>` to parse the test descriptions out of the given file 
- [x] extract the tests
- [x] parse files over http(s), e.g. jskatas katas, jslang katas
- [x] basic stats, #tests, #test suite
- [x] implement tests on the root level
- [x] rename the project to test-stitcher