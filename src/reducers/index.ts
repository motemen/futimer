import { Reducer, combineReducers } from "redux";

import {
  reducerWithInitialState,
  reducerWithoutInitialState
} from "typescript-fsa-reducers";

import { Actions } from "../actions";
import { StoreState } from "../types";
import { PuzzleType, Session, ToolType } from "../models";

import reduceReducers from "reduce-reducers";

const initialSession: Session = {
  puzzleType: "333",
  records: []
};

const deleteRecord = (session: Session, index: number): Session => {
  const records = session.records;
  records.splice(index, 1);
  return {
    ...session,
    records
  };
};

export const current = reducerWithInitialState<StoreState["current"]>({
  session: initialSession
})
  .case(Actions.deleteRecord, (state, { sessionIndex, recordIndex }) => {
    if (sessionIndex === -1) {
      return {
        ...state,
        session: deleteRecord(state.session, recordIndex)
      };
    }
    return state;
  })
  .case(Actions.updateScramble, (state, { scramble }) => {
    return {
      ...state,
      scramble
    };
  })
  .case(Actions.recordAttempt, (state, { record }) => {
    if (!state.scramble) {
      return state;
    }

    return {
      ...state,
      scramble: undefined,
      session: {
        ...state.session,
        records: [...state.session.records, record]
      }
    };
  });

export const sync = reducerWithInitialState<StoreState["sync"]>({
  isSyncing: false
})
  .case(Actions.startRecordsUpload, state => {
    return {
      ...state,
      isSyncing: true
    };
  })
  .case(Actions.finishRecordsUpload, state => {
    return {
      ...state,
      isSyncing: false
    };
  })
  .case(Actions.updateSyncSpreadsheetId, (state, { spreadsheetId }) => {
    return {
      ...state,
      spreadsheetId
    };
  });

const results = reducerWithInitialState<StoreState["results"]>([])
  .case(Actions.deleteRecord, (state, { sessionIndex, recordIndex }) => {
    return state
      .map((result, i) => {
        if (i === sessionIndex) {
          return {
            ...result,
            session: deleteRecord(result.session, recordIndex)
          };
        }

        return result;
      })
      .filter(({ session: { records } }) => {
        return records.length > 0;
      });
  })
  .case(Actions.updateSessionIsSynced, (state, { index, isSynced }) => {
    return state.map((result, i) => {
      if (i === index) {
        return {
          ...result,
          isSynced
        };
      }

      return result;
    });
  });

export const auth = reducerWithInitialState<StoreState["auth"]>({}).case(
  Actions.updateIsAuthed,
  (state, { isAuthed }) => {
    return {
      ...state,
      isAuthed
    };
  }
);

function saveSession(state: StoreState, puzzleType?: PuzzleType): StoreState {
  const currentSession = state.current.session;

  return {
    ...state,
    current: {
      ...state.current,
      scramble:
        (puzzleType || currentSession.puzzleType) === currentSession.puzzleType
          ? state.current.scramble
          : undefined,
      session: {
        puzzleType: puzzleType || currentSession.puzzleType,
        records: []
      }
    },
    results:
      currentSession.records.length === 0
        ? state.results
        : [
            {
              isSynced: false,
              session: {
                ...currentSession,
                name: new Date(
                  currentSession.records[0].timestamp
                ).toLocaleString()
              }
            },
            ...state.results
          ]
  };
}

export const tool = reducerWithInitialState<StoreState["tool"]>({
  selected: ToolType.Stats
}).case(Actions.changeToolType, (state, { toolType }) => {
  return {
    ...state,
    selected: toolType
  };
});

export const root = reducerWithoutInitialState<StoreState>()
  .case(Actions.changeIsPlaying, (state, { isPlaying }) => {
    return {
      ...state,
      isPlaying
    };
  })
  .case(Actions.createNewSession, state => {
    return saveSession(state);
  })
  .case(Actions.changePuzzleType, (state, { puzzle }) => {
    return saveSession(state, puzzle);
  });

export const reducer = reduceReducers(
  root,
  combineReducers({ current, sync, auth, results, tool })
) as Reducer<StoreState>;
