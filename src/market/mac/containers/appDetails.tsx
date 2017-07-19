import * as React from 'react';
import { IState } from '../../State';
import { AppDetails as AppDetailsComponent } from '../components/appDetails';
import { IAppDataItem } from '../Models';
import { getAppDetail, getAppPricing } from '../../shared/actions/thunkActions';
import { createModalAction, createVideoModalAction, createRatingAction } from '../../shared/actions/actions';
import { ProductEnum } from '../../shared/utils/dataMapping';
import * as embedHostUtils from '../../embed/embedHostUtils';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    // find the app in the app list

    // todo: consider sending down the index of the app as well, since we stored that :)
    let appList = state.apps.appData;
    let hashMap = state.apps.appIdMap;
    let targetApp: IAppDataItem = null;
    let query = ownProps.location ? ownProps.location.query : null;
    let appIndex = hashMap[ownProps.routeParams.appid.toString().toLowerCase()];

    if (appIndex >= 0) {
        targetApp = appList[appIndex];
    }

    let breadcrumbUrl = '/' + state.config.locale + '/marketplace/apps';
    if (state.config.breadcrumbUrl) {
        breadcrumbUrl = state.config.breadcrumbUrl;
    } else {
        if (state.config.isEmbedded && embedHostUtils.hasPrivateApps(state.config.embedHost)) {
            breadcrumbUrl += '?showPrivateApps=' + (ownProps.app && ownProps.app.privateApp ? 'true' : 'false');
        }
    }

    let tab = (query && query.tab) ? query.tab : null;

    return {
        app: targetApp,
        breadcrumbUrl: breadcrumbUrl,
        defaultTab: tab,
        isEmbedded: state.config.isEmbedded,
        embedHost: state.config.embedHost,
        nationalCloud: state.config.nationalCloud,
        billingCountryCode: state.config.billingCountryCode,
        firstPartyPricing: state.apps.firstPartyPricing
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        fetchAppDetails: (targetApp: IAppDataItem) =>
            dispatch(getAppDetail(targetApp.appid)),
        openModal: (modalId: number) =>
            dispatch(createModalAction({
                showModal: true,
                modalId: modalId
            })),
        openVideoModal: (appId: string, videoUrl: string, videoThumbnail: string) =>
            dispatch(createVideoModalAction({
                showModal: true,
                videoThumbnail: videoThumbnail,
                videoUrl: videoUrl
            })),
        openRatingModal: (app: IAppDataItem, accessKey: string, ctaType: string, callback: any) =>
            dispatch(createRatingAction({
                showModal: true,
                app: app,
                accessKey: accessKey,
                ctaType: ctaType,
                callback: callback
            })),
        fetchPricing: (appId: string) => dispatch(getAppPricing(appId))
    };
};

const AppDetails = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppDetailsComponent);

AppDetails.ensureAsyncData = (dispatch: any, getState: () => IState, params: any, request: any) => {
    let config = getState().config;
    // For PowerBI's embedded scenario, don't try to get the app details for the app,
    // instead they will be resolved once the data comes from PowerBI's backend
    if (config.isEmbedded && config.embedHost === ProductEnum['power-bi']) {
        return Promise.resolve();
    }

    return dispatch(getAppDetail(params.appid));
};

export default AppDetails as React.StatelessComponent<any>;