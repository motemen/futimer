import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore, Reducer } from 'redux';
import { persistReducer, persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import persistStorage from 'redux-persist/lib/storage'
import thunkMiddleware from 'redux-thunk';

import { Action } from './actions';
import NavBar from './components/NavBar';
import Measurer from './components/Measurer';
import Results from './components/Results';
import { reducer } from './reducers';
import { StoreState } from './types';

import './App.css';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import { googleAPI, GoogleAPIEvents } from './gateways/GoogleAPI';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import { SyncRecords } from './services/SyncRecords';

googleAPI.on(
  GoogleAPIEvents.UPDATE_SIGNED_IN, async (signedIn) => {
    store.dispatch(Action.updateIsAuthed({ isAuthed: signedIn }))

    const { sync } = store.getState();
    if (!sync.spreadsheetId) {
      const syncRecords = new SyncRecords(googleAPI);
      const file = await syncRecords.getFile()
      store.dispatch(Action.updateSyncSpreadsheetId({ spreadsheetId: file.id! }));
    }
  },
);

const persistConfig = {
  debug: process.env.NODE_ENV !== 'production',
  key: 'root',
  storage: persistStorage,
  transforms: [
  ],
  whitelist: [ 'current', 'results' ],
};

const rootReducer: Reducer<StoreState> = persistReducer(persistConfig, reducer);

const store = createStore<StoreState, Action, {}, {}>(
  rootReducer,
  (((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose)(applyMiddleware(thunkMiddleware)),
);

const persister = persistStore(store);

(window as any).store = store;

const theme = createMuiTheme({
  palette: {
    primary: { main: '#ef0' }
  },
});

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      <PersistGate persistor={persister}>
        <NavBar />
        <Measurer />
        <Results />
      </PersistGate>
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();