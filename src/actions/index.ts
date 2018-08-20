import { SyncRecords } from '../services/SyncRecords';
import { StoreState } from '../types';
import { googleAPI } from '../gateways/GoogleAPI';

import { Dispatch } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { PuzzleType, Record, ToolType } from '../models';
import { generateScramble } from '../TNoodle';

export enum ActionTypes {
  UPDATE_SCRAMBLE = 'UPDATE_SCRAMBLE',
  RECORD_ATTEMPT = 'RECORD_ATTEMPT',
  DELETE_RECORD = 'DELETE_RECORD',
  START_RECORDS_UPLOAD = 'START_RECORDS_UPLOAD',
  FINISH_RECORDS_UPLOAD = 'FINISH_RECORDS_UPLOAD',
  UPDATE_SYNC_SPREADSHEET_ID = 'SET_SYNC_SPREADSHEET_ID',
  UPDATE_IS_AUTHED = 'UPDATE_IS_AUTHED',
  CREATE_NEW_SESSION = 'CREATE_NEW_SESSION',
  UPDATE_SESSION_IS_SYNCED = 'UPDATE_SESSION_IS_SYNCED',
  CHANGE_PUZZLE_TYPE = 'CHANGE_PUZZLE_TYPE',
  CHANGE_TOOL_TYPE = 'CHANGE_TOOL_TYPE',
}

export const Action = {
  recordAttempt: (payload: { record: Record }) => createAction(ActionTypes.RECORD_ATTEMPT, payload),

  updateScramble: (payload: { scramble: string }) => createAction(ActionTypes.UPDATE_SCRAMBLE, payload),

  deleteRecord: (payload: { sessionIndex: number; recordIndex: number; }) => createAction(ActionTypes.DELETE_RECORD, payload),

  createNewSession: () => createAction(ActionTypes.CREATE_NEW_SESSION),

  startRecordsUpload: () => createAction(ActionTypes.START_RECORDS_UPLOAD),
  finishRecordsUpload: () => createAction(ActionTypes.FINISH_RECORDS_UPLOAD),
  updateSessionIsSynced: (payload: { index: number, isSynced: boolean }) => createAction(ActionTypes.UPDATE_SESSION_IS_SYNCED, payload),
  updateSyncSpreadsheetId: (payload: { spreadsheetId: string }) => createAction(ActionTypes.UPDATE_SYNC_SPREADSHEET_ID, payload),

  updateIsAuthed: (payload: { isAuthed: boolean }) => createAction(ActionTypes.UPDATE_IS_AUTHED, payload),

  changePuzzleType: (payload: { puzzle: PuzzleType }) => createAction(ActionTypes.CHANGE_PUZZLE_TYPE, payload),

  changeToolType: (payload: { toolType: ToolType }) => createAction(ActionTypes.CHANGE_TOOL_TYPE, payload),
};

export const AsyncAction = {
  syncRecords: () => async (dispatch: Dispatch<Action>, getState: () => StoreState) => {
    const { sync, results } = getState();
    if (sync.isSyncing) {
      return;
    }

    await googleAPI.signIn();

    const service = new SyncRecords(googleAPI);

    let spreadsheetId = sync.spreadsheetId;
    if (!spreadsheetId) {
      const file = await service.getFile();
      spreadsheetId = file.id!;
      dispatch(Action.updateSyncSpreadsheetId({ spreadsheetId }));
    }

    const sessionsToSync = results.map(
      ({ session, isSynced }, index) => ({ ...session, isSynced, index })
    ).filter(({ isSynced }) => !isSynced);
    if (sessionsToSync.length === 0) {
      return;
    }

    dispatch(Action.startRecordsUpload());

    for (const session of sessionsToSync) {
      await service.uploadSession(spreadsheetId, session);
      dispatch(Action.updateSessionIsSynced({ index: session.index, isSynced: true }));
    }

    dispatch(Action.finishRecordsUpload());
  },

  resetScramble: () => (dispatch: Dispatch<Action>, getState: () => StoreState) => {
    const { current: { session: { puzzleType } } } = getState();
    setImmediate(() => {
      generateScramble(puzzleType).then((scramble) => {
        dispatch(Action.updateScramble({ scramble }));
      });
    });
  },
  
  commitRecord: (payload: { record: Record }) => (dispatch: ThunkDispatch<StoreState, never, Action>, getState: () => StoreState) => {
    dispatch(Action.recordAttempt(payload));
    dispatch(AsyncAction.resetScramble());
  },

  changePuzzleType: (payload: { puzzle: PuzzleType }) => (dispatch: ThunkDispatch<StoreState, never, Action>) => {
    dispatch(Action.changePuzzleType(payload));
    dispatch(AsyncAction.resetScramble());
  }
}

export type Action = ReturnType<typeof Action[keyof typeof Action]>;

export type AsyncAction = ThunkAction<void, StoreState, never, Action>;

export type Dispatch = ThunkDispatch<StoreState, never, Action>;

export type PayloadType<A extends typeof Action[keyof typeof Action]> = ReturnType<A> extends { payload: infer P } ? P : never;

function createAction<T extends string>(type: T): ActionBase<T, never>
function createAction<T extends string, P>(type: T, payload: P): ActionBase<T, P>;
function createAction<T extends string, P>(type: T, payload?: P) {
  return payload ? { type, payload } : { type };
}
export interface ActionBase<T, P> {
  type: T;
  payload: P;
}