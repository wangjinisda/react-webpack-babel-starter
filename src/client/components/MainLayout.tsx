import * as React from 'react'
let  Helmet = require('react-helmet');
import { Link } from 'react-router'


class MainLayout extends React.Component<any, any> {
  render() {
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
}


export default MainLayout
