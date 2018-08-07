import { Attempt, Session } from '../models';

export interface StoreState {
  current: {
    attempt?: Attempt; // TODO simply scramble?
    session: Session;
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