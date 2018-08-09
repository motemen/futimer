import { Reducer, combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

import { Actions, ActionTypes } from '../actions';
import { StoreState } from '../types';

export const current: Reducer = (state: StoreState['current'] = { session: { puzzle: '333', records: [] } }, action: Actions): StoreState['current'] => {
  if (action.type === ActionTypes.UPDATE_SCRAMBLE) { 
    return {
      ...state,
      scramble: action.payload.scramble,
    };
  }

  if (action.type === ActionTypes.RECORD_ATTEMPT) {
    if (!state.scramble) {
      return state;
    }

    return {
      ...state,
      scramble: undefined,
      session: {
        ...state.session,
        records: [ ...state.session.records, action.payload.record ]
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
  if (action.type === ActionTypes.CREATE_NEW_SESSION) {
    const currentSession = state.current.session;

    return {
      ...state,
      current: {
        ...state.current,
        session: {
          puzzle: currentSession.puzzle,
          records: [],
        }
      },
      results: currentSession.records.length ? [
        {
          isSynced: false,
          session: {
            ...currentSession,
            name: new Date(currentSession.records[0].timestamp).toLocaleString(),
          },
        },
        ...state.results,
      ] : state.results,
    };
  }

  if (action.type === ActionTypes.CHANGE_PUZZLE_TYPE) {
    return {
      ...state,
      current: {
        ...state.current,
        session: {
          puzzle: action.payload.puzzle,
          records: [],
        }
      },
      results: [
        {
          isSynced: false,
          session: state.current.session,
        },
        ...state.results,
      ]
    };

  }

  return state;
};

export const reducer = reduceReducers(
  root,
  combineReducers({ current, sync, auth, results }),
);