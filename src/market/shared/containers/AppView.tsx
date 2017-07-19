import * as React from 'react';
let { connect } = require('react-redux');
import { IState } from '../../State';
import { urlPush, buildHref, IRouteConfig, getCurrentRelativeUrl } from '../routerHistory';
import { performSearchAll, getTileExtraData } from '../actions/thunkActions';
import {
    createSearchboxInputChangedAction, createSearchDataReceivedAction, createUserSignInAction,
    createModalAction, createVideoModalAction, createContactAction, createAppViewTelemetryLoggedAction,
    createRegisterTileExtraData
} from '../actions/actions';
import { AppView as AppViewComponent } from './../components/appView';
import { Constants } from '../utils/constants';
import { IAppDataItem } from '../Models';
import { createBreadcrumbAction } from '../actions/actions';

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        performedSubsetQueryString: state.apps.subsetSearchQuery,
        localizedStrings: state.config.locStrings,
        locale: state.config.locale,
        isEmbedded: state.config.isEmbedded,
        embedHost: state.config.embedHost,
        correlationId: state.config.correlationId,
        buildHref: function <T>(route: IRouteConfig<T>, routeParams: T, newQuery: {}, keepAllParams?: boolean) {
            return buildHref(route, ownProps.params, routeParams, ownProps.location.query, newQuery, keepAllParams, state.config.locale);
        },
        appId: state.modal.appId,
        showModal: state.modal.showModal,
        userInfo: state.users,
        isInErrorDialog: state.modal.modalId === Constants.ModalType.Error,
        telemetryLoggedCount: state.config.appViewTelemetryLoggedCount,
        nationalCloud: state.config.nationalCloud
    };
};

const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        changeSearchText: (searchvalue: string) => dispatch(createSearchboxInputChangedAction({ searchString: searchvalue })),
        performSearchAll: (searchvalue: string) => dispatch(performSearchAll(searchvalue)),
        clearSearch: () => dispatch(createSearchDataReceivedAction({ appIdData: [], partnerIdData: [], performedQuery: '' })),
        showCTAModal: (appId: string, ctaType: Constants.CTAType = Constants.CTAType.Create, skuId?: string) => {
            dispatch(createModalAction({
                showModal: true,
                modalId: Constants.ModalType.CTA,
                appId: appId,
                options: {
                    ctaType: ctaType,
                    skuId: skuId
                }
            }));
        },
        showContactModal: (partnerId: string, crossListingAppcontext?: IAppDataItem, callback?: any) => {
            dispatch(createContactAction({
                partnerId: partnerId,
                modalId: Constants.ModalType.Contact,
                callback: callback,
                showModal: true,
                crossListingAppContext: crossListingAppcontext
            }));
        },
        showHowItWorksModal: () => {
            dispatch(createVideoModalAction({
                showModal: true,
                videoThumbnail: null,
                videoUrl: 'https://aka.ms/spzavideo'
            }));
        },
        showErrorModal: () => {
            dispatch(createModalAction({
                showModal: true,
                modalId: Constants.ModalType.Error
            }));
        },
        showNPSModal: () => {
            dispatch(createModalAction({
                showModal: true,
                modalId: Constants.ModalType.NPS
            }));
        },
        autoSignIn: (userStore: any) => {
            dispatch(createUserSignInAction(userStore)); // This will trigger the action to update the user data in the state
        },
        updateTelemetryLoggedCount: () => dispatch(createAppViewTelemetryLoggedAction(null)),
        openTile: (detailUrl: string) => {
            let breadcrumbUrl = getCurrentRelativeUrl();
            dispatch(createBreadcrumbAction({
                breadcrumbUrl: breadcrumbUrl
            }));
            urlPush(detailUrl, true);
            return;
        },
        registerTileExtraDataHandler: (appData: IAppDataItem) => {
            dispatch(createRegisterTileExtraData({ appDatas: [appData] }));
        },
        getTileExtraDataHandler: (idList: { [id: string]: number }) => {
            dispatch(getTileExtraData(idList));
        }
    };
};

const AppView = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppViewComponent);

export default AppView as React.StatelessComponent<any>;
