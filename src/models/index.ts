export interface Record {
  scramble: string;
  time: number;
  timestamp: number;
}

export interface ResultStats {
  averageOf: {
    [n: number]: ResultStatsEntry;
  };
  single?: ResultStatsEntry;
}

export interface Session {
  name?: string;
  puzzleType: PuzzleType;
  records: Record[];
}

interface ResultStatsEntry {
  best: number;
  current: number;
  worst: number;
}

export function calcStats(results?: Record[]): ResultStats {
  if (!results || results.length === 0) {
    return {
      averageOf: {}
    };
  }

  const scores = results.map(result => result.time);
  return {
    averageOf: [5, 12, 100].reduce((a, n) => {
      const aa = scores.length >= n ? variousAveragesOf(n, scores) : null;
      return { ...a, [n]: aa };
    }, {}),
    single: {
      best: Math.min(...scores),
      current: scores[scores.length - 1],
      worst: Math.max(...scores)
    }
  };
}

function meanOf(scores: number[]) {
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function averageOf(scores: number[]) {
  const sorted = scores.slice().sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
  return meanOf(sorted.slice(1, sorted.length - 1));
}

function slicesFrom<T>(n: number, array: T[]): T[][] {
  return new Array(array.length - n + 1)
    .fill(null)
    .map((_, i) => array.slice(i, i + n));
}

export function variousAveragesOf(
  n: number,
  scores: number[]
): ResultStatsEntry {
  if (scores.length < n) {
    throw new Error(`not enough scores: ${scores.length} < ${n}`);
  }

  const { best, worst } = slicesFrom(n, scores)
    .map(s => averageOf(s))
    .reduce(
      (curr, v) => {
        return {
          best: Math.min(v, curr.best),
          worst: Math.max(v, curr.worst)
        };
      },
      { best: Number.MAX_VALUE, worst: Number.MIN_VALUE }
    );

  return {
    best,
    current: averageOf(scores.slice(-n)),
    worst
  };
}

export function formatDuration(n: undefined): undefined;
export function formatDuration(n: number): string;
export function formatDuration(n: number | undefined) {
  if (n === undefined) {
    return undefined;
  }

  const subsecs = n.toString().split(/\./)[1] || "";
  const mins = Math.floor(n / 60);
  const secs = Math.floor(n % 60);

  const padLeft = (s: string, c: string): string => {
    if (s.length === 2) {
      return s;
    }
    return c + s;
  };

  return (
    (mins ? `${mins}:` : "") +
    padLeft(secs.toString(), mins ? "0" : " ") +
    "." +
    (subsecs + "00").substring(0, 2)
  );
}

export type PuzzleType = keyof typeof PuzzleConfiguration;

export const PuzzleConfiguration = {
  "222": { longName: "2x2x2", tnoodleImpl: "TwoByTwoCubePuzzle" },
  "333": { longName: "3x3x3", tnoodleImpl: "ThreeByThreeCubePuzzle" },
  "444": { longName: "4x4x4", tnoodleImpl: "FourByFourCubePuzzle" },
  minx: { longName: "Megaminx", tnoodleImpl: "MegaminxPuzzle" },
  pyram: { longName: "Pyraminx", tnoodleImpl: "PyraminxPuzzle" },
  skewb: { longName: "Skewb", tnoodleImpl: "SkewbPuzzle" },
  sq1: { longName: "Square-1", tnoodleImpl: "SquareOnePuzzle" }
};

export enum ToolType {
  Recorder = "recorder",
  Stats = "stats",
  Preview = "preview"
}
