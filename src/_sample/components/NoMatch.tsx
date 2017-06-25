import * as React from 'react'
let Helmet =require('react-helmet')


class NoMatch extends React.Component<any, any>{
  render() {
    return (
      <div>
        <Helmet title="Page not found" />
        <div> Page not found </div>
      </div>
    )
  }
}

export default NoMatch
