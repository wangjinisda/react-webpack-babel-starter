import * as reducers from './../../market/shared/reducers/reducers';
import { createStore, applyMiddleware, compose, combineReducers as combine } from 'redux';
import thunk from 'redux-thunk';
import combinedReducers from './../../market/shared/reducers/reducers';
let { routerMiddleware, routerReducer } = require('react-router-redux');

// let redux = require('redux');


export function configureStore(history: any, initialState: any) {
    const store = createStore(combine({
        ...combinedReducers,
        routing: routerReducer
    }), initialState,
        (compose as any)(
            applyMiddleware(thunk as any),
            //  routerMiddleware(history)
        )
    );

    return store;
}
