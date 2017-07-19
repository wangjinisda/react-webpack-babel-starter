import { Constants } from './utils/constants';
import { ITelemetryData } from './Models';
import { SpzaInstrumentService } from './services/telemetry/spza/spzaInstrument';
import { getWindow } from './services/window';
let { browserHistory } = require('react-router');
// let createBrowserHistory = require('history/lib/createBrowserHistory');
let { syncHistoryWithStore, push, replace, goBack, goForward } = require('react-router-redux');

let isEmbedded = false;
let previousPage = '';

export let appHistory: any = null;

/*
export const initRouterHistory = (embedded = false) => {
    isEmbedded = embedded;
    const createAppHistory = useRouterHistory(createBrowserHistory);
    let options: any = {};
    if (embedded) {
        options.basename = '/embed';
    }
    appHistory = createAppHistory(options);
};
*/

export const historyCreator = (store: any) =>{
    return (): void => {
        appHistory = syncHistoryWithStore(browserHistory, store)
        return appHistory;
    }
}



// These object defines valid queryParams for the different states in the app.  This allows us to
// 'smartly' drop and add query parameters when navigating between pages
export let routeParams = {
    appView: ['debug', 'flightCodes', 'officeApps'],
    home: ['industry', 'category', 'product', 'search'],
    marketplace: ['industry', 'category', 'product', 'search', 'showPrivateApps', 'page', 'pageSize'],
    appDetails: ['breadcrumbUrl', 'tab', 'survey'],
    myReviews: [] as string[],
    localePicker: [] as string[],
    partners: [] as string[],
    partnersForm: [] as string[],
    partnerDetail: ['breadcrumbUrl', 'tab'] as string[],
    sell: [] as string[],
    about: [] as string[],
    testDrive: [] as string[]
};

export interface IRouteConfig<T> {
    name: string;
    getPath: (routeArgs: T) => string;
    params: string[];
    initialParamsValue?: { [id: string]: string };
}

export interface IAppDetailsParams {
    productId?: string;
    appid: string;
}

export interface IPartnerDetailsParams {
    partnerId: string;
}

export interface ITestDriveParams {
    productId: string;
    appid: string;
}

export let routes = {
    localePicker: {
        name: 'locale',
        getPath: () => '/localepicker',
        params: routeParams.localePicker.concat(routeParams.appView)
    } as IRouteConfig<any>,
    home: {
        name: 'home',
        getPath: () => '/',
        params: routeParams.home.concat(routeParams.appView)
    } as IRouteConfig<any>,
    marketplace: {
        name: 'appGallery',
        getPath: () => '/marketplace/apps',
        params: routeParams.marketplace.concat(routeParams.appView)
    } as IRouteConfig<any>,
    appDetails: {
        name: 'appDetails',
        getPath: (routeArgs: IAppDetailsParams) => '/product/' + routeArgs.productId + '/' + routeArgs.appid,
        params: routeParams.appDetails.concat(routeParams.appView)
    } as IRouteConfig<IAppDetailsParams>,
    partners: {
        name: 'partners',
        getPath: () => '/partners',
        params: routeParams.partners.concat(routeParams.appView)
    } as IRouteConfig<any>,
    myReviews: {
        name: 'reviews',
        getPath: () => '/user/my-reviews',
        params: routeParams.myReviews.concat(routeParams.appView)
    } as IRouteConfig<any>,
    listPartners: {
        name: 'partnerListingForm',
        getPath: () => '/partners/list-as-partner',
        params: routeParams.partners.concat(routeParams.appView)
    } as IRouteConfig<any>,
    listApps: {
        name: 'appListingForm',
        getPath: () => '/partners/list-an-app',
        params: routeParams.partners.concat(routeParams.appView)
    } as IRouteConfig<any>,
    partnerDetail: {
        name: 'partnerDetail',
        getPath: (routeArgs: IPartnerDetailsParams) => '/marketplace/partners/' + routeArgs.partnerId,
        params: routeParams.partnerDetail.concat(routeParams.appView)
    } as IRouteConfig<any>,
    marketplacePartners: {
        name: 'partnerGallery',
        getPath: () => '/marketplace/partners',
        params: routeParams.marketplace.concat(routeParams.appView)
    } as IRouteConfig<any>,
    marketing: {
        name: 'sell',
        getPath: () => '/sell',
        params: routeParams.sell.concat(routeParams.appView)
    } as IRouteConfig<any>,
    about: {
        name: 'about',
        getPath: () => '/about',
        params: routeParams.about.concat(routeParams.appView)
    } as IRouteConfig<any>,
    billingRegion: {
        name: 'billingregion',
        getPath: () => '/billingregion',
        params: routeParams.about.concat(routeParams.appView)
    } as IRouteConfig<any>,
    testDrive: {
        name: 'testdrive',
        getPath: (routeArgs: ITestDriveParams) => '/product/' + routeArgs.productId + '/' + routeArgs.appid + '/manage/testdrive',
        params: routeParams.testDrive.concat(routeParams.appView)
    } as IRouteConfig<ITestDriveParams>,
    fieldHub: {
        name: 'fieldHub',
        getPath: () => '/field-hub',
        params: routeParams.about.concat(routeParams.appView)
    } as IRouteConfig<any>
};

export function buildHref<T>(
    route: IRouteConfig<T>,
    oldRouteParams: T,
    newRouteParams: T,
    oldParams: any,
    newParams: any,
    keepAllParams?: boolean,
    locale?: string) {
    let validQueryParams = route.params;

    // merge old route params
    if (oldRouteParams) {
        let routeKeys = Object.keys(oldRouteParams);
        if (!newRouteParams) {
            newRouteParams = {} as T;
        }
        routeKeys.forEach(function (key) {
            if (oldRouteParams && newRouteParams[key] === undefined) {
                newRouteParams[key] = oldRouteParams[key];
            }
        });
    }

    let path = route.getPath(newRouteParams);

    if (locale) {
        path = '/' + locale + path;
    }

    let targetParams = {};

    for (let op in oldParams) {
        targetParams[op] = oldParams[op];
    }
    for (let np in newParams) {
        let v: string = newParams[np];
        if (!v) {
            if (targetParams[np]) {
                delete targetParams[np];
            }
            continue;
        }
        let startChar = v.charAt(0);

        // ';' leading a string means to append to exist params
        if (startChar === ';') {
            let newParam = v.substr(1);
            // No existing params for the current key
            if (!oldParams[np]) {
                targetParams[np] = newParam;
            } else {
                let splitParams = newParam.split(';');
                targetParams[np] = splitParams.reduce((acc, key) => {
                    return acc + (targetParams[np].indexOf(key) > 0 ? '' : ';' + key);
                }, targetParams[np]);
                // should split and join without dupes
            }
        } else if (startChar === '!') {
            let newParam = v.substr(1);
            if (oldParams[np]) {
                // should split and join without dupes
                let splitNewParams = newParam.split(';');
                let splitOldParams = oldParams[np].split(';');
                splitNewParams.map((key: string) => {
                    let pos = splitOldParams.indexOf(key);
                    if (pos >= 0) {
                        splitOldParams.splice(pos, 1);
                    }
                });

                targetParams[np] = splitOldParams.join(';');
                if (targetParams[np].length === 0) {
                    delete targetParams[np];
                }
            }
        } else {
            targetParams[np] = v;
        }
    }

    // DIY createHref because browserHistory doesn't work
    // return browserHistory.createHref({ pathname: path, query: targetParams });
    let queryString = '';
    let emptyQuery = true;
    for (let tp in targetParams) {
        if (validQueryParams.indexOf(tp) >= 0 || keepAllParams) {
            queryString += (emptyQuery ? '?' : '&') + tp + '=' + encodeURIComponent(targetParams[tp]);
            emptyQuery = false;
        }
    }
    let relativeUrl = path + queryString;
    return relativeUrl;
}

export function appendQueryParams(path: string, queryParams: any) {
    if (!path) {
        path = '';
    }
    if (queryParams) {
        let keys = Object.keys(queryParams);
        if (keys.length > 0) {
            path += (path.indexOf('?') > 0 ? '&' : '?');
            path += keys.map((k) => k + '=' + queryParams[k]).join('&');
        }
    }

    return path;
}

export function removeQueryParamsFromUrl(removeParam: string, url?: string): string {
    if (!url) {
        url = window.location.href;
    }
    removeParam = removeParam.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + removeParam + '(=([^&#]*)|&|#|$)');
    let results = url.replace(regex, '');
    return results;
}

// This function returns a full relative path
// for '/embed' paths in the embedded app, it will remove the '/embed' part
export const getCurrentRelativeUrl = () => {
    let currWindow = getWindow();
    let breadcrumbUrl = currWindow.location.pathname;
    if (currWindow.location.search) {
        breadcrumbUrl += currWindow.location.search;
    }
    if (breadcrumbUrl.indexOf('/embed') === 0) {
        breadcrumbUrl = breadcrumbUrl.substr(6);
    }
    return breadcrumbUrl;
};

export const urlPush = (location: any, scrollToTop = false) => {
    if (!appHistory) {
        return;
    }

    previousPage = getWindow().location.href;
    let data = {
        previousPage: previousPage
    };
    let payload: ITelemetryData = {
        page: location,
        action: Constants.Telemetry.Action.PageLoad,
        actionModifier: Constants.Telemetry.ActionModifier.Start,
        details: JSON.stringify(data)
    };
    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

    // The embedded app should never push anything onto the history stack
    if (isEmbedded) {
        appHistory.replace(location);
    } else {
        appHistory.push(location);
        if (scrollToTop) {
            scrollTo(0, 0);
        }
    }
};

export const urlReplace = (location: any) => {
    if (!appHistory) {
        return;
    }

    previousPage = getWindow().location.href;
    appHistory.replace(location);
};

export const urlBack = (fallbackLocation?: any) => {
    if (appHistory && previousPage) {
        appHistory.goBack();
    } else if (fallbackLocation) {
        urlPush(fallbackLocation);
    }
};
