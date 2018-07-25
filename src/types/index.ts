import { Attempt } from '../models/Attempt';

export interface StoreState {
    currentAttempt?: Attempt;
    attempts: Attempt[];
}