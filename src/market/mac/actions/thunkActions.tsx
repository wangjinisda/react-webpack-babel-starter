import { IState } from '../../State';
import { Promise } from 'es6-promise';
import { get, Response } from 'superagent';
import * as request from 'superagent';
require('superagent-retry')(request);
import { getEndpoint, ensureAppData, ensureCuratedData } from '../../shared/actions/thunkActions';
import {
    createAppPricingDataReceivedAction, createAppPricingDataRequestedAction,
    createFirstPartyPricingDataReceivedAction, createPartnerDataReceivedAction,
    createCuratedPartnerDataReceivedAction, createBillingRegionReadFromCookieAction
} from '../../shared/actions/actions';
import { generateGuid, readCookie, saveCookie } from '../../shared/utils/appUtils';
import { processFirstPartyPricingItems } from '../utils/pricing';
import { IFirstPartyPricing } from '../Models';

const pricingCookieKey = 'appsourcebillingregion';

export function fetchStateCacheData(includeExtraData: boolean) {
    return function (dispatch: any, getState: () => IState) {
        return Promise.all([
            dispatch(ensureAppData(includeExtraData)),
            dispatch(ensureCuratedData(includeExtraData)),
            dispatch(createCuratedPartnerDataReceivedAction({ curatedData: [] })),
            dispatch(createPartnerDataReceivedAction({ partnerData: [], isEmbedded: false }))
        ]);
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
                return Promise.all([
                    new Promise((resolve, reject) => {
                        get(getEndpoint('/view/appPricing' + (countryCode ? '/' + countryCode : '')))
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
                    }),
                    new Promise((resolve, reject) => {
                        get(getEndpoint('/api/v2.0/slugs', true) + '&billingregion=' + countryCode)
                            .set('x-ms-requestid', generateGuid())
                            .set('x-ms-correlationid', getState().config.correlationId)
                            .end(function (err: any, res: Response) {
                                if (err === null && res && res.ok && !res.noContent) {
                                    let firstPartyPricingData: IFirstPartyPricing = {
                                        items: {}
                                    };

                                    let data = JSON.parse(res.text);
                                    let pricingItems = processFirstPartyPricingItems(data);
                                    pricingItems.forEach(item => {
                                        if (!firstPartyPricingData.items[item.os]) {
                                            firstPartyPricingData.items[item.os] = [];
                                        }
                                        firstPartyPricingData.items[item.os].push(item);
                                    });
                                    dispatch(createFirstPartyPricingDataReceivedAction(firstPartyPricingData));
                                    resolve(firstPartyPricingData);
                                } else {
                                    reject(err);
                                }
                            });
                    })
                ]);
            })
            .then((data: any) => {
                if (data && data[0] && data[0].billingRegion) {
                    saveCookie(pricingCookieKey, data[0].billingRegion, 'Fri, 31 Dec 9999 23:59:59 GMT');
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            });
    };
}