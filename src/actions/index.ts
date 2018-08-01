import { SyncRecords } from '../services/SyncRecords';
import { StoreState } from '../types';

import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';

export enum ActionTypes {
  RESET_ATTEMPT = 'RESET_ATTEMPT',
  RECORD_ATTEMPT = 'RECORD_ATTEMPT',
  START_RECORDS_UPLOAD = 'START_RECORDS_UPLOAD',
  FINISH_RECORDS_UPLOAD = 'FINISH_RECORDS_UPLOAD',
  UPDATE_SYNC_SPREADSHEET_ID = 'SET_SYNC_SPREADSHEET_ID',
  UPDATE_IS_AUTHED = 'UPDATE_IS_AUTHED',
}

export const Actions = {
  recordAttempt: (payload: { time: number, timestamp: number }) => createAction(ActionTypes.RECORD_ATTEMPT, payload),
  resetAttempt: () => createAction(ActionTypes.RESET_ATTEMPT),

  finishRecordsUpload: (payload: { lastSynced?: number }) => createAction(ActionTypes.FINISH_RECORDS_UPLOAD, payload),
  startRecordsUpload: () => createAction(ActionTypes.START_RECORDS_UPLOAD),
  updateSyncSpreadsheetId: (payload: { spreadsheetId: string }) => createAction(ActionTypes.UPDATE_SYNC_SPREADSHEET_ID, payload),

  updateIsAuthed: (payload: { isAuthed: boolean }) => createAction(ActionTypes.UPDATE_IS_AUTHED, payload),
};

export const AsyncActions = {
  syncRecords: () => async (dispatch: Dispatch<Actions>, getState: () => StoreState) => {
    const { googleAPI, sync, results } = getState();
    if (sync.isSyncing) {
      return;
    }

    const service = new SyncRecords(googleAPI);

    let spreadsheetId = sync.spreadsheetId;
    if (!spreadsheetId) {
      const file = await service.getFile();
      spreadsheetId = file.id!;
      dispatch(Actions.updateSyncSpreadsheetId({ spreadsheetId }));
    }

    const resultsToSync = results.filter((result) => result.timestamp > (sync.lastSynced || 0));
    if (resultsToSync.length === 0) {
      return;
    }

    dispatch(Actions.startRecordsUpload());

    try {
      await service.uploadRecords(spreadsheetId, resultsToSync);
      dispatch(Actions.finishRecordsUpload({ lastSynced: resultsToSync[resultsToSync.length - 1].timestamp }));
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error('syncRecords', err);
      dispatch(Actions.finishRecordsUpload({ lastSynced: sync.lastSynced }));
    }
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