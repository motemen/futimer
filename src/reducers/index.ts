import { Reducer } from 'redux';

import { Actions, ActionTypes } from '../actions';
import { createAttempt } from '../models/Attempt';
import { StoreState } from '../types';

export const reducer: Reducer = (state: StoreState, action: Actions): StoreState => {
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

    return {
      ...state,
      currentAttempt: createAttempt(),
      results: [ ...state.results, currentAttempt.createResult(action.payload) ],
    };
  }

  return state;
};