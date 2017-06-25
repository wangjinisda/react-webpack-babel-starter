import { connect } from 'react-redux'

import * as React from 'react'

class App extends React.Component<any, any> {
  render() {
    const app = this.props.app || {}
    return (
      <div>
        <h1>Welcome to {app.name}!</h1>
      </div>
    )

  }
}

const mapStateToProps = (state: any) => {
  return {
    app: state.app
  }
}

export default connect(mapStateToProps)(App)
