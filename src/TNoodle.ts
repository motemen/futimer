import { PuzzleConfiguration } from './models';

type TNoodlePuzzles = Record<keyof typeof PuzzleConfiguration, TNoodlePuzzle>;

interface TNoodlePuzzle {
  generateScramble(): string;
}

const TNOODLE_LOAD_TIMEOUT = 30;

const puzzlesLoaded: Promise<TNoodlePuzzles> = new Promise<TNoodlePuzzles>((resolve, reject) => {
  (window as any).puzzlesLoaded = resolve;

  setTimeout(
    () => reject(`TNoodle load timeout after ${TNOODLE_LOAD_TIMEOUT}s`),
    TNOODLE_LOAD_TIMEOUT * 1000
  );

  import('tnoodle/tnoodle').catch(reject);
});

export function generateScramble(puzzleType: keyof TNoodlePuzzles): Promise<string> {
  return puzzlesLoaded.then((puzzle) => puzzle[puzzleType].generateScramble());
};