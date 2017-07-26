import * as reducers from './../../market/shared/reducers/reducers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// let redux = require('redux');


export  let configStore = (initialState: any) : any =>{
    let store = createStore(reducers.default, initialState, applyMiddleware(thunk));
    return store; 
}

