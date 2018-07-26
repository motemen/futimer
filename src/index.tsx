import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { Actions } from './actions';
import Measurer from './containers/Measurer';
import Records from './containers/Records';
import { reducer } from './reducers';
import { StoreState } from './types';

import './index.css';
import registerServiceWorker from './registerServiceWorker';

const initialState: StoreState = { attempts: [] };
const store = createStore<StoreState, Actions, {}, {}>(reducer, initialState);

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Measurer />
      <Records />
    </div>
  </Provider>,
  document.getElementById('root') as HTMLElement
);

registerServiceWorker();