import { handleActions } from 'redux-actions';

import * as actions from '../actions';
import { createAttempt } from '../models/Attempt';
import { StoreState } from '../types';

export const reducer = handleActions<StoreState, any>({
    [actions.resetAttempt.toString()](state: StoreState) {
        return {
            ...state,
            currentAttempt: createAttempt(),
        };
    },

    [actions.recordAttempt.toString()](state: StoreState) {
        if (!state.currentAttempt) {
            return state;
        }

        return {
            ...state,
            attempts: [ ...state.attempts, state.currentAttempt ],
            currentAttempt: createAttempt(),
        }
    },
}, { attempts: [] });