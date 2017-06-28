require('es6-promise').polyfill()

import * as React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
import { configureStore } from './store'

import routes from './routes'
import { appHistory, historyCreator } from './../_shared/routerHistory'

let { Router, browserHistory } = require('react-router');

let __INITIAL_STATE__ = {}
const store = configureStore(browserHistory, __INITIAL_STATE__)

const history = historyCreator(store)();
// const history = syncHistoryWithStore(browserHistory, store)

const css = require('./../jade/styles/App.scss');

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
, document.getElementById('root'))
