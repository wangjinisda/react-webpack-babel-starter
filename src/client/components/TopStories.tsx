import { connect } from 'react-redux'
import * as React from 'react'
import Story from './Story'

import { fetchTopStoriesAsync } from '../actions/HackerNews'
let Helmet =require('react-helmet');


class TopStories extends React.Component<any, any>{

  componentDidMount() {
    if (!this.props.stories.data.length) {
      this.props.dispatch(fetchTopStoriesAsync())
    }
  }

  render(){
    let loading = '';

    if (this.props.stories.loading) {
      loading = 'loading...'
    }

    return (
      <div>
        <Helmet title="Top Stories" />
        <h1>Top Stories</h1>
        <div>{ loading }</div>
        <div>
          { this.props.stories.data.map((story: any, index: any) => <Story key={index} {...story} />) }
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {

  return {

    stories: state.topStories

  }

}


export default connect(mapStateToProps)(TopStories)
