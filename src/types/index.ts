import { GoogleAPI } from '../gateways/GoogleAPI';
import { Attempt, Result } from '../models';

export interface StoreState {
  currentAttempt?: Attempt;
  results: Result[];

  auth: {
    isAuthed?: boolean;
  };

  sync: {
    isSyncing: boolean;
    lastSynced?: number;
    spreadsheetId?: string;
  };

  googleAPI: GoogleAPI;
}

export enum SyncState {
  NOT_LOGGED_IN,
  READY,
  IN_PROGRESS,
}