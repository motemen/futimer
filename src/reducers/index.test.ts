import { reducer } from ".";
import { Action } from "../actions";
import { StoreState } from "../types";
import { ToolType } from "../models";

test("createNewSession", () => {
  let state: StoreState = {
    current: {
      session: {
        puzzleType: "333",
        records: [
          {
            timestamp: 0,
            scramble: "R U R",
            time: 10.0
          }
        ]
      }
    },
    sync: { isSyncing: false },
    auth: {},
    results: [],
    tool: { selected: ToolType.Stats }
  };
  state = reducer(state, Action.createNewSession());
  expect(state).toEqual({
    ...state,
    current: {
      scramble: undefined,
      session: {
        puzzleType: "333",
        records: []
      }
    },
    results: [
      {
        isSynced: false,
        session: {
          name: new Date(0).toLocaleString(),
          puzzleType: "333",
          records: [{ scramble: "R U R", time: 10.0, timestamp: 0 }]
        }
      }
    ]
  });
});
