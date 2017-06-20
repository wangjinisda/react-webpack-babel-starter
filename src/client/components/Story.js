import React from 'react'

const Story = React.createClass({

  render: function() {

    return (
      <div>
        <div>{ this.props.title }</div>
        <div>
          <a href={ this.props.url }>{ this.props.url }</a>
        </div>
        <hr/>
      </div>
    )
  }

})

export default Story
