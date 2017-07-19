// import { combineReducers } from 'redux';
let { combineReducers } = require('redux');
import searchReducer from './searchReducer';
import modalReducer from './modalReducer';
import appDataReducer from './appDataReducer';
import partnerDataReducer from './partnerDataReducer';
import userDataReducer from './userDataReducer';
import configReducer from './configReducer';
import testDriveReducer from './testDriveReducer';

// ordering matters here, we first update the filters and then the app data
export default combineReducers({
  search: searchReducer,
  modal: modalReducer,
  apps: appDataReducer,
  partners: partnerDataReducer,
  users: userDataReducer,
  config: configReducer,
  testDrive: testDriveReducer
});
