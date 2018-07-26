import { Reducer } from 'redux';

import { Actions, ActionTypes } from '../actions';
import { createAttempt } from '../models/Attempt';
import { StoreState } from '../types';

export const reducer: Reducer = (state: StoreState, action: Actions) => {
    if (action.type === ActionTypes.RESET_ATTEMPT) {
        return {
            ...state,
            currentAttempt: createAttempt(),
        };
    }

    if (action.type === ActionTypes.RECORD_ATTEMPT) {
        const { currentAttempt } = state;

        if (!currentAttempt) {
            return state;
        }

        currentAttempt.result = { time: action.payload.time };

        return {
            ...state,
            attempts: [ ...state.attempts, currentAttempt ],
            currentAttempt: createAttempt(),
        };
    }

    return state;
};