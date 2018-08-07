import { Reducer, combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

import { Actions, ActionTypes } from '../actions';
import { createAttempt } from '../models';
import { StoreState } from '../types';

export const current: Reducer = (state: StoreState['current'] = { session: { records: [] } }, action: Actions): StoreState['current'] => {
  if (action.type === ActionTypes.RESET_ATTEMPT) {
    return {
      ...state,
      attempt: createAttempt(),
    };
  }

  if (action.type === ActionTypes.RECORD_ATTEMPT) {
    const { attempt } = state;

    if (!attempt) {
      return state;
    }

    return {
      ...state,
      attempt: createAttempt(),
      session: {
        ...state.session,
        records: [...state.session.records, attempt.createResult(action.payload)]
      },
    };
  }

  return state;
}

export const sync: Reducer = (state: StoreState['sync'] = { isSyncing: false }, action: Actions): StoreState['sync'] => {
  if (action.type === ActionTypes.START_RECORDS_UPLOAD) {
    return {
      ...state,
      isSyncing: true,
    };
  }

  if (action.type === ActionTypes.FINISH_RECORDS_UPLOAD) {
    return {
      ...state,
      isSyncing: false,
    };
  }

  if (action.type === ActionTypes.UPDATE_SYNC_SPREADSHEET_ID) {
    return {
      ...state,
      spreadsheetId: action.payload.spreadsheetId,
    };
  }

  return state;
};

const results: Reducer = (state: StoreState['results'] = [], action: Actions): StoreState['results'] => {
  if (action.type === ActionTypes.DELETE_RECORD) {
    return state.map((result, i) => {
      if (i === action.payload.sessionIndex) {
        const records = result.session.records;
        records.splice(action.payload.recordIndex, 1);
        return {
          ...result,
          records,
        };
      }

      return result;
    });
  }

  if (action.type === ActionTypes.UPDATE_SESSION_IS_SYNCED) {
    return state.map((result, i) => {
      if (i === action.payload.index) {
        return {
          ...result,
          isSynced: action.payload.isSynced,
        };
      }

      return result;
    });
  }

  return state;
};

export const auth: Reducer = (state: StoreState['auth'] = {}, action: Actions): StoreState['auth'] => {
  if (action.type === ActionTypes.UPDATE_IS_AUTHED) {
    return {
      ...state,
      isAuthed: action.payload.isAuthed,
    };
  }

  return state;
};

export const root: Reducer = (state: StoreState, action: Actions): StoreState => {
  console.log(state, action);

  if (action.type === ActionTypes.CREATE_NEW_SESSION) {
    return {
      ...state,
      current: {
        ...state.current,
        session: {
          records: [],
        }
      },
      results: [
        ...state.results,
        {
          isSynced: false,
          session: state.current.session,
        },
      ]
    };
  }

  return state;
};

export const reducer = reduceReducers(
  root,
  combineReducers({ current, sync, auth, results }),
);