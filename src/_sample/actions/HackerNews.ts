let fetch =require('isomorphic-fetch');

const apiBase = 'https://hacker-news.firebaseio.com/v0/';

export function fetchTopStories() {
  return { type: 'FETCH_TOP_STORIES' }
}

export function fetchTopStoriesSuccess(data: any) {
  return { type: 'FETCH_TOP_STORIES_SUCCESS', data }
}

export function fetchTopStoriesError(error: any) {
  return { type: 'FETCH_TOP_STORIES_ERROR', error }
}

function fetchItem(id: any) {
  return fetch(`${apiBase}/item/${id}.json`)
    .then( (res: any) => res.json());
}

function fetchAll(data: any) {
  return Promise.all(data.map( (id: any) => fetchItem(id)));
}

export function fetchTopStoriesAsync() {

  return (dispatch: any) => {

    dispatch(fetchTopStories())

    return fetch(`${apiBase}/topstories.json?limitToFirst=10&orderBy="$key"`)
      .then((res: any) => res.json())
      .then((data: any) => fetchAll(data))
      .then((data: any) => dispatch(fetchTopStoriesSuccess(data)))
      .catch((error: any) => dispatch(fetchTopStoriesError(error)))
  }

}
