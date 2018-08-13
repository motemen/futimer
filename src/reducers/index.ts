import { Reducer, combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';

import { Action, ActionTypes } from '../actions';
import { StoreState } from '../types';
import { PuzzleType, Session } from '../models';

const initialSession: Session = {
  puzzleType: '333',
  records: [],
};

const deleteRecord = (session: Session, index: number): Session => {
  const records = session.records;
  records.splice(index, 1)
  return {
    ...session,
    records,
  };
}

export const current: Reducer = (state: StoreState['current'] = { session: initialSession }, action: Action): StoreState['current'] => {
  if (action.type === ActionTypes.DELETE_RECORD) {
    if (action.payload.sessionIndex === -1) {
      return {
        ...state,
        session: deleteRecord(state.session, action.payload.recordIndex),
      };
    }
  }

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

export const sync: Reducer = (state: StoreState['sync'] = { isSyncing: false }, action: Action): StoreState['sync'] => {
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

const results: Reducer = (state: StoreState['results'] = [], action: Action): StoreState['results'] => {
  if (action.type === ActionTypes.DELETE_RECORD) {
    return state.map((result, i) => {
      if (i === action.payload.sessionIndex) {
        return {
          ...result,
          session: deleteRecord(result.session, action.payload.recordIndex),
        };
      }

      return result;
    }).filter(({ session: { records } }) => {
      return records.length > 0;
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

export const auth: Reducer = (state: StoreState['auth'] = {}, action: Action): StoreState['auth'] => {
  if (action.type === ActionTypes.UPDATE_IS_AUTHED) {
    return {
      ...state,
      isAuthed: action.payload.isAuthed,
    };
  }

  return state;
};

function saveSession(state: StoreState, puzzleType?: PuzzleType): StoreState {
    const currentSession = state.current.session;

    return {
      ...state,
      current: {
        ...state.current,
        scramble: (puzzleType || currentSession.puzzleType) === currentSession.puzzleType ? state.current.scramble : undefined,
        session: {
          puzzleType: puzzleType || currentSession.puzzleType,
          records: [],
        }
      },
      results: currentSession.records.length === 0 ? state.results : [
        {
          isSynced: false,
          session: {
            ...currentSession,
            name: new Date(currentSession.records[0].timestamp).toLocaleString(),
          },
        },
        ...state.results,
      ],
    };
}

export const root: Reducer = (state: StoreState, action: Action): StoreState => {
  if (action.type === ActionTypes.CREATE_NEW_SESSION) {
    return saveSession(state);
  }

  if (action.type === ActionTypes.CHANGE_PUZZLE_TYPE) {
    return saveSession(state, action.payload.puzzle);
  }

  return state;
};

export const reducer = reduceReducers(
  root,
  combineReducers({ current, sync, auth, results }),
);