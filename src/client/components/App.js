import { connect } from 'react-redux'

import React from 'react'

const App = React.createClass({

  render: function() {

    const app = this.props.app || {}

    return (
      <div>
        <h1>Welcome to {app.name}!</h1>
      </div>
    )
  }
})

const mapStateToProps = (state) => {
  return {
    app: state.app
  }
}

export default connect(mapStateToProps)(App)
