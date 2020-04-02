type Test = {
  name: string;
};

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
