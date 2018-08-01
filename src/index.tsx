import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Actions } from './actions';
import Measurer from './containers/Measurer';
import Records from './containers/Records';
import { reducer } from './reducers';
import { StoreState } from './types';

import './App.css';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { GoogleAPI, GoogleAPIEvents } from './gateways/GoogleAPI';

import { AppBar, createMuiTheme, MuiThemeProvider, Toolbar, Typography } from '@material-ui/core';
import { amber } from '@material-ui/core/colors'
import { SyncRecords } from './services/SyncRecords';

const googleAPI = new GoogleAPI({
  clientId: '757485369026-rvig0ollgq7h2jkc4sjae6pdc53affgf.apps.googleusercontent.com', // TODO make configurable
  discoveryDocs: [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  ],
  scope: 'https://www.googleapis.com/auth/drive.file',
});

googleAPI.on(
  GoogleAPIEvents.UPDATE_SIGNED_IN, async (signedIn) => {
    store.dispatch(Actions.updateIsAuthed({ isAuthed: signedIn }))

    const { sync } = store.getState();
    if (!sync.spreadsheetId) {
      const syncRecords = new SyncRecords(googleAPI);
      const file = await syncRecords.getFile()
      store.dispatch(Actions.updateSyncSpreadsheetId({ spreadsheetId: file.id! }));
    }
  },
);

const initialState: StoreState = {
  auth: {
  },
  googleAPI,
  results: [],
  sync: {
    isSyncing: false,
  },
};

const store = createStore<StoreState, Actions, {}, {}>(
  reducer,
  initialState,
  (((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose)(applyMiddleware(thunkMiddleware)),
);

(window as any).store = store;

const theme = createMuiTheme({
  palette: {
    primary: amber,
  },
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              CubeTimer
            </Typography>
          </Toolbar>
        </AppBar>
        <Measurer />
        <Records />
      </div>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();