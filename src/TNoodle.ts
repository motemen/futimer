import 'tnoodle/tnoodle';

interface TNoodlePuzzles {
  '333': TNoodlePuzzle;
}

interface TNoodlePuzzle {
  generateScramble(): string;
}

const TNOODLE_LOAD_TIMEOUT = 30;

const puzzlesLoaded: Promise<TNoodlePuzzles> = new Promise((resolve, reject) => {
  (window as any).puzzlesLoaded = resolve;

  setTimeout(
    () => reject(`TNoodle load timeout after ${TNOODLE_LOAD_TIMEOUT}s`),
    TNOODLE_LOAD_TIMEOUT * 1000
  );
});

export function generateScramble(puzzleType: keyof TNoodlePuzzles = '333'): Promise<string> {
  return puzzlesLoaded.then((puzzle) => puzzle[puzzleType].generateScramble());
};