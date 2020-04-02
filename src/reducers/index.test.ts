import { reducer } from ".";
import { Actions } from "../actions";
import { StoreState, initialState } from "../models";

test("createNewSession", () => {
  let state: StoreState = {
    ...initialState,
    current: {
      session: {
        puzzleType: "333",
        records: [
          {
            timestamp: 0,
            scramble: "R U R",
            time: 10.0,
          },
        ],
      },
    },
  };
  state = reducer(state, Actions.createNewSession());
  expect(state).toEqual({
    ...state,
    current: {
      scramble: undefined,
      session: {
        puzzleType: "333",
        records: [],
      },
    },
    results: [
      {
        isSynced: false,
        session: {
          name: new Date(0).toLocaleString(),
          puzzleType: "333",
          records: [{ scramble: "R U R", time: 10.0, timestamp: 0 }],
        },
      },
    ],
  });
});
