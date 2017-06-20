import React from 'react'
import Helmet from 'react-helmet'
import { Link } from 'react-router'

const MainLayout = React.createClass({

  render: function() {

    return (
      <div className="app">
        <Helmet
          titleTemplate="%s - Universal"
          title="Main page"
        />
        <header className="primary-header">HackerNews example</header>
        <aside className="primary-aside">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/topstories">Top Stories</Link></li>
            <li><Link to="/notfound">Not Found</Link></li>
          </ul>
        </aside>
        <main>
          { this.props.children }
        </main>
      </div>
    )
  }
})

export default MainLayout
