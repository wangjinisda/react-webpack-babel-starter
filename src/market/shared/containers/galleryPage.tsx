import { IState } from '../../State';
import { Gallery } from '../components/galleryPage';
import { ensureAppData, ensureCuratedData, ensurePartnerData, ensureCuratedPartnerData } from '../actions/thunkActions';
import { createLiveSearchboxFilterAction } from '../actions/actions';
import { Constants } from '../utils/constants';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    let query = ownProps.location.query;

    let showPrivateApps = query.showPrivateApps;
    if (showPrivateApps) {
        showPrivateApps = showPrivateApps.toLowerCase() === 'true';
    }

    let tryParseInt = (val: string) => {
        let parsedVal = parseInt(val, 10);

        if (parsedVal === NaN) {
            parsedVal = null;
        }

        return parsedVal;
    };

    let galleryPage = tryParseInt(query.page);
    let pageSize = tryParseInt(query.pageSize);

    return {
        galleryPage: galleryPage,
        pageSize: pageSize,
        allApps: state.apps.appData,
        appSubsetData: state.apps.subsetData,
        appDataMap: state.apps.dataMap,
        allPartners: state.partners.partnerData,
        partnerSubsetData: state.partners.subsetData,
        partnerDataMap: state.partners.dataMap,
        subsetSearchQuery: state.apps.subsetSearchQuery,
        showPrivateApps: showPrivateApps,
        isEmbedded: state.config.isEmbedded,
        partnerAppDataLoaded: state.apps.partnerAppDataLoaded,
        embedHost: state.config.embedHost,
        galleryPageMode: state.config.currentView === 'partnerGallery' ? Constants.GalleryPageMode.Partners : Constants.GalleryPageMode.Apps,
        query: query,
        params: ownProps.params,
        includeOfficeApps: state.config.includeOfficeApps
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        ensureAppData: () => {
            return dispatch(ensureAppData(true));
        },
        ensureCuratedData: () => {
            return dispatch(ensureCuratedData());
        },
        embedSearchBoxHandler: (searchText: string) => {
            dispatch(createLiveSearchboxFilterAction({ searchText: searchText }));
        },
        ensurePartnerData: () => {
            return dispatch(ensurePartnerData());
        },
        ensureCuratedPartnerData: () => {
            return dispatch(ensureCuratedPartnerData());
        }
    };
};

const GalleryPageContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Gallery);

export const ensureAsyncData = (dispatch: any, getState: () => IState, params: any, request: any) => {
    return Promise.all([
        dispatch(ensureAppData(true)),
        dispatch(ensureCuratedData(true)),
        dispatch(ensurePartnerData()),
        dispatch(ensureCuratedPartnerData())]);
};

GalleryPageContainer.ensureAsyncData = ensureAsyncData;

export default GalleryPageContainer;
