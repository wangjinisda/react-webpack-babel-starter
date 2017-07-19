import {
    Action,
    isType,
    SearchboxInputChangedAction,
    SearchResultsReceivedAction,
    LiveSearchboxFilterAction
} from './../actions/actions';
import {
    ISearchState,
    initialSearchState,
    copyState
} from './../../State';
import { IPartnerSearchResult } from '../Models';
import { getProductLongTitleFromDisplayName } from '../utils/appUtils';
// import { convertAppSearchResult } from 'utils/search';
import { convertAppSearchResult } from './../../mac/utils/search';

export default function searchReducer(state: ISearchState = initialSearchState, action: Action<any>): ISearchState {
    let newState = copyState(state);
    if (isType(action, SearchboxInputChangedAction)) {

        // search box is being searched
        newState.searchText = action.payload.searchString;

        // leave the search results be, since they will be updated when new search results come in
        // however, when the dropdown is emptied out, clear the results.
        if (newState.searchText.length === 0) {
            newState.appSearchResults = [];
            newState.partnerSearchResults = [];
        }

        // make sure we only react to the latest request
        newState.searchIdCurrentlyOngoing = state.searchIdCurrentlyOngoing + 1;

    } else if (isType(action, LiveSearchboxFilterAction)) {
        newState.searchText = action.payload.searchText;
    } else if (isType(action, SearchResultsReceivedAction)) {
        // we have received results from the backend

        // check if we care or want to drop this on the floor
        if (newState.searchIdCurrentlyOngoing === action.payload.searchid) {
            // reset
            newState.searchIdCurrentlyOngoing = -1;

            // build up search results
            let appResults = action.payload.appSearchResults;
            let partnerResults = action.payload.partnerSearchResults;

            if (appResults === undefined && partnerResults === undefined) {
                console.log('discarding search results because results is undefined!');
                return newState;
            }

            let buildResults = function<Source, Target>(rawResults: Source[], map: (a: Source) => Target) {
                let convertedResults: Target[] = [];
                if (rawResults) {
                    for (let i = 0; i < 10 && i < rawResults.length; i++) {
                        // todo: we should be getting id's as well from api
                        convertedResults.push(map(rawResults[i]));
                    }
                }
                return convertedResults;
            };
            
            newState.appSearchResults = buildResults<any, any>(appResults, convertAppSearchResult);

            let partnerConversion: (p: any) => IPartnerSearchResult = (partner: any) => ({
                id: partner.FriendlyURL,
                logo: partner.SmallIconUri,
                text: partner.Title,
                product: partner.Products.map(function (x: any) { return getProductLongTitleFromDisplayName(x); }).join(','),
                type: 'PartnerSearchResult'
            });
            newState.partnerSearchResults = buildResults(partnerResults, partnerConversion);
        } else {
            console.log('discarding search results because another request was already sent!');
            return state;
        }
    } else {
        return state;
    }

    return newState;
}
