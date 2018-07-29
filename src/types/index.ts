import { GoogleAPI } from '../gateways/GoogleAPI';
import { Attempt, Result } from '../models/Attempt';

export interface StoreState {
    currentAttempt?: Attempt;
    results: Result[];
    googleAPI: GoogleAPI;
}

export enum SyncState {
    NOT_LOGGED_IN,
    READY,
    IN_PROGRESS,
}