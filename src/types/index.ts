import { Session } from '../models';

export interface StoreState {
  current: {
    scramble?: string;
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