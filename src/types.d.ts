type Url = string;
type AbsoluteFilename = string;
type RelativeFilename = string;
type Filename = Url | AbsoluteFilename | RelativeFilename;

type Test = {
  name: string;
};

type Suite = {
  name: string;
  suites: Suite[];
  tests: Test[];
  origin?: Filename; /* TODO make required??? */
}

type Stats = {
  counts: {
    tests: number;
    suites: number;
  }
}
