import { GoogleAPI } from '../gateways/GoogleAPI';
import { Attempt, Result } from '../models';

export interface StoreState {
  currentAttempt?: Attempt;
  results: Result[];

  sync: {
    isSyncing: boolean;
    lastSynced?: number;
  };

  googleAPI: GoogleAPI;
}

export enum SyncState {
  NOT_LOGGED_IN,
  READY,
  IN_PROGRESS,
}