import { ThunkDispatch } from "redux-thunk";

import actionCreatorFactory from "typescript-fsa";

import { SyncRecords } from "../services/SyncRecords";
import { googleAPI } from "../gateways/GoogleAPI";
import { PuzzleType, Record, ToolType, StoreState } from "../models";
import { generateScramble } from "../TNoodle";

const createAction = actionCreatorFactory();

export const Actions = {
  recordAttempt: createAction<{ record: Record }>("RECORD_ATTEMPT"),
  updateScramble: createAction<{ scramble: string }>("UPDATE_SCRAMBLE"),
  deleteRecord: createAction<{ sessionIndex: number; recordIndex: number }>(
    "DELETE_RECORD"
  ),
  updateSessionIsSynced: createAction<{ index: number; isSynced: boolean }>(
    "UPDATE_SESSION_IS_SYNCED"
  ),
  updateSyncSpreadsheetId: createAction<{ spreadsheetId: string }>(
    "UPDATE_SYNC_SPREADSHEET_ID"
  ),
  updateIsAuthed: createAction<{ isAuthed: boolean }>("UPDATE_IS_AUTHED"),
  changePuzzleType: createAction<{ puzzle: PuzzleType }>("CHANGE_PUZZLE_TYPE"),
  changeToolType: createAction<{ toolType: ToolType }>("CHANGE_TOOL_TYPE"),
  changeIsPlaying: createAction<{ isPlaying: boolean }>("CHANGE_IS_PLAYING"),
  createNewSession: createAction("CREATE_NEW_SESSION"),
  startRecordsUpload: createAction("START_RECORDS_UPLOAD"),
  finishRecordsUpload: createAction("FINISH_RECORDS_UPLOAD"),
  deleteAllRecords: createAction("DELETE_ALL_RECORDS"),
};

export const AsyncAction = {
  syncRecords: () => async (dispatch: Dispatch, getState: () => StoreState) => {
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

    const sessionsToSync = results
      .map(({ session, isSynced }, index) => ({ ...session, isSynced, index }))
      .filter(({ isSynced }) => !isSynced);
    if (sessionsToSync.length === 0) {
      return;
    }

    dispatch(Actions.startRecordsUpload());

    for (const session of sessionsToSync) {
      await service.uploadSession(spreadsheetId, session);
      dispatch(
        Actions.updateSessionIsSynced({ index: session.index, isSynced: true })
      );
    }

    dispatch(Actions.finishRecordsUpload());
  },

  resetScramble: () => (dispatch: Dispatch, getState: () => StoreState) => {
    const {
      current: {
        session: { puzzleType },
      },
    } = getState();
    setImmediate(() => {
      generateScramble(puzzleType).then((scramble) => {
        dispatch(Actions.updateScramble({ scramble }));
      });
    });
  },

  commitRecord: (payload: { record: Record }) => (
    dispatch: ThunkDispatch<StoreState, never, Action>,
    getState: () => StoreState
  ) => {
    dispatch(Actions.recordAttempt(payload));
    dispatch(AsyncAction.resetScramble());
  },

  changePuzzleType: (payload: { puzzle: PuzzleType }) => (
    dispatch: ThunkDispatch<StoreState, never, Action>
  ) => {
    dispatch(Actions.changePuzzleType(payload));
    dispatch(AsyncAction.resetScramble());
  },
};

export type Action = ReturnType<typeof Actions[keyof typeof Actions]>;

export type Dispatch = ThunkDispatch<StoreState, never, Action>;
