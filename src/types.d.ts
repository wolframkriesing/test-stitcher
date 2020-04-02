type Test = {};

type Suite = {
  name: string;
  suites: Suite[];
  tests: Test[];
}

type Stats = {
  counts: {
    tests: number;
    suites: number;
  }
}
