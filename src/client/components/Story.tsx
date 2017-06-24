import * as React from 'react'


class Story extends React.Component<any, any>{
  render() {
    return (
      <div>
        <div>{this.props.title}</div>
        <div>
          <a href={this.props.url}>{this.props.url}</a>
        </div>
        <hr />
      </div>
    )
  }
}

export default Story
