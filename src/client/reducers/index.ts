import { combineReducers } from 'redux'
import { topStoriesReducer } from './HackerNews'
import { appReducer } from './App'

let { routerReducer } =require('react-router-redux')

export default combineReducers({
  app: appReducer,
  topStories: topStoriesReducer,
  routing: routerReducer
})
