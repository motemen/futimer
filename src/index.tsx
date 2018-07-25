import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { Action, resetAttempt } from './actions';
import Measurer from './containers/Measurer';
import { reducer } from './reducers';
import { StoreState } from './types';

import './index.css';
import registerServiceWorker from './registerServiceWorker';

const store = createStore<StoreState, Action, {}, {}>(reducer);
store.dispatch(resetAttempt());

(window as any).store = store;

ReactDOM.render(
  <Provider store={store}>
    <Measurer />
  </Provider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();