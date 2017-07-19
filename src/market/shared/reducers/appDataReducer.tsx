import {
    Action,
    isType,
    AppDataReceivedAction,
    PowerBIDataReceivedAction,
    PartnerAppDataReceivedAction,
    CuratedDataReceivedAction,
    SearchDataReceivedAction,
    AppDetailsReceivedAction,
    DehydrateServerStateAction,
    RehydrateClientStateAction,
    AppPricingDataReceivedAction,
    FirstPartyPricingDataReceivedAction,
    LiveSearchboxFilterAction,
    TileDataReceivedAction,
    ExtraDataReceivedAction,
    RegisterTileExtraData,
    AppDetailPricingReceivedAction
} from './../actions/actions';
import { IAppDataState, initialAppDataState, copyState, deepCopyDataMap } from './../../State';
import { Constants } from './../utils/constants';
import { parsePBIApps } from '../../embed/reducers/pbiAppDataReducer';
import { parsePartnerApps } from '../../embed/reducers/partnerAppDataReducer';
import { IAppDataItem, ITelemetryData, PricingStates } from './../Models';
// import { ProductEnum, DataMap } from 'utils/dataMapping';
let { ProductEnum, DataMap } = require('./../../mac/utils/dataMapping');
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { generateHashMap } from '../utils/hashMapUtils';
import { performFilter } from '../utils/filterModule';
// import { updateMatchFunctions } from 'utils/filterHelpers';
import { updateMatchFunctions } from './../../mac/utils/filterHelpers';


export function buildFullSearchData<Source, Search>(ids: any[], sourceData: Source[], hashMap: { [id: string]: number; }, identifier: string) {
    let tempArray: Source[] = [];

    if (ids.length > 0) {
        // we care about showing the top 5 percent, which means that we will take the first result (highest score) and 
        // ignore everyone that is lower that 5% of that
        let cutoff: number = ids[0]['@search.score'] * 0.05;

        ids.forEach(function (id) {
            if (id['@search.score'] > cutoff) {
                let index = hashMap[id[identifier].toString().toLowerCase()];
                // make sure we actually understand the app
                if (index >= 0) {
                    tempArray.push(sourceData[index]);
                }
            }
        });
    }

    return tempArray;
}

export default function appDataReducer(state: IAppDataState = initialAppDataState, action: Action<any>): IAppDataState {
    let newState = copyState(state);
    if (isType(action, AppDataReceivedAction)) {
        // we have received filter data from the backend
        if (!state.appDataLoaded) {
            updateMatchFunctions(DataMap);
            let apps = action.payload.appData;
            performFilter({}, {}, apps, DataMap, true);
            newState.dataMap = deepCopyDataMap(DataMap);
            newState.appData = apps;
            newState.appIdMap = generateHashMap(newState.appData, ['appid']);
            if (state.appData && state.appData.length > 0) {
                state.appData.forEach((app) => {
                    let index = newState.appIdMap[app.appid];
                    if (index >= 0 && app.detailInformation) {
                        newState.appData[index] = app;
                    }
                });
            }
            newState.appDataLoaded = true;
        }
    } else if (isType(action, DehydrateServerStateAction)) {
        newState.dataMap = undefined;
        newState.appIdMap = undefined;
        if (action.payload.shouldDehydrateListData) {
            newState.appData = initialAppDataState.appData;

            if (state.temporaryInitialLoadingAppDetailData) {
                newState.appData = [state.temporaryInitialLoadingAppDetailData];
                newState.temporaryInitialLoadingAppDetailData = null;
            }
        }
    } else if (isType(action, RehydrateClientStateAction)) {
        updateMatchFunctions(DataMap);
        performFilter({}, {}, state.appData, DataMap, true);
        newState.dataMap = deepCopyDataMap(DataMap);
        newState.appIdMap = generateHashMap(state.appData, ['appid']);
    } else if (isType(action, FirstPartyPricingDataReceivedAction)) {
        newState.firstPartyPricing = action.payload;
    } else if (isType(action, AppPricingDataReceivedAction)) {
        if (!action.payload.pricingData || Object.keys(action.payload.pricingData).length === 0) {
            return state;
        }

        newState.appData = state.appData.map((app: any) => {
            let pricingData = action.payload.pricingData[app.appid];
            if (pricingData) {
                app.startingPrice = pricingData;
                if (!app.startingPrice.pricingData) {
                    app.startingPrice.pricingData = PricingStates.NoPricingData;
                }

                if (pricingData.pricingBitmask) {
                    Object.keys(pricingData.pricingBitmask)
                        .forEach((key) => {
                            app[key] = pricingData.pricingBitmask[key];
                        });
                }
            } else {
                (app as any).startingPrice = {
                    pricingData: PricingStates.NoPricingData
                };
            }
            return app;
        });

        updateMatchFunctions(DataMap);
        performFilter({}, {}, newState.appData, DataMap, true);
        newState.dataMap = deepCopyDataMap(DataMap);
    } else if (isType(action, PowerBIDataReceivedAction)) {
        if (action.payload.appData) {
            newState.appData = parsePBIApps(action.payload.appData);
            newState.appIdMap = generateHashMap(newState.appData, ['appid', 'friendlyURL']);
            newState.partnerAppDataLoaded = true;

            // This event is used to indicate that the Power BI data is fetched and parsing is done.
            let payload: ITelemetryData = {
                page: 'In App Gallery(PowerBI)',
                action: Constants.Telemetry.Action.PageLoad,
                actionModifier: Constants.Telemetry.ActionModifier.Info,
                details: '[End] PowerBI data parsing done'
            };
            SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
        }
    } else if (isType(action, TileDataReceivedAction)) {
        if (state.appData) {
            newState = action.payload.apps;

            let currentAppDetail: IAppDataItem = null;
            // If there is only one item in appData, it means the app detail is loaded at server side.
            // So when appData is loaded with this lazy loaded tile data, we need to make sure the original appData item
            // with detail data is still preserved.
            if (state.appData.length === 1) {
                currentAppDetail = state.appData[0];
            }

            // State.temporaryInitialRenderedTileExtraData already has the extra data ready for all the on screen tiles.
            // So we merge the extra tile data for those on screen tiles.
            // Later when those on screen tiles are rendering, it ensures the client side renders the same as the server side.
            for (let i = 0, len = newState.appData.length; i < len; i++) {
                let appId = newState.appData[i].appid.toLowerCase();
                if (state.temporaryInitialRenderedTileExtraData[appId]) {
                    newState.appData[i] = state.temporaryInitialRenderedTileExtraData[appId];
                }
                if (currentAppDetail && newState.appData[i].appid === currentAppDetail.appid) {
                    newState.appData[i] = currentAppDetail;
                }
            }
        }
    } else if (isType(action, ExtraDataReceivedAction)) {
        if (state.appData && state.appData.length !== 1) {
            let appData = state.appData;
            let tileGotUpdated = false;
            appData.forEach(item => {
                let extraData = action.payload[item.appid.toLowerCase()];
                if (extraData) {
                    tileGotUpdated = true;
                    for (let key in extraData) {
                        item[key] = extraData[key];
                    }
                    item.extraDataLoaded = true;
                }
            });

            if (tileGotUpdated) {
                newState.appData = appData;
            }
        }
    } else if (isType(action, RegisterTileExtraData)) {
        if (!newState.temporaryInitialRenderedTileExtraData) {
            newState.temporaryInitialRenderedTileExtraData = {};
        }

        action.payload.appDatas.forEach(item => {
            newState.temporaryInitialRenderedTileExtraData[item.appid.toLowerCase()] = item;
        });
    } else if (isType(action, PartnerAppDataReceivedAction)) {
        if (action.payload.appData) {
            let appData = parsePartnerApps(action.payload.appData, action.payload.embedHost);
            newState.appData = state.appData.concat(appData).sort((a: IAppDataItem, b: IAppDataItem) => {
                let aTitle = a.title.toLowerCase();
                let bTitle = b.title.toLowerCase();
                return aTitle > bTitle ? 1 : (aTitle < bTitle ? -1 : 0);
            });
            newState.partnerAppDataLoaded = true;
            newState.appIdMap = generateHashMap(newState.appData, ['appid']);
        }

        // This event is used to indicate that the Power BI data is fetched and parsing is done.
        let payload: ITelemetryData = {
            page: 'In App Gallery(' + ProductEnum[action.payload.embedHost] + ')',
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: '[End] Partner App data parsing done'
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    } else if (isType(action, AppDetailsReceivedAction)) {
        let index = -1;

        // valid error situation: we got back no appdetails
        if (action.payload.appDetails) {
            index = state.appIdMap[action.payload.appDetails.appid.toString().toLowerCase()];
            let startingPrice = action.payload.appDetails.startingPrice;
            if (startingPrice) {
                if (!startingPrice.pricingData) {
                    startingPrice.pricingData = PricingStates.NoPricingData;
                }
            } else {
                action.payload.appDetails.startingPrice = {
                    pricingData: PricingStates.Loading // Loading is the default state at server side.
                };
            }

            // please check the comments in the definition of temporaryInitialLoadingAppDetailData to the reason of the
            // following operation:
            newState.temporaryInitialLoadingAppDetailData = action.payload.appDetails;
        }

        if (index >= 0) {
            let newData: IAppDataItem = null;

            // we will now deal with app detail information not loading
            if (action.payload.appDetails === null) {
                // todo: Object.assign({}, state.appData[index]); cannot work or we need to polyfill it
                newData = JSON.parse(JSON.stringify(state.appData[index]));
                newData.detailLoadFailed = true;
            } else {
                // find the app to replace
                newData = action.payload.appDetails;

                // Here we need to preserve the starting price and pricing information since we may get app data again from raw data cache which doesn't contain price data.
                // If we don't reserve starting price and pricing information retreived earlier at client side, the they will be lost in the new data.
                let oldData = state.appData[index];
                if (oldData.startingPrice) {
                    newData.startingPrice = oldData.startingPrice;

                    if (newData.startingPrice.pricingBitmask) {
                        Object.keys(newData.startingPrice.pricingBitmask)
                            .forEach((key) => {
                                newData[key] = newData.startingPrice.pricingBitmask[key];
                            });
                    }
                }
                if (oldData['pricingInformation']) {
                    newData['pricingInformation'] = oldData['pricingInformation'];
                }
            }

            let newDataList = state.appData.slice(0, index)
                .concat(newData)
                .concat(state.appData.slice(index + 1));
            newState.appData = newDataList;
        } else {
            // This will be called only once when there is no appdata in the server cache.
            // This called when app details page is the landing page and it is the first page to be rendered by the server.
            // If we open home page before the app details page is opened, then the appdata is populated into the cache.
            newState.appData = [action.payload.appDetails];
            newState.appIdMap = generateHashMap(newState.appData, ['appid']);
        }
    } else if (isType(action, AppDetailPricingReceivedAction)) {
        if (action.payload.pricing) {
            let index = state.appIdMap[action.payload.appid.toString().toLowerCase()];
            if (index !== -1) {
                let newData: IAppDataItem = newState.appData[index] as IAppDataItem;
                newData['pricingInformation'] = action.payload.pricing;
            }
        }
    } else if (isType(action, CuratedDataReceivedAction)) {
        // we have received curated data from the backend
        if (!state.curatedDataLoaded) {
            newState.curatedData = action.payload.curatedData as any;
            newState.curatedDataLoaded = true;
        }
    } else if (isType(action, LiveSearchboxFilterAction)) {
        if (action.payload.searchText && action.payload.searchText.length >= 0) {
            newState.subsetSearchQuery = action.payload.searchText;
            let searchText = action.payload.searchText.toLowerCase();
            newState.subsetData = newState.appData.filter((app) => {
                return app.title.toLowerCase().indexOf(searchText) >= 0;
            });
        } else {
            newState.subsetData = [];
            newState.subsetSearchQuery = '';
        }
    } else if (isType(action, SearchDataReceivedAction)) {
        newState.subsetData = [];
        newState.subsetSearchQuery = action.payload.performedQuery;
        let apps = action.payload.appIdData;
        if (apps.length <= 0 || !state.appDataLoaded) {
            return newState;
        }

        newState.subsetData = buildFullSearchData(apps, state.appData, state.appIdMap, 'ApplicationId');
    } else {
        return state;
    }
    return newState;
}
