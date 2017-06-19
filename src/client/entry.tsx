import * as React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import Routes from './routes';
import { reducer } from './reducers'
import App from "./components/App";
import { appHistory, initRouterHistory } from './routerHistory';
let { Router, Route, browserHistory } = require('react-router');

const { createLogger } = require('redux-logger');
const rootEl = document.getElementById("root");

const middleware = [ thunk ]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

initRouterHistory();

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)


render(
  <Provider store={store}>
    <Router routes={Routes(store.dispatch)} history={appHistory} />
  </Provider>,
  rootEl
)