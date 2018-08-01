import { Reducer } from 'redux';

import { Actions, ActionTypes } from '../actions';
import { createAttempt } from '../models';
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

  // TODO: split to sync dedicated reducer and combine
  if (action.type === ActionTypes.START_RECORDS_UPLOAD) {
    return {
      ...state,
      sync: {
        ...state.sync,
        isSyncing: true,
      },
    };
  }

  if (action.type === ActionTypes.FINISH_RECORDS_UPLOAD) {
    return {
      ...state,
      sync: {
        ...state.sync,
        isSyncing: false,
        lastSynced: action.payload.lastSynced,
      },
    };
  }

  if (action.type === ActionTypes.UPDATE_SYNC_SPREADSHEET_ID) {
    return {
      ...state,
      sync: {
        ...state.sync,
        spreadsheetId: action.payload.spreadsheetId,
      },
    };
  }

  if (action.type === ActionTypes.UPDATE_IS_AUTHED) {
    return {
      ...state,
      auth: {
        isAuthed: action.payload.isAuthed,
      },
    };
  }

  return state;
};