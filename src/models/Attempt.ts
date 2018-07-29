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

export class Attempt {
  public scramble: string | null;

  private getScrambleP?: Promise<string>;

  constructor() {
    this.getScramble();
  }

  public getScramble(): Promise<string> {
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