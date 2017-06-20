import fetch from 'isomorphic-fetch';

const apiBase = 'https://hacker-news.firebaseio.com/v0/';

export function fetchTopStories() {
  return { type: 'FETCH_TOP_STORIES' }
}

export function fetchTopStoriesSuccess(data) {
  return { type: 'FETCH_TOP_STORIES_SUCCESS', data }
}

export function fetchTopStoriesError(error) {
  return { type: 'FETCH_TOP_STORIES_ERROR', error }
}

function fetchItem(id) {
  return fetch(`${apiBase}/item/${id}.json`)
    .then(res => res.json());
}

function fetchAll(data) {
  return Promise.all(data.map(id => fetchItem(id)));
}

export function fetchTopStoriesAsync() {

  return dispatch => {

    dispatch(fetchTopStories())

    return fetch(`${apiBase}/topstories.json?limitToFirst=10&orderBy="$key"`)
      .then(res => res.json())
      .then(data => fetchAll(data))
      .then(data => dispatch(fetchTopStoriesSuccess(data)))
      .catch(error => dispatch(fetchTopStoriesError(error)))
  }

}
