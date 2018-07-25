import { createAction } from 'redux-actions';

export const resetAttempt = createAction('RESET_ATTEMPT');

export const recordAttempt = createAction('RECORD_ATTEMPT');

export type Action = ReturnType<typeof resetAttempt> | ReturnType<typeof recordAttempt>;