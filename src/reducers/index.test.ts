import { reducer } from '.';
import { Action } from '../actions';

test('createNewSession', () => {
  let state = {
    current: {
      session: {
        records: [{ scramble: 'R U R', time: 10.000 }]
      }
    },
    sync: { isSyncing: false },
    auth: {},
    results: [],
  }
  state = reducer(state, Action.createNewSession());
  expect(state).toEqual(
    {
      current: {
        session: {
          records: [],
        }
      },
      sync: { isSyncing: false },
      auth: {},
      results: [
        {
          isSynced: false,
          session: {
            records: [
              { scramble: 'R U R', time: 10.000 }
            ],
          },
        }
      ],
    }
  );
});