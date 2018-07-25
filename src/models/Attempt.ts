import { generateScramble } from '../TNoodle';

export enum AttemptState {
    SCRAMBLING,
    READY,
    DONE,
}

export interface AttemptResult {
    time: number; // seconds
    penalty: number; // seconds
    didNotFinish: boolean;
}

export class Attempt {
    public scramble: string | null;
    public result: AttemptResult | null;

    public doneScramble: Promise<string>;

    get state(): AttemptState {
        if (this.scramble === null) {
            return AttemptState.SCRAMBLING;
        } else if (this.result === null) {
            return AttemptState.READY;
        } else {
            return AttemptState.DONE;
        }
    }

    constructor() {
        this.doneScramble = generateScramble().then((scramble) => {
            return this.scramble = scramble;
        });
    }
}

export function createAttempt(): Attempt {
    return new Attempt();
}