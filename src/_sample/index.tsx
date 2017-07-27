require('es6-promise').polyfill()

import * as React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
import { appHistory, historyCreator } from './../market/shared/routerHistory'

import { configureStore } from './store'

import routes from './routes'
let { Router, browserHistory } = require('react-router');

// import { Router, browserHistory } from 'react-router';
declare var window: any;

let initialState = window.__INITIAL_STATE__;

delete window.__INITIAL_STATE__;

const store = configureStore(browserHistory, initialState)
const history = historyCreator(store)(browserHistory)

render(
  <Provider store={store}>
    <Router history={history} >
      {routes}
    </Router>
  </Provider>
  , document.getElementById('root'))
