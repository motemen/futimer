import { Session } from '../models';

export interface StoreState {
  current: {
    scramble?: string;
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