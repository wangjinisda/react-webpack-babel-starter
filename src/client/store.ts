import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'

import reducers from './reducers'

export function configureStore(history: any, initState: any) {

  return createStore(
    reducers, initState, applyMiddleware(thunk))
}
