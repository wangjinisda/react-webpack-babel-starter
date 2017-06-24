require('es6-promise').polyfill()

import * as React from 'react'
import { render } from 'react-dom'

import { Provider } from 'react-redux'
let { Router, browserHistory } = require('react-router');
let { syncHistoryWithStore } = require('react-router-redux')

import { configureStore } from './store'
import routes from './routes'

let __INITIAL_STATE__ = {}
const store = configureStore(browserHistory, __INITIAL_STATE__)
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
, document.getElementById('root'))
