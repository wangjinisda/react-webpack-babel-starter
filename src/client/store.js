import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import reducers from './reducers'

export function configureStore(history, initState) {

  return createStore(reducers, initState, applyMiddleware(thunk))
}
