require('es6-promise').polyfill()

import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import { configureStore } from './store'
import routes from './routes'

let __INITIAL_STATE__ = {}
const store = configureStore(browserHistory, __INITIAL_STATE__)
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
, document.getElementById('root'))
