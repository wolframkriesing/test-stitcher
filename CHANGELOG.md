# ideas
- [ ] `./run.sh npm run parse-file <path/to/testfile.js> -- --json` to parse the test descriptions out of the given file as JSON
- [ ] stats: LOC of a test
- [ ] lint: words used in test description and identifiers used in test code
      if there is no overlap WARN, show the overlap ...
      e.g. `it("counts the number of elements", () { assert(lengthOfAttrributes(...)) })`
      there is no overlap in words "counts" vs. "length", "elements" vs. "attributes"
      the test and its description should not use different language
- [ ] take multiple test files as parameter and parse them
      challenges are:
   - [ ] name this group of tests :) (might be a file, might be a `describe`)
   - [ ] make it fast (reading many files and so on)
   - [ ] how are parameters (many files) passed?
   - [ ] must work for URLs and files
- [ ] introduce TS
- [ ] all `suites` need to be renamed to a better name, it used to be
      an array `[]` but it became `{suites: [], tests: []}` - What is a good name for it?
      ... not sure there is a better name, sticking to suite for now

# v1 - Run on one file
- [x] `./run.sh npm i` to install all the dependencies
- [x] `./run.sh npm test` to run the tests
- [x] `./run.sh npm run parse-file <path/to/testfile.js>` to parse the test descriptions out of the given file 
- [x] extract the tests
- [x] parse files over http(s), e.g. jskatas katas, jslang katas
- [x] basic stats, #tests, #test suite
- [x] implement tests on the root level
- [x] rename the project to test-stitcher