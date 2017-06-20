import React from 'react'
import Helmet from 'react-helmet'

const NoMatch = React.createClass({

  render: function() {
    return (
      <div>
        <Helmet title="Page not found" />
        <div> Page not found </div>
      </div>
    )
  }

})

export default NoMatch
