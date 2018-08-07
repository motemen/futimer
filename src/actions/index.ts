import { SyncRecords } from '../services/SyncRecords';
import { StoreState } from '../types';
import { googleAPI } from '../gateways/GoogleAPI';

import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export enum ActionTypes {
  RESET_ATTEMPT = 'RESET_ATTEMPT',
  RECORD_ATTEMPT = 'RECORD_ATTEMPT',
  DELETE_RECORD = 'DELETE_RECORD',
  START_RECORDS_UPLOAD = 'START_RECORDS_UPLOAD',
  FINISH_RECORDS_UPLOAD = 'FINISH_RECORDS_UPLOAD',
  UPDATE_SYNC_SPREADSHEET_ID = 'SET_SYNC_SPREADSHEET_ID',
  UPDATE_IS_AUTHED = 'UPDATE_IS_AUTHED',
  CREATE_NEW_SESSION = 'CREATE_NEW_SESSION',
  UPDATE_SESSION_IS_SYNCED = 'UPDATE_SESSION_IS_SYNCED',
}

export const Actions = {
  recordAttempt: (payload: { time: number, timestamp: number }) => createAction(ActionTypes.RECORD_ATTEMPT, payload),
  resetAttempt: () => createAction(ActionTypes.RESET_ATTEMPT),

  deleteRecord: (payload: { sessionIndex: number; recordIndex: number; }) => createAction(ActionTypes.DELETE_RECORD, payload),

  createNewSession: () => createAction(ActionTypes.CREATE_NEW_SESSION),

  startRecordsUpload: () => createAction(ActionTypes.START_RECORDS_UPLOAD),
  finishRecordsUpload: () => createAction(ActionTypes.FINISH_RECORDS_UPLOAD),
  updateSessionIsSynced: (payload: { index: number, isSynced: boolean }) => createAction(ActionTypes.UPDATE_SESSION_IS_SYNCED, payload),
  updateSyncSpreadsheetId: (payload: { spreadsheetId: string }) => createAction(ActionTypes.UPDATE_SYNC_SPREADSHEET_ID, payload),

  updateIsAuthed: (payload: { isAuthed: boolean }) => createAction(ActionTypes.UPDATE_IS_AUTHED, payload),
};

export const AsyncActions = {
  syncRecords: () => async (dispatch: Dispatch<Actions>, getState: () => StoreState) => {
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
      dispatch(Actions.updateSyncSpreadsheetId({ spreadsheetId }));
    }

    const sessionsToSync = results.map(
      ({ session, isSynced }, index) => ({ records: session.records, isSynced, index })
    ).filter(({ isSynced }) => !isSynced);
    if (sessionsToSync.length === 0) {
      return;
    }

    dispatch(Actions.startRecordsUpload());

    for (const session of sessionsToSync) {
      await service.uploadRecords(spreadsheetId, session.records);
      dispatch(Actions.updateSessionIsSynced({ index: session.index, isSynced: true }));
    }

    dispatch(Actions.finishRecordsUpload());
  },
}

export type Actions = ReturnType<typeof Actions[keyof typeof Actions]>;

export type AsyncActions = ThunkAction<void, StoreState, undefined, Actions>;

export type PayloadType<A extends typeof Actions[keyof typeof Actions]> = ReturnType<A> extends { payload: infer P } ? P : never;

function createAction<T extends string>(type: T): Action<T, never>
function createAction<T extends string, P>(type: T, payload: P): Action<T, P>;
function createAction<T extends string, P>(type: T, payload?: P) {
  return payload ? { type, payload } : { type };
}
export interface Action<T, P> {
  type: T;
  payload: P;
}