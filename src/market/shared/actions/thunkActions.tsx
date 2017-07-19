import { IState } from '../../State';
import { Promise } from 'es6-promise';
import { get, Response } from 'superagent';
import {
    createAppDataReceivedAction, createSearchboxInputChangedAction,
    createSearchResultsReceivedAction, createCuratedPartnerDataReceivedAction,
    createCuratedDataReceivedAction, createSearchDataReceivedAction,
    createAppDetailsReceivedAction, createPartnerDataReceivedAction,
    createPartnerDetailsReceivedAction, createTileDataReceivedAction,
    createExtraDataReceivedAction, createAppPricingDataReceivedAction,
    createAppPricingDataRequestedAction, createAccessTokenReceivedAction,
    createAppDetailPricingReceivedAction, createBillingRegionReadFromCookieAction
} from '../actions/actions';
import { ProductEnum, DataMap } from '../utils/dataMapping';
import { getCrossListingData } from '../utils/hashMapUtils';
// import * as searchHelper from 'utils/search';
import * as searchHelper from './../../mac/utils/search';

import * as searchRestClient from '../services/http/searchRestClient';
import * as appPartnerRestClient from '../services/http/appPartnerRestClient';
import * as refreshAccessTokenClient from '../services/http/tokenRestClient';

// Constant API version that maps to the app schema,
// inflight browser never calls the API directly hence this is the only place the version lives
import { getAppConfig } from '../services/init/appConfig';
import { Url } from '../services/http/urlUtils';
import { generateGuid, readCookie, saveCookie } from '../utils/appUtils';

import { Constants } from '../utils/constants';
import { getWindow } from '../services/window';
import { ITelemetryData } from '../Models';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';

const pricingCookieKey = 'appsourcebillingregion';

export function getEndpoint(endpoint: string, forBackend = false) {
    let apiVersion = getAppConfig('apiVersion');
    let query = {};
    if (forBackend) {
        query = {
            'api-version': apiVersion
        };
    } else {
        query = {
            'version': apiVersion
        };
    }

    let url = new Url(endpoint, query);

    return url.getUrl();
};

export function fetchStateCacheData(includeExtraData: boolean) {
    return function (dispatch: any, getState: () => IState) {
        return Promise.all([
            dispatch(ensureAppData(includeExtraData)),
            dispatch(ensureCuratedData(includeExtraData)),
            dispatch(ensurePartnerData()),
            dispatch(ensureCuratedPartnerData())
        ]);
    };
}

export function performSearch(searchString: string, searchId: number, includeOfficeApps: boolean) {
    return function (dispatch: any, getState: () => IState) {
        dispatch(createSearchboxInputChangedAction({ searchString: searchString }));

        // we do not hit search engine with small amounts of characters, but
        // we should remove search results
        if (searchString.length < 2) {
            return Promise.resolve([]);
        }

        let appResults = searchRestClient.postAppSearch(
            searchString,
            searchHelper.getAppSuggesterSearchFields(),
            searchHelper.getAppSuggesterSelectFields(),
            searchHelper.shouldIgnoreOfficeApps(includeOfficeApps)
        );

        let partnerResults = searchRestClient.postPartnerSearch(searchString);

        return Promise.all([appResults, partnerResults]).then((values) => {
            let apps = values[0] as any[];
            let partners = values[1] as any[];
            dispatch(createSearchResultsReceivedAction({
                appSearchResults: apps,
                partnerSearchResults: partners,
                searchid: searchId + 1
            }));
            return [apps, partners];
        });
    };
}

export function performSearchAll(searchText: string) {
    return function (dispatch: any, getState: () => IState) {
        let searchQuery = '';
        let multiWord = searchText.split(' ');
        if (multiWord.length > 1) {
            // multi word
            multiWord.forEach(word => {
                if (word.length > 0) {
                    searchQuery = searchQuery + ' ' + word + '~';
                }
            });
        } else {
            searchQuery = searchText + '* OR ' + searchText + '~';
        }

        let processSearchQuery = (searchTerm: string) => {
            let escapeCharSet = '+ - && || ! ( ) { } [ ] ^ " ~ ? : / \\';
            let specialCharsList = escapeCharSet.split(' ');
            let processedString = searchTerm;
            for (let i = 0; i < specialCharsList.length; i++) {
                if (searchTerm.indexOf(specialCharsList[i]) >= 0) {
                    let re = new RegExp('\\' + specialCharsList[i], 'g');
                    processedString = processedString.replace(re, '\\' + specialCharsList[i]);
                }
            }

            // Special case for asterisk. We can't use * with RegExp. new RegExp(*, 'g') gives error
            processedString = processedString.replace('*', '\\*');

            return processedString;
        };

        searchQuery = searchQuery + ' OR ' + processSearchQuery(searchText);

        let appResults = searchRestClient.postAllAppSearch(searchQuery);
        let partnerResults = searchRestClient.postAllPartnerSearch(searchQuery);

        return Promise.all([appResults, partnerResults]).then((values) => {
            let apps = values[0] as any[];
            let partners = values[1] as any[];
            dispatch(createSearchDataReceivedAction({
                appIdData: apps,
                partnerIdData: partners,
                performedQuery: searchText
            }));
            return [apps, partners];
        });
    };
}

export function ensureAppData(includeExtraData?: boolean) {
    return function (dispatch: any, getState: () => IState) {
        let state = getState();
        if (state.apps.appDataLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const flightCodeString = state.config.flightCodes ? '&flightCodes=' + encodeURIComponent(state.config.flightCodes) : '';
            const includeOfficeApps = state.config.includeOfficeApps;

            appPartnerRestClient.getApps('', flightCodeString, null, includeExtraData, includeOfficeApps).then((appData: any) => {
                let filteredApps = appData;
                let embedHost = state.config.embedHost;

                if (embedHost) {
                    let appFilter = (app: any) => {
                        return app.primaryProduct === embedHost;
                    };

                    // HACK: remove after Legacy CRM EmbedHost path is fixed
                    if (embedHost === ProductEnum['dynamics-365-for-sales']) {
                        appFilter = (app: any) => app.primaryProduct === ProductEnum['dynamics-365'];
                    }

                    if (embedHost === ProductEnum['dynamics-365']) {
                        appFilter = (app: any) => {
                            return app.primaryProduct === ProductEnum['dynamics-365-for-operations'] ||
                                app.primaryProduct === ProductEnum['dynamics-365'] ||
                                app.primaryProduct === ProductEnum['dynamics-365-for-financials'];
                        };
                    }
                    filteredApps = appData.filter(appFilter);

                    // For power BI embed experience, the apps should be sorted
                    // If we don't sort it here, first we render the unsorted apps and then re-render with sorted apps
                    // This will look like a flicker in the apps rendering
                    if (embedHost === ProductEnum['power-bi'] && filteredApps && filteredApps.length > 0) {
                        filteredApps = filteredApps.sort((a: any, b: any) => {
                            let aTitle = a.title.toLowerCase();
                            let bTitle = b.title.toLowerCase();
                            return aTitle > bTitle ? 1 : (aTitle < bTitle ? -1 : 0);
                        });
                    }
                }

                dispatch(createAppDataReceivedAction({ appData: filteredApps, isEmbedded: state.config.isEmbedded }));
                resolve(filteredApps);
            }, (error: any) => {
                reject(error);
            });
        });
    };
}

export function ensureCuratedData(includeExtraData?: boolean) {
    return function (dispatch: any, getState: () => IState) {
        let state = getState();
        if (state.apps.curatedDataLoaded ||
            (state.config.isEmbedded && state.config.embedHost !== ProductEnum['dynamics-365'])) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const includeOfficeApps = state.config.includeOfficeApps;

            appPartnerRestClient.getFeaturedApps(includeOfficeApps).then((curatedData: any) => {
                dispatch(ensureAppData(includeExtraData)).then(() => {
                    if (state.config.embedHost && state.config.embedHost === ProductEnum['dynamics-365']) {
                        let validProducts = [
                            DataMap.products['dynamics-365'],
                            DataMap.products['dynamics-365-for-operations'],
                            DataMap.products['dynamics-365-for-sales'],
                            DataMap.products['dynamics-365-for-financials'],
                            DataMap.products['dynamics-365-for-customer-services'],
                            DataMap.products['dynamics-365-for-field-services'],
                            DataMap.products['dynamics-365-for-project-services-automation']
                        ];
                        let validKeys = validProducts.map((p) => p.FilterID);
                        let scrubbedData: { [id: string]: any[]; } = {};
                        scrubbedData['everything'] = [];
                        curatedData['everything'].forEach((k: any) => {
                            if (validKeys.indexOf(k.titleId) >= 0) {
                                scrubbedData['everything'].push(k);
                            }
                        });
                        curatedData = scrubbedData;
                    }

                    dispatch(createCuratedDataReceivedAction({ curatedData: curatedData }));
                    resolve(curatedData);
                });
            }, (error: any) => {
                reject(error);
            });
        });
    };
}

export function loadTileData() {
    return function (dispatch: any, getState: () => IState) {
        return Promise.resolve()
            .then(() => {
                let state = getState();
                return appPartnerRestClient.getTileData(state.config.flightCodes, state.config.includeOfficeApps);
            })
            .then((tileData: any) => {
                dispatch(createTileDataReceivedAction(tileData));
                return tileData;
            })
            .catch((err) => Promise.reject(err));
    };
}

export function getTileExtraData(idList: { [id: string]: number }) {
    return function (dispatch: any, getState: () => IState) {
        return Promise.resolve()
            .then(() => {
                return (idList && Object.getOwnPropertyNames(idList).length > 0) ? appPartnerRestClient.getExtraData(idList)
                    : null;
            })
            .then((extraData: any) => {
                if (extraData && Object.getOwnPropertyNames(extraData).length > 0) {
                    dispatch(createExtraDataReceivedAction(extraData));
                }
                return extraData;
            })
            .catch((err) => Promise.reject(err));
    };
}

export function ensurePartnerData() {
    return function (dispatch: any, getState: () => IState) {
        let state = getState();
        if (state.partners.partnerDataLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            appPartnerRestClient.getPartners('').then((partnerData: any) => {
                dispatch(createPartnerDataReceivedAction({
                    partnerData: partnerData,
                    isEmbedded: state.config.isEmbedded
                }));

                resolve(partnerData);
            }, (error) => {
                reject(error);
            });
        });
    };
}

export function ensureCuratedPartnerData() {
    return function (dispatch: any, getState: () => IState) {
        if (getState().partners.curatedDataLoaded || getState().config.isEmbedded) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            appPartnerRestClient.getFeaturedPartners().then((curatedData: any) => {
                dispatch(ensurePartnerData()).then(() => {
                    dispatch(createCuratedPartnerDataReceivedAction({
                        curatedData: curatedData
                    }));

                    resolve(curatedData);
                });
            }, (error: any) => {
                reject(error);
            });
        });
    };
}

export function getAppPricing(id: string) {
    return function (dispatch: any, getState: () => IState) {
        return new Promise((resolve, reject) => {
            let billingRegion = getState().config.billingCountryCode;
            appPartnerRestClient.getAppPricing(id, billingRegion).then((result: any) => {
                dispatch(createAppDetailPricingReceivedAction({
                    appid: id,
                    pricing: result
                }));
                resolve(result);
            })
                .catch(error => {
                    dispatch(createAppDetailPricingReceivedAction({
                        appid: null,
                        pricing: null
                    }));
                    reject(error);
                });
        });
    };
}

export function getAppDetail(id: string) {
    return function (dispatch: any, getState: () => IState) {
        return new Promise((resolve, reject) => {
            let state = getState();
            const flightCode = state.config.flightCodes ? encodeURIComponent(state.config.flightCodes) : '';

            let billingRegion = state.config.billingCountryCode;

            appPartnerRestClient.getApps(id, flightCode, billingRegion).then((appFullData: any) => {
                const isCrossListingEnabled = process.env.IsCrossListingEnabled || true;
                const dispatchActionAndResolve = () => {
                    dispatch(createAppDetailsReceivedAction({
                        appDetails: appFullData
                    }));

                    resolve(appFullData);
                };

                if (isCrossListingEnabled && appFullData.detailInformation && appFullData.detailInformation.CertifiedPartners) {
                    dispatch(ensurePartnerData()).then(() => {
                        let crossListingData = getCrossListingData(appFullData.detailInformation.CertifiedPartners,
                            getState().partners.partnerData,
                            getState().partners.partnerIdMap);
                        appFullData.detailInformation.CertifiedPartners = crossListingData;

                        dispatchActionAndResolve();
                    });
                } else {
                    dispatchActionAndResolve();
                }
            }, (error: any) => {
                // we can recover from not getting app details, but for now I do not want to (no designed experience)
                // the below dispatch is to make sure
                dispatch(createAppDetailsReceivedAction({
                    appDetails: null
                }));
                reject(error);
            });
        });
    };
}

export function getPartnerDetail(id: string) {
    return function (dispatch: any, getState: () => IState) {
        return new Promise((resolve, reject) => {
            appPartnerRestClient.getPartners(id).then((partnerData: any) => {
                const isCrossListingEnabled = process.env.IsCrossListingEnabled || true;
                const dispatchActionAndResolve = () => {
                    dispatch(createPartnerDetailsReceivedAction({
                        partnerDetails: partnerData
                    }));

                    resolve(partnerData);
                };

                if (isCrossListingEnabled && partnerData.detailInformation && partnerData.detailInformation.ApplicationsSupported) {
                    dispatch(ensureAppData()).then(() => {
                        let crossListingData = getCrossListingData(partnerData.detailInformation.ApplicationsSupported,
                            getState().apps.appData,
                            getState().apps.appIdMap);
                        partnerData.detailInformation.ApplicationsSupported = crossListingData;

                        dispatchActionAndResolve();
                    });
                } else {
                    dispatchActionAndResolve();
                }
            }, (error: any) => {
                dispatch(createPartnerDetailsReceivedAction({
                    partnerDetails: null
                }));
                reject(error);
            });
        });
    };
}

export function changeBillingRegion(countryCode?: string) {
    return function (dispatch: any, getState: () => IState) {
        if (!countryCode) {
            countryCode = readCookie(pricingCookieKey, false) || 'cn'; // Start Mooncake
            dispatch(createBillingRegionReadFromCookieAction({ billingRegion: countryCode }));
        }
        if (countryCode === getState().config.billingCountryCode && getState().config.pricingDataLoaded) {
            return Promise.resolve();
        }
        dispatch(createAppPricingDataRequestedAction(null));
        return Promise.resolve()
            .then(() => dispatch(ensureAppData()))
            .then(() => {
                return new Promise((resolve, reject) => {
                    get(getEndpoint('/view/appPricing' + (countryCode ? '/' + countryCode.toLowerCase() : '')))
                        .set('x-ms-requestid', generateGuid())
                        .set('x-ms-correlationid', getState().config.correlationId)
                        .end(function (err: any, res: Response) {
                            if (err === null && res && res.ok && !res.noContent) {
                                let pricingData = JSON.parse(res.text);
                                dispatch(createAppPricingDataReceivedAction({
                                    pricingData: pricingData.startingPrices,
                                    countryCode: pricingData.billingRegion
                                }));
                                resolve(pricingData);
                            } else {
                                reject(err);
                            }
                        });
                });
            })
            .then((data: any) => {
                if (data && data.billingRegion) {
                    saveCookie(pricingCookieKey, data.billingRegion, 'Fri, 31 Dec 9999 23:59:59 GMT');
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    };
}

export function refreshAccessToken() {
    return function (dispatch: any, getState: () => IState) {
        const lastRefreshTime = getState().users.tokenRefreshTime;
        const currentTime = Date.parse(new Date().toISOString());

        // if we have not refreshed in over 'refreshAccessTokenInterval' ms
        // we request a new token
        // otherwise, we simply resolve since our tokens are still current
        // if the request to refresh fails, we still resolve
        if (lastRefreshTime && ((currentTime - lastRefreshTime) >= Constants.refreshAccessTokenInterval)) {
            return new Promise((resolve, reject) => {
                refreshAccessTokenClient.refreshAccessToken()
                    .then((accessToken: any) => {
                        let payload: ITelemetryData = {
                            page: getWindow().location.href,
                            action: Constants.Telemetry.Action.RefreshToken,
                            actionModifier: Constants.Telemetry.ActionModifier.Info,
                            details: JSON.stringify({
                                lastRefreshTime: lastRefreshTime,
                                currentTime: currentTime
                            })
                        };

                        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
                        dispatch(createAccessTokenReceivedAction(accessToken));
                        resolve(accessToken);
                    })
                    .catch((error: any) => {
                        let payload: ITelemetryData = {
                            page: getWindow().location.href,
                            action: Constants.Telemetry.Action.RefreshToken,
                            actionModifier: Constants.Telemetry.ActionModifier.Error,
                            details: JSON.stringify({
                                lastRefreshTime: lastRefreshTime,
                                currentTime: currentTime,
                                error: error
                            })
                        };

                        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
                        resolve();
                    });
            });
        } else {
            return Promise.resolve();
        }
    };
}