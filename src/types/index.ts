import { Attempt, Session, GAME_CONFIGURATION } from '../models';

export interface StoreState {
  current: {
    game: keyof typeof GAME_CONFIGURATION;
    attempt?: Attempt; // TODO simply scramble?
    session: Session; // TODO move to results, or change to records: Record[]
  }

  results: Array<{
    isSynced: boolean;
    session: Session;
  }>;

  auth: {
    isAuthed?: boolean;
  };

  sync: {
    isSyncing: boolean;
    spreadsheetId?: string;
  };
}