type Test = {};

export type Suite = {
  name: string;
  suites: Suite[];
  tests: Test[];
}

export type Stats = {
  counts: {
    tests: number;
    suites: number;
  }
}

export function stats(all: Suite): Stats;
