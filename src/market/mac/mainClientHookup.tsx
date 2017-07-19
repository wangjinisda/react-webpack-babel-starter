
// the hookup for the client, this is the code that gets executed when
// the client finally gets its bundle.js. At that point, the dom needs to be
// understood by react so it can take over from here on.

import * as React from 'react';
import { render } from 'react-dom';
let { Router } = require('react-router');
import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
let { Provider } = require('react-redux');
import combineReducers from '../shared/reducers/reducers';
import { appHistory, historyCreator } from '../shared/routerHistory';
import { getWindow } from '../shared/services/window';
import { logClientError, logInitialTelemetryEvents } from '../shared/utils/appUtils';
import { createRehydrateClientStateAction } from '../shared/actions/actions';
import { changeBillingRegion } from './actions/thunkActions';
import { loadTileData } from '../shared/actions/thunkActions';
import { initBrowserConfig } from '../shared/services/init/initBrowser';
import Routes from './routes';
import { decodeVulnerableDataInInitalState } from '../shared/utils/appUtils';
import * as ReactUtils from '../shared/utils/reactUtils';

declare var window: any;

let initialState = window.__INITIAL_STATE__;

decodeVulnerableDataInInitalState(initialState);

// Transform into Immutable.js collections,
// but leave top level keys untouched for Redux
// todo: doesn't work for me?
// Object
//   .keys(initialState)
//   .forEach(key => {
//     initialState[key] = fromJS(initialState[key]);
//    });

getWindow().onerror = (msg: string, file: string, line: string, col: string, error: any) => {
  try {
    logClientError(error, 'client side error: [From mainClientHookup] ' + msg + ' in file ' + file + ' on line: ' + line, file);
  } catch (err) {
    console.log('something went wrong during logging' + err);
  }
};

const store = createStore(combineReducers, initialState,
  (compose as any)(
    applyMiddleware(thunk as any),
    (typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : (f: any) => f)
  )
);

initBrowserConfig('azureMarketPlace', store);

// make sure we do not have consecutive front slashes
const href = getWindow().location.href;
const hrefWithoutConsecutiveSlashes = href.replace(/([^:]\/)\/+/g, '$1');
if (href !== hrefWithoutConsecutiveSlashes) {
  getWindow().location.href = hrefWithoutConsecutiveSlashes;
}

// This is required to create the singleton history object used below by the Router
// The same object will also be used for triggering navigations
// initRouterHistory();
historyCreator(store)();

// do not move this call around - it will take the current time as a measure of 'performance', so moving
// where we call this from is a breaking change (performance graphs will break)
logInitialTelemetryEvents(store);

store.dispatch(loadTileData()).then((result: any) => {
  store.dispatch(createRehydrateClientStateAction(null));
  store.dispatch(changeBillingRegion());

  render(
    <Provider store={store}>
      <Router routes={Routes(store.dispatch)} history={appHistory} />
    </Provider>,
    document.getElementById('react-view')
  );
  return Promise.resolve(result);
});

ReactUtils.processDelayLoadingImages();