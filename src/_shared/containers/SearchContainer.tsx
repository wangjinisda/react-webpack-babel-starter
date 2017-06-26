import * as React from 'react';
let { connect } = require('react-redux');
import { createSearchboxInputChangedAction } from '../actions/actions';
import { performSearch } from '../actions/thunkActions';
import { IState } from './../States/State';
import SearchComponent from './../components/SearchComponent';

export const mapStateToProps = (state: IState) => {
    return {
        searchID: state.search.searchIdCurrentlyOngoing,
        appSearchResults: state.search.appSearchResults,
        partnerSearchResults: state.search.partnerSearchResults,
        searchText: state.search.searchText,
        currentView: state.config.currentView,
        includeOfficeApps: state.config.includeOfficeApps
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        onPrePerformSearch: (searchvalue: string) => dispatch(createSearchboxInputChangedAction({ searchString: searchvalue })),
        onPerformSearch: (searchvalue: string, searchID: number, includeOfficeApps: boolean) => dispatch(performSearch(searchvalue, searchID, includeOfficeApps))
    };
};

const SearchContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchComponent);

export default SearchContainer as React.StatelessComponent<any>;
