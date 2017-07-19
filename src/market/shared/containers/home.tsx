import * as React from 'react';
let { connect } = require('react-redux');
import { IState } from '../../State';
import { performSearchAll } from '../actions/thunkActions';
import { Home as HomeComponent} from '../components/home';
import { ensureAppData, ensureCuratedData, ensurePartnerData } from '../actions/thunkActions';
import { parseCuratedSections } from '../../shared/utils/hashMapUtils';

export const mapStateToProps = (state: IState, ownProps: any) => {
    let query = ownProps.location.query;

    return {
        featuredApps: parseCuratedSections(state.apps.curatedData['top'], state.apps.appData, state.apps.appIdMap)[0],
        searchID: state.search.searchIdCurrentlyOngoing,
        appSearchResults: state.apps.subsetData,
        partnerSearchResults: state.partners.subsetData,
        allApps: state.apps.appData,
        allPartners: state.partners.partnerData,
        searchQuery: state.apps.subsetSearchQuery,
        urlQuery: query,
        includeOfficeApps: state.config.includeOfficeApps
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        changeHandler: (searchText: string, searchID: number) => dispatch(performSearchAll(searchText)),
        ensureAppData: () => {
            return dispatch(ensureAppData());
        },
        ensurePartnerData: () => {
            return dispatch(ensurePartnerData());
        },
        ensureCuratedData: () => {
            return dispatch(ensureCuratedData());
        }
    };
};

const Home = connect(
    mapStateToProps,
    mapDispatchToProps
)(HomeComponent);

export default Home as React.StatelessComponent<any>;

Home.ensureAsyncData = (dispatch: any) => {
    return Promise.all([dispatch(ensureAppData(true)), dispatch(ensureCuratedData(true)), dispatch(ensurePartnerData())]);
};
