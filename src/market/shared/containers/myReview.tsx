import * as React from 'react';
import { IState } from '../../State';
import { IAppDataItem } from './../Models';
import { Review as MyReviewComponent } from '../components/myReview';
import { createRatingAction, createUserReviewUpdatedAction } from '../actions/actions';
let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        appList: state.apps.appData,
        userInfo: state.users
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        openRatingModal: (app: IAppDataItem, accessKey: string, ctaType: string, callback: any) => {
            return dispatch(createRatingAction({
                showModal: true,
                app: app,
                accessKey: accessKey,
                ctaType: ctaType,
                callback: callback
            }));
        },
        setUserReviewStatus: (hasReview: boolean) => {
             return dispatch(createUserReviewUpdatedAction(hasReview));
        }
    };
};


const MyReviews = connect(
    mapStateToProps,
    mapDispatchToProps
)(MyReviewComponent);
export default MyReviews as React.StatelessComponent<any>;
