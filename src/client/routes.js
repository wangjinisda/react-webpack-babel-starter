import React from 'react'
import { Route, IndexRoute } from 'react-router'

import MainLayout from './components/MainLayout'
import App from './components/App'
import NoMatch from './components/NoMatch'
import TopStories from './components/TopStories'

const routes = (
  <Route path="/" component={MainLayout}>
    <IndexRoute component={App} />
    <Route path="topstories" component={TopStories} />
    <Route path="*" component={NoMatch} />
  </Route>
)

export default routes
