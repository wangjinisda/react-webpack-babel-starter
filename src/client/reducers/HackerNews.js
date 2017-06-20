export function topStoriesReducer(state, action) {

  if (state === undefined) {
    return { data: [] }
  }

  switch(action.type) {
    case 'FETCH_TOP_STORIES':
      return Object.assign({}, state, { loading: true })
    case 'FETCH_TOP_STORIES_SUCCESS':
      return Object.assign({}, state, { loading: false, data: action.data })
    case 'FETCH_TOP_STORIES_ERROR':
      return Object.assign({}, state, { loading: false, error: action.error })
    default:
      return state
  }

};
