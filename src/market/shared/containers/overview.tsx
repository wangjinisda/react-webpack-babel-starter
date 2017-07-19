import * as React from 'react';
import { IState } from '../../State';
import { Overview as OverviewComponent } from '../components/overview';
import { createVideoModalAction } from '../actions/actions';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    return ownProps;
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        openVideoModal: (partnerId: string, videoUrl: string, videoThumbnail: string) =>
            dispatch(createVideoModalAction({
                showModal: true,
                videoThumbnail: videoThumbnail,
                videoUrl: videoUrl
            }))
    };
};

const Overview = connect(
    mapStateToProps,
    mapDispatchToProps
)(OverviewComponent);

export default Overview as React.StatelessComponent<any>;