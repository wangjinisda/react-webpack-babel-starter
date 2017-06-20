import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import { topStoriesReducer } from './HackerNews'
import { appReducer } from './App'

export default combineReducers({
  app: appReducer,
  topStories: topStoriesReducer,
  routing: routerReducer
})
