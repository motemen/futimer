export const Actions = {
  recordAttempt: (payload: { time: number, timestamp: number }) => createAction(ActionTypes.RECORD_ATTEMPT, payload),
  resetAttempt: () => createAction(ActionTypes.RESET_ATTEMPT),
};

export type Actions = ReturnType<typeof Actions[keyof typeof Actions]>;

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

export enum ActionTypes {
  RESET_ATTEMPT = 'RESET_ATTEMPT',
  RECORD_ATTEMPT = 'RECORD_ATTEMPT',
}