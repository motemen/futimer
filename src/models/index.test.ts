import { formatDuration, variousAveragesOf } from '.';

describe('variousAveragesOf', () => {
  it('calculates from 5 results', () => {
    const { best, last, worst } = variousAveragesOf(5, [1, 2, 3, 4, 100]);
    expect(best).toEqual(3);
    expect(last).toEqual(3);
    expect(worst).toEqual(3);
  });

  it('calculates from 6 results', () => {
    const { best, worst, last } = variousAveragesOf(5, [1, 2, 3, 4, 100, 99]);
    expect(best).toEqual(3);
    expect(last).toBeCloseTo(35.333, 3);
    expect(worst).toBeCloseTo(35.333, 3);
  });
});

describe('formatDuration', () => {
  const tests = [
    [   0,        ' 0.000' ],
    [   1,        ' 1.000' ],
    [   1.2,      ' 1.200' ],
    [   1.234,    ' 1.234' ],
    [  10.234,    '10.234' ],
    [   1.2345,   ' 1.234' ],
    [ 100.234,  '1:40.234' ],
    [  61.234,  '1:01.234' ],
  ];

  tests.forEach(([n, s]: [number, string]) => {
    it(`renders ${n}s => "${s}"`, () => {
      expect(formatDuration(n)).toBe(s);
    });
  });
});