import { formatDuration, variousAveragesOf, calcStats } from ".";

describe("variousAveragesOf", () => {
  it("calculates from 5 results", () => {
    const { best, current, worst } = variousAveragesOf(5, [1, 2, 3, 4, 100]);
    expect(best).toEqual(3);
    expect(current).toEqual(3);
    expect(worst).toEqual(3);
  });

  it("calculates from 6 results", () => {
    const { best, worst, current } = variousAveragesOf(5, [
      1,
      2,
      3,
      4,
      100,
      99
    ]);
    expect(best).toEqual(3);
    expect(current).toBeCloseTo(35.333, 3);
    expect(worst).toBeCloseTo(35.333, 3);
  });
});

describe("averageOf", () => {
  expect(
    calcStats([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
    ].map((time) => ({ time, scramble: '', timestamp: 0 })))
  ).toEqual({
    averageOf: {
      '100': null,
      '12': {
        best: 6.5,
        current: 7.5,
        worst: 7.5,
      },
      '5': {
        best: 3,
        current: 11,
        worst: 11,
      },
    },
    single: {
      best: 1,
      current: 13,
      worst: 13,
    }
  })
});

describe("formatDuration", () => {
  const tests = [
    [0, " 0.00"],
    [1, " 1.00"],
    [1.2, " 1.20"],
    [1.234, " 1.23"],
    [10.234, "10.23"],
    [1.2345, " 1.23"],
    [100.234, "1:40.23"],
    [61.234, "1:01.23"]
  ];

  tests.forEach(([n, s]: [number, string]) => {
    it(`renders ${n}s => "${s}"`, () => {
      expect(formatDuration(n)).toBe(s);
    });
  });
});
