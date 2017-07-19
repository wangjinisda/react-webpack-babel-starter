import {
    Action,
    isType,
    PartnerDataReceivedAction,
    CuratedPartnerDataReceivedAction,
    PartnerDetailsReceivedAction,
    DehydrateServerStateAction,
    RehydrateClientStateAction,
    SearchDataReceivedAction,
    TileDataReceivedAction
} from './../actions/actions';
import { IPartnerDataState, initialPartnerDataState, copyState, deepCopyDataMap } from './../../State';
import { buildFullSearchData } from './appDataReducer';
import { IPartnerDataItem } from './../Models';
// import { DataMap } from 'utils/dataMapping';
import { DataMap } from './../../mac/utils/dataMapping';
import { performFilter } from '../utils/filterModule';
import { generateHashMap } from '../../shared/utils/hashMapUtils';
// import { updateMatchFunctions } from 'utils/filterHelpers';
import { updateMatchFunctions } from './../../mac/utils/filterHelpers';

export default function partnerDataReducer(state: IPartnerDataState = initialPartnerDataState, action: Action<any>): IPartnerDataState {
    let newState = copyState(state);
    if (isType(action, TileDataReceivedAction)) {
        if (state.partnerData) {
            newState = action.payload.partners;

            let currentPartnerDetail: IPartnerDataItem = null;
            // If there is only one item in partnerData, it means the partner detail is loaded at server side.
            // So when partnerData is loaded with this lazy loaded tile data, we need to make sure the original partnerData item
            // with detail data is still preserved.            
            if (state.partnerData.length === 1) {
                currentPartnerDetail = state.partnerData[0];
            }

            for (let i = 0, len = newState.partnerData.length; i < len; i++) {
                if (currentPartnerDetail && newState.partnerData[i].partnerId === currentPartnerDetail.partnerId) {
                    newState.partnerData[i] = currentPartnerDetail;
                }
            }
        }
    } else if (isType(action, PartnerDataReceivedAction)) {
        // we have received filter data from the backend
        if (!state.partnerDataLoaded) {
            updateMatchFunctions(DataMap);
            let partners = action.payload.partnerData;
            performFilter({}, {}, partners, DataMap, true);
            newState.dataMap = deepCopyDataMap(DataMap);
            newState.partnerData = partners;
            newState.partnerIdMap = generateHashMap(newState.partnerData, ['partnerId']);
            newState.partnerDataLoaded = true;
        }
    } else if (isType(action, DehydrateServerStateAction)) {
        newState.dataMap = undefined;
        newState.partnerIdMap = undefined;
        if (action.payload.shouldDehydrateListData) {
            newState.partnerData = initialPartnerDataState.partnerData;

            if (state.temporaryInitialLoadingPartnerDetailData) {
                newState.partnerData = [state.temporaryInitialLoadingPartnerDetailData];
                newState.temporaryInitialLoadingPartnerDetailData = null;
            }
        }
    } else if (isType(action, RehydrateClientStateAction)) {
        updateMatchFunctions(DataMap);
        performFilter({}, {}, state.partnerData, DataMap, true);
        newState.dataMap = deepCopyDataMap(DataMap);
        newState.partnerIdMap = generateHashMap(state.partnerData, ['partnerId']);
    } else if (isType(action, CuratedPartnerDataReceivedAction)) {
        // we have received curated data from the backend
        if (!state.curatedDataLoaded) {
            newState.curatedData = action.payload.curatedData as any;
            newState.curatedDataLoaded = true;
        }
    } else if (isType(action, PartnerDetailsReceivedAction)) {
        let index = state.partnerIdMap[action.payload.partnerDetails.partnerId.toString().toLowerCase()];

        // please check the comments in the definition of temporaryInitialLoadingPartnerDetailData to the reason of the
        // following operation:
        newState.temporaryInitialLoadingPartnerDetailData = action.payload.partnerDetails;

        if (index >= 0) {
            let newData: IPartnerDataItem = null;

            if (action.payload.partnerDetails === null) {
                newData = JSON.parse(JSON.stringify(state.partnerData[index]));
                newData.detailLoadFailed = true;
            } else {
                newData = action.payload.partnerDetails;
            }

            let newDataList = state.partnerData.slice(0, index)
                .concat(newData)
                .concat(state.partnerData.slice(index + 1));
            newState.partnerData = newDataList;
        } else {
            // This will be called only once when there is no partnerdata in the server cache.
            // This called when partner details page is the landing page and it is the first page to be rendered by the server.
            // If we open home page before the partner details page is opened, then the partnerdata is populated into the cache.
            newState.partnerData = [action.payload.partnerDetails];
            newState.partnerIdMap = generateHashMap(newState.partnerData, ['partnerId']);
        }
    } else if (isType(action, SearchDataReceivedAction)) {
        newState.subsetData = [];
        let partners = action.payload.partnerIdData;
        if (partners.length <= 0 || !state.partnerDataLoaded) {
            return newState;
        }

        newState.subsetData = buildFullSearchData(partners, state.partnerData, state.partnerIdMap, 'FriendlyURL');
    } else {
        return state;
    }
    return newState;
}
