import { generateScramble } from '../TNoodle';

export enum AttemptState {
  SCRAMBLING = 'SCRAMBLING',
  READY = 'READY',
  STARTED = 'STARTED',
}

export interface Result {
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

interface ResultStatsEntry {
  best: number;
  current: number;
  worst: number;
}

export function calcStats(results: Result[]): ResultStats {
  if (results.length === 0) {
    return {
      averageOf: {},
    };
  }

  const scores = results.map((result) => result.time);
  return {
    averageOf: [5, 12, 100].reduce((a, n) => {
      const aa = scores.length >= n ? variousAveragesOf(n, scores) : {};
      return { ...a, [n]: aa };
    }, {}),
    single: {
      best: Math.min(...scores),
      current: scores[scores.length - 1],
      worst: Math.max(...scores),
    },
  };
}

function averageOf(scores: number[]) {
  const sorted = scores.slice().sort((a, b) => a < b ? 1 : a > b ? -1 : 0);
  return sorted.slice(1, sorted.length - 1).reduce((a, b) => a + b, 0) / (scores.length - 2);
}

export function variousAveragesOf(n: number, scores: number[]): ResultStatsEntry {
  if (scores.length < n) {
    throw new Error(`not enough scores: ${scores.length} < ${n}`);
  }

  const { best, worst } = new Array(scores.length - n + 1).fill(null).map((_, i) => {
    return averageOf(scores.slice(i, i+n));
  }).reduce((curr, v) => {
    return {
      best: Math.min(v, curr.best),
      worst: Math.max(v, curr.worst),
    };
  }, { best: Number.MAX_VALUE, worst: Number.MIN_VALUE });

  return {
    best,
    current: averageOf(scores.slice(-5)),
    worst,
  };
}

export function formatDuration(n: undefined): undefined;
export function formatDuration(n: number): string;
export function formatDuration(n: number | undefined) {
  if (n === undefined)  {
    return undefined;
  }

  const subsecs = n.toString().split(/\./)[1] || '';
  const mins = Math.floor(n / 60);
  const secs = Math.floor(n % 60);

  const padLeft = (s: string, c: string): string => {
    if (s.length === 2) {
      return s;
    }
    return c + s;
  };
  
  return (mins ? `${mins}:` : '') + padLeft(secs.toString(), mins ? '0' : ' ') + '.' + (subsecs + '000').substring(0, 3);
}

export class Attempt {
  public scramble: string | null;

  // TODO: puzzleType e.g. '333'

  private getScrambleP?: Promise<string>;

  constructor() {
    this.getScramble();
  }

  public getScramble(): Promise<string> {
    if (this.scramble) {
      return Promise.resolve(this.scramble);
    }

    return (this.getScrambleP = this.getScrambleP || generateScramble().then((scramble) => {
      return this.scramble = scramble;
    }));
  }

  public createResult({ time, timestamp } : { time: number, timestamp: number }): Result {
    return {
      scramble: this.scramble!,
      time,
      timestamp,
    };
  }
}

export function createAttempt(): Attempt {
  return new Attempt();
}