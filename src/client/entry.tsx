import * as React from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { reducer } from './reducers'
import App from "./components/App";
const { createLogger } = require('redux-logger');
const rootEl = document.getElementById("root");

const middleware = [ thunk ]
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger())
}

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
)


render(
    
  <Provider store={store}>
    <App />
  </Provider>,
  rootEl
)