import {
    IAppSearchResult,
    IPartnerSearchResult,
    IAppDataItem,
    IPartnerDataItem,
    IUserInfo,
    ICuratedSection,
    ITestDriveAcquistionsResponseOutput
} from './shared/Models';

import { IFirstPartyPricing } from './mac/Models';

import { IDataMap } from './mac/utils/dataMapping';

export interface ISearchState {
    searchText: string;
    appSearchResults: IAppSearchResult[];
    partnerSearchResults: IPartnerSearchResult[];
    searchIdCurrentlyOngoing: number;
}

export interface IModalState {
    appId?: string;
    partnerId?: string;
    modalId: number;
    isSignedIn: boolean;
    showModal: boolean;
    payload: any;
    options?: any;
}

export interface IAppDataState {
    appIdMap: { [id: string]: number; };
    appData: IAppDataItem[];

    // temporaryInitialRenderedTileExtraData is used for holding the tile extra data for the initial rendered tiles.
    // It's used in the tile extra data on demand loading scenario.
    // Please do not use this data in any other scenario.
    temporaryInitialRenderedTileExtraData?: { [id: string]: IAppDataItem };

    // temporaryInitialLoadingAppDetailData is a temporary state only used for preserve the app detail information
    // when we clean up the app data list at server side for loading detail page.
    // This data will be pushed into the app data list and then gets cleared at server side.
    // Please do not use this data in any other scenario.
    temporaryInitialLoadingAppDetailData?: IAppDataItem;
    dataMap: IDataMap;
    appDataLoaded: boolean;
    partnerAppDataLoaded?: boolean;
    curatedData: { [id: string]: ICuratedSection<IAppDataItem>[]; };
    curatedDataLoaded: boolean;
    subsetData: IAppDataItem[];
    subsetSearchQuery: string;
    firstPartyPricing?: IFirstPartyPricing;
}

export interface IPartnerDataState {
    partnerIdMap: { [id: string]: number; };
    partnerData: IPartnerDataItem[];
    // temporaryInitialLoadingPartnerDetailData is a temporary state only used for preserve the partner detail information
    // when we clean up the app data list at server side for loading detail page.
    // this data will be pushed into the partner data list and then gets cleared at server side.
    // please do not use this data in any other scenario.
    temporaryInitialLoadingPartnerDetailData?: IPartnerDataItem;
    dataMap: IDataMap;
    partnerDataLoaded: boolean;
    curatedData: { [id: string]: ICuratedSection<IPartnerDataItem>[]; };
    curatedDataLoaded: boolean;
    subsetData: IPartnerDataItem[];
    subsetSearchQuery: string;
}

export interface IUserDataState extends IUserInfo {
    id: string;
    signedIn: boolean;
    group: string[];
    idToken: string;
    accessToken: any;
    refreshToken: string;
    graphApi?: string;
    hasReview?: boolean;
    tokenRefreshTime: number;
}

export interface IConfigState {
    isEmbedded: boolean;
    embedHost: number;
    locStrings: any;
    locale: string;
    user: string;
    flightCodes: string;
    partnerSearchUrl: string;
    searchUrl: string;
    searchAPIKey: string;
    correlationId: string;
    breadcrumbUrl: string;
    currentView: string;
    appViewTelemetryLoggedCount: number;
    nationalCloud: string;
    billingCountryCode: string;
    pricingDataLoaded: boolean;
    includeOfficeApps: boolean;
}

export interface ITestDriveState {
    id: string;
    state: string;
    expirationDate: Date;
    outputs: ITestDriveAcquistionsResponseOutput[];
    appid: string;
}

export interface IState {
    search: ISearchState;
    modal: IModalState;
    apps: IAppDataState;
    partners: IPartnerDataState;
    users: IUserDataState;
    config: IConfigState;
    testDrive: ITestDriveState[];
}

export const initialSearchState = {
    searchText: '',
    appSearchResults: [] as IAppSearchResult[],
    partnerSearchResults: [] as IPartnerSearchResult[],
    searchIdCurrentlyOngoing: 0
};

export const initialModalState = {
    appId: '',
    parnerId: '',
    modalId: 0,
    isSignedIn: false,
    showModal: false,
    payload: null as any
};

export const initialAppDataState = {
    appIdMap: {},
    appData: [] as IAppDataItem[],
    dataMap: {} as IDataMap,
    curatedData: {},
    appDataLoaded: false,
    partnerAppDataLoaded: false,
    curatedDataLoaded: false,
    subsetData: [] as IAppDataItem[],
    subsetSearchQuery: ''
};

export const initialPartnerDataState = {
    partnerIdMap: {},
    partnerData: [] as IPartnerDataItem[],
    dataMap: {} as IDataMap,
    curatedData: {},
    partnerDataLoaded: false,
    curatedDataLoaded: false,
    subsetData: [] as IPartnerDataItem[],
    subsetSearchQuery: ''
};

export const initialUserDataState: IUserDataState = {
    id: '',
    group: [''],
    signedIn: false,
    idToken: '',
    accessToken: {},
    refreshToken: '',
    firstName: '',
    lastName: '',
    displayName: '',
    oid: '',
    tid: '',
    email: '',
    graphApi: process.env.graphApi,  // todo: this should be removed, will crash in client
    alternateEmail: '',
    isMSAUser: false,
    isFieldUser: false,
    hasReview: false,
    tokenRefreshTime: null
};

export const initialConfigState: IConfigState = {
    isEmbedded: false,
    embedHost: null,
    locStrings: '',
    locale: 'en-us',
    user: '',
    flightCodes: null,
    searchAPIKey: '',
    searchUrl: '',
    partnerSearchUrl: '',
    correlationId: '',
    currentView: 'home',
    breadcrumbUrl: null,
    appViewTelemetryLoggedCount: 0,
    nationalCloud: '',
    billingCountryCode: 'us',
    pricingDataLoaded: false,
    includeOfficeApps: true
};

// Represents the initial test drive state
export const initialTestDriveState: ITestDriveState[] = [
    {
        appid: '',
        expirationDate: null,
        id: '',
        outputs: null as ITestDriveAcquistionsResponseOutput[],
        state: ''
    }
];

export const initialState = {
    search: initialSearchState,
    modal: initialModalState,
    apps: initialAppDataState,
    partners: initialPartnerDataState,
    users: initialUserDataState,
    config: initialConfigState,
    testDrive: initialTestDriveState
};

// This function does a deep copy a 'DataMap' object
// It is sometimes used (in the server code) after calling 'performFilter' to
// ignore objects that have a 'count' property set to '0'.  This removes 'filters'
// from the filter pane that aren't applicable to a specific group of data
export function deepCopyDataMap(DataMap: any): any {
    let newDataMap: any = {};
    if (DataMap == null || typeof DataMap !== 'object') {
        return DataMap;
    } else if (DataMap.count === 0) {
        return null;
    }
    for (let k in DataMap) {
        let prop = DataMap[k];
        let copy = deepCopyDataMap(prop);
        if (copy) {
            newDataMap[k] = copy;
        }
    }
    return newDataMap;
}

export function copyState<T>(oldState: T): T {
    let newState: any = {};

    for (let k in oldState) {
        newState[k] = oldState[k];
    }

    return newState as T;
};
