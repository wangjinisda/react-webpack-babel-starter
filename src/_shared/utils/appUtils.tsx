let config = require('./partnersManifest.json');
const stackTrace = require('stacktrace-js');
import { Constants } from './constants';
import {
    ILeadGenInfo, ILeadgenPayload, IAcquistionUserInfo, IAcquistionAppInfo, IAcquistionPayload, IAcquistionPartnerInfo,
    IUserInfo, IAppDataItem, IPartnerDataItem, ITelemetryData
} from '../Models/Models';
import { getWindow } from '../services/window';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { DataMap, IDataCollection, ProductEnum } from './dataMapping';
import { getAppConfig } from '../services/init/appConfig';

import * as leadgenRestClient from '../services/http/leadgenRestClient';
import { Url } from '../services/http/urlUtils';

// import * as embedHostUtils from '../../embed/embedHostUtils';
import { createAppViewTelemetryLoggedAction } from './../actions/actions';
import { IUserDataState } from './../States/State';

// const uuid = require('uuid');
import { genV4 } from 'uuid'
let sha256 = require('crypto-js/sha256');

export function generateGuid() {
    return genV4().toString(); // random string, no time sequenced.
}

export function attachClickHandlerToElement(id: string, handler: any) {
    let el = document.getElementById(id);
    if (el) {
        el.onclick = handler;
    }
}

// Does a reverse look up on the data map from the product display name to get the product key
// Reverse lookup as dont want to create a new map to maintain
export function getProductLongTitleFromDisplayName(displayName: string): string {
    for (let item in ProductEnum) {
        // When you iterate over an Enum it gives you both the indexes and the string values
        // The regex makes sure you dont compare the indexes.
        if (ProductEnum.hasOwnProperty(item) && !/^\d+$/.test(item)) {
            if (displayName === DataMap.products[item].BackendKey) {
                return DataMap.products[item].LongTitle;
            }
        }
    }
    // Came here means none the expected products matched,
    // Some one handcrafted the Url with a non existant prod.
    // return an empty string as you cannot show details anyways
    return displayName;
}

// format the string which has {0}, {1} arguments
export function getFormattedString(baseString: string, args: string[]) {
    for (let i = 0; i < args.length; i++) {
        let regEx = new RegExp('\\{' + i + '\\}', 'gm');
        baseString = baseString.replace(regEx, args[i]);
    }

    return baseString;
}

export function getTelemetryResponseUrl(appId: string) {
    let query = {};
    query[Constants.QueryStrings.ApplicationId] = appId;
    query[Constants.QueryStrings.CorrelationId] = getAppConfig('correlationId');

    let url = new Url('/api/notifyresult', query);

    return url.getUrl();
}

function bitmaskMatch(product: string, bitmaskValue: number, products?: number) {
    let match = 0;

    if (products) {
        match = bitmaskValue & products;
    } else {
        match = (product && DataMap.products[product]) ? (DataMap.products[product].FilterID & bitmaskValue) : 0;
    }
    return match ? true : false;
}

// This API returns if a product belongs to office Add-ins
// ShortcutBitmask contains the bitmask value of all the office child products. 
// DataMap.products['office365'].ShortcutBitmask = 8355840 which is equal to 'OR' of all the child product filterIds
// we are sending office365 as the primary product for both Saas apps and Saas add-ins. So, added the products param as well
export function isOfficeNonSaasApp(product: string, products?: number) {
    return (bitmaskMatch(product, DataMap.products['office'].ShortcutBitmask, products) &&
        !bitmaskMatch(product, DataMap.products['web-apps'].FilterID, products));
}

// This API returns if a product belongs to office Saas apps
// we are sending office365 as the primary product for both Saas apps and Saas add-ins. So, added the products param as well
export function isOfficeSaasApp(product: string, products: number) {
    return (bitmaskMatch(product, DataMap.products['office'].FilterID, products) &&
        bitmaskMatch(product, DataMap.products['web-apps'].FilterID, products));
}

// This API returns if a product belongs to office category (Add-ins + Saas apps)
// we are sending office365 as the primary product for both Saas apps and Saas add-ins. So, added the products param as well
export function isOfficeApp(product: string, products?: number) {
    let bitmaskVal = DataMap.products['office'].ShortcutBitmask;
    return bitmaskMatch(product, bitmaskVal, products);
}

function getOfficeHandoffParams(appId: string, correlationId: string, responseURL: string, isMSAUser: boolean) {
    let urlArgs: any = [];
    // These values for auth type are given by Office Store team 
    let authType = isMSAUser ? Constants.AuthType.MSA : Constants.AuthType.AAD;
    let storeConfig = getAppConfig('config');

    // default values
    let lang = 'en-us';
    let contentMarket = 'en-us';

    if (storeConfig) {
        lang = storeConfig['locale'] ? storeConfig['locale'] : lang;
        contentMarket = storeConfig['locale'] ? storeConfig['locale'] : contentMarket;
    }

    // This is the URL which we are trying to fill the parameters for : 
    // https://store.office.com/en-us/addininstaller.aspx?assetid={0}&ui={1}&rs={2}&ad={3}&sourcecorrid={4}&authtype={5}&gates=marketplace.addininstaller&responseUrl={6}

    urlArgs.push(appId);
    // TODO: Fix the content market value once the PMs comes up with the actual definition. 
    urlArgs.push(lang); // ui => UI language
    urlArgs.push(contentMarket); // rs => Content Market

    urlArgs.push(correlationId);
    urlArgs.push(authType);
    urlArgs.push(responseURL);

    return urlArgs;
}

export function getHandoffUrlForProduct(productId: string, appId: string, isMSAUser: boolean, products: number) {
    let correlationId = getAppConfig('correlationId');
    let data = config.handoff[productId];

    // For office Saas apps, we use the default handoff url which we receive from the backend
    if (!data || isOfficeSaasApp(ProductEnum[productId], products)) {
        return null;
    }

    let responseURL = getTelemetryResponseUrl(appId);
    let urlArgs: any = [];

    if (isOfficeApp(data['Product'])) {
        urlArgs = getOfficeHandoffParams(appId, correlationId, encodeURIComponent(responseURL), isMSAUser);
    } else {
        urlArgs = [encodeURIComponent(appId), encodeURIComponent(responseURL), correlationId];
    }

    let handOffURL = getFormattedString(data.HandOffURL, urlArgs);

    return handOffURL;
}

function createLeadgenPayload(userInfo: IUserInfo): ILeadgenPayload {
    let email = getLeadGenEmailId(userInfo);
    let leadGenDefaultData: ILeadGenInfo = {
        firstName: userInfo.firstName ? userInfo.firstName : '',
        lastName: userInfo.lastName ? userInfo.lastName : '',
        email: email ? email : '',
        phone: userInfo.phone ? userInfo.phone : '',
        country: userInfo.country ? userInfo.country : '',
        company: userInfo.company ? userInfo.company : '',
        title: userInfo.title ? userInfo.title : ''
    };

    let leadProps: ILeadgenPayload = {
        customerInfo: leadGenDefaultData
    };

    return leadProps;
}

function getAcquisitionUserInfo(userInfo: IUserInfo, isNationalCloud: boolean) {
    let acquisitionUserInfo: IAcquistionUserInfo = {
        firstName: (userInfo && userInfo.firstName) ? userInfo.firstName : '',
        lastName: (userInfo && userInfo.lastName) ? userInfo.lastName : '',
        email: (userInfo && userInfo.email) ? isNationalCloud ? sha256(userInfo.email).toString() : userInfo.email : '',
        phone: (userInfo && userInfo.phone) ? isNationalCloud ? sha256(userInfo.email).toString() : userInfo.phone : '',
        country: (userInfo && userInfo.country) ? userInfo.country : '',
        company: (userInfo && userInfo.company) ? userInfo.company : '',
        title: (userInfo && userInfo.title) ? userInfo.title : '',
        oid: (userInfo && userInfo.oid) ? userInfo.oid : '',
        tid: (userInfo && userInfo.tid) ? userInfo.tid : '',
        alternateEmail: (userInfo && userInfo.alternateEmail) ? userInfo.alternateEmail : ''
    };

    return acquisitionUserInfo;
}

function createAppAcquisitionPayload(userInfo: IUserInfo, appData: IAppDataItem, isNationalCloud: boolean, ctaType: Constants.CTAType): IAcquistionPayload {
    let acquisitionUserInfo = getAcquisitionUserInfo(userInfo, isNationalCloud);

    let acquisitionAppInfo: IAcquistionAppInfo = {
        appid: appData.appid ? appData.appid : '',
        appName: appData.title ? appData.title : '',
        builtFor: appData.builtFor ? appData.builtFor : '',
        publisher: appData.publisher ? isNationalCloud ? sha256(appData.publisher).toString() : appData.publisher : '',
        category: appData.privateApp ? 'private' : 'public'
    };

    let acquisitionProps: IAcquistionPayload = {
        // Note this is not exact time but should be close. We can do it at the exact moment, but this is close enough for now.
        acquisitionTime: new Date().toISOString(),
        ctaType: ctaType === Constants.CTAType.TestDrive ? Constants.ActionStrings.TestDrive : appData.actionString,
        appData: acquisitionAppInfo,
        userInfo: acquisitionUserInfo
    };

    return acquisitionProps;
}

// Utility function to determine if an email has 'onmicrosoft.com' or 'ccsctp.net' [email sufixes for PROD/DF and INT respectively]
export function isOnMicrosoftEmail(email: string) {
    return email && (email.substr(-'onmicrosoft.com'.length) === 'onmicrosoft.com' || email.substr(-'ccsctp.net'.length) === 'ccsctp.net') ? true : false;
}

export function getLeadGenEmailId(userInfo: IUserInfo): string {
    return userInfo.email && userInfo.alternateEmail && isOnMicrosoftEmail(userInfo.email) ?
        userInfo.alternateEmail : userInfo.email;
}

function createPartnerAcquisitionPayload(userInfo: IUserInfo, partnerData: IPartnerDataItem, isNationalCloud: boolean, appId?: string, product?: string): IAcquistionPayload {
    let acquisitionUserInfo = getAcquisitionUserInfo(userInfo, isNationalCloud);

    let dataMapField = 'Title';
    let acquisitionPartnerInfo: IAcquistionPartnerInfo = {
        partnerUrl: partnerData.friendlyURL ? partnerData.friendlyURL : '',
        partnerName: partnerData.title ? partnerData.title : '',
        products: partnerData.products ? getDataMapString(DataMap.products, partnerData.products, dataMapField) : ''
    };

    let acquisitionProps: IAcquistionPayload = null;

    // appid and product are set only in context of cross listing 
    // in that case we set the avilable app data in acquisitionInfo and the ctatype as contact
    if (appId && product) {
        let appInfo: IAcquistionAppInfo = {
            appid: appId,
            builtFor: product,
            publisher: '',
            appName: ''
        };
        acquisitionProps = {
            // Note this is not exact time but should be close. We can do it at the exact moment, but this is close enough for now.
            acquisitionTime: new Date().toISOString(),
            ctaType: 'CTA_Contact',
            partnerData: acquisitionPartnerInfo,
            userInfo: acquisitionUserInfo,
            appData: appInfo
        };
    } else {
        acquisitionProps = {
            acquisitionTime: new Date().toISOString(),
            ctaType: 'CTA_PLT',
            partnerData: acquisitionPartnerInfo,
            userInfo: acquisitionUserInfo
        };
    }
    return acquisitionProps;
}

export function publishLead(userInfo: IUserInfo, accessToken: string, appId: string, partnerId: string, product: number, actionCode?: string, skuId?: string, ctaType?: Constants.CTAType) {
    let payload: ILeadgenPayload = userInfo ? createLeadgenPayload(userInfo) : null;
    payload.acquisitionType = ctaType && ctaType === Constants.CTAType.TestDrive ? Constants.ActionStrings.TestDrive : '';
    let leadInfo: leadgenRestClient.LeadInfo = {};

    if (!(appId && product) && !partnerId) {
        console.log('[Failure] Lead gen api query params is 0');
    }

    if (appId && product) {
        leadInfo.appId = appId;
        leadInfo.product = product;
    }

    if (skuId) {
        leadInfo.planId = skuId;
    }

    if (partnerId) {
        leadInfo.partnerId = partnerId;
    }

    leadgenRestClient.postLeadgenInfo(leadInfo, payload, accessToken)
        .then((result: any) => {
            console.log('[Success] Lead gen submitted successfully');
        })
        .catch((error: any) => {
            console.log('[Fail] Lead gen request failed ');
        });
}

export function publishAcquisitionInfo(payload: IAcquistionPayload, accessToken: any, isNationalCloud: boolean) {
    leadgenRestClient.postAcquisitionInfo(payload, accessToken, isNationalCloud).then((result: any) => {
        console.log('[Success] Data for acquisition info submitted successfully.');
    })
        .catch((error: any) => {
            console.log('[Fail] Failed to submit acquisition info data ');
        });
}

export function publishAppAcquisitionInfo(userInfo: IUserInfo, appData: IAppDataItem, accessToken: any, isNationalCloud: boolean, ctaType: Constants.CTAType) {
    let payload: IAcquistionPayload = createAppAcquisitionPayload(userInfo, appData, isNationalCloud, ctaType);

    publishAcquisitionInfo(payload, accessToken, isNationalCloud);
}

export function publishPartnerAcquisitionInfo(userInfo: IUserInfo, partnerData: IPartnerDataItem, accessToken: any,
    isNationalCloud: boolean, appId?: string, product?: string) {
    let payload: IAcquistionPayload = createPartnerAcquisitionPayload(userInfo, partnerData, isNationalCloud, appId, product);

    publishAcquisitionInfo(payload, accessToken, isNationalCloud);
}

export function getIconUrl(publisherId: number, isMiniIcon?: boolean) {
    let productIconName = ProductEnum[publisherId];

    if (productIconName) {
        return 'url(/images/ProductIcons/' + productIconName + (isMiniIcon ? '-30.png)' : '.png)');
    } else {
        return 'url(/images/ProductIcons/azure' + (isMiniIcon ? '-30.png)' : '.png)');
    }
}

const urlList = [
    'https://powerbi-df.analysis-df.windows.net', // PowerBI Dogfood
    'https://dxt.powerbi.com', // PowerBI DXT
    'https://msit.powerbi.com', // PowerBI MSIT
    'https://app.powerbi.com', // PowerBI PROD
    'https://app.powerbi.cn',
    'https://app.powerbigov.us',
    'https://app.powerbi.de',
    'https://app.analysis.windows-int.net', // PowerBI Dev env
    'https://home.dynamics.com', // D365 PROD?
    'https://tip1.home.dynamics.com', // D365 Test?
    'https://tip1.web.powerapps.com', // D365 production
    'https://powerapps.cloudapp.net', // PowerApps dev env
    'https://portal.analysis.windows-int.net', // Appsource Basil Environment?
    'https://appgallery.spza-internal.net', // Appsource staging
    'https://appgallery.spza-staging.net', // Appsource Dogfood
    'https://local.spza.microsoft-int.com', // Appsource Dev env
    'https://service.powerapps.com' // PowerApps 
];

const httpsSubString = 'https://';

export function checkOriginSource(endpoint: string) {
    if (!endpoint) {
        return false;
    }

    let origin = endpoint;
    let originStartIndex = 0;
    if (origin.indexOf(httpsSubString) === 0) {
        originStartIndex = httpsSubString.length;
    }
    let firstSlashIndex = origin.indexOf('/', originStartIndex);
    if (firstSlashIndex >= 0) {
        origin = origin.substr(0, firstSlashIndex);
    }

    for (let i = 0; i < urlList.length; i++) {
        if (origin.toLocaleLowerCase() === urlList[i]) {
            return true;
        }
    }

    if (/^https:\/\/.*analysis.windows(-int)?.net/.test(origin) // PowerBI (daily) env
        || /^https:\/\/.*.dynamics.com/.test(origin) // Dynamics CRM
        || /^https:\/\/.*.dynamics.de/.test(origin) // Dinamics CRM
        || /^https:\/\/.*.financials.dynamics-tie.com/.test(origin)
        || /^https:\/\/.*.financials.dynamics-ppe.com/.test(origin)
        || /^https:\/\/.*.projectmadeira.com/.test(origin) // Madeira PROD
        || /^https:\/\/.*.projectmadeira-ppe.com/.test(origin) // Madeira INT
        || /^https:\/\/.*.projectmadeira-test.com/.test(origin)) { // Madeira test
        return true;
    } else {
        return false;
    }
}

export function removeURLParameter(url: string, parameter: string): string {
    // Split the url into 2 parts. The right side of the '?' has all the query parameters.
    let urlparts = url.split('?');

    if (urlparts.length >= 2) {
        let prefix = encodeURIComponent(parameter) + '=';
        // We use either '&' or ';' as the parameter seperaters. Use the second part of the urlParts which has queryParams
        let queryParams = urlparts[1].split(/[&;]/g);

        for (let i = queryParams.length; i-- > 0; ) {
            // Search the string for the last occurance of the prefix : Equivalent of string starts with
            if (queryParams[i].lastIndexOf(prefix, 0) !== -1) {
                queryParams.splice(i, 1); // Removes that element from the queryParams array
            }
        }

        let newUrl = urlparts[0] + (queryParams.length > 0 ? '?' + queryParams.join('&') : '');
        return newUrl;
    } else {
        return url;
    }
}

export function getDataMapValues(collection: IDataCollection, bitmask: number) {
    return Object.keys(collection).reduce((acc, value) => {
        if (collection[value].FilterID & bitmask) {
            acc.push(collection[value]);
        }
        return acc;
    }, []);
}

// Telemetry Helper Functions
export function getDataMapString(collection: IDataCollection, bitmask: number, field: string) {
    let dataMapValues = getDataMapValues(collection, bitmask);
    let result = dataMapValues.map((value) => { return value[field]; }).join(', ');

    return result;
}

export function getTelemetryAppData(appData: any, isNationalCloud: boolean, ctaType?: Constants.CTAType) {
    if (!appData) {
        return '';
    }

    let appCtaType = '';
    if (ctaType) {
        appCtaType = ctaType === Constants.CTAType.Create ? 'Create' : 'TestDrive';
    }

    let dataMapField = 'Title';
    let telemetryAppData = {
        title: appData.title,
        publisher: appData.publisher && isNationalCloud ? sha256(appData.publisher).toString() : appData.publisher,
        builtFor: appData.builtFor,
        actionString: appData.actionString,
        industries: getDataMapString(DataMap.industries, appData.industries, dataMapField),
        categories: getDataMapString(DataMap.categories, appData.categories, dataMapField),
        products: getDataMapString(DataMap.products, appData.products, dataMapField),
        leadGenEnabled: appData.leadgenEnabled,
        ctaType: appCtaType,
        type: appData.privateApp ? 'private' : 'public'
    };

    return JSON.stringify(telemetryAppData);
}

export function getTelemetryPartnerData(partnerData: any, crossListingCTA = false) {
    if (!partnerData) {
        return '';
    }

    let dataMapField = 'Title';
    let telemetryPartnerData = {
        partnerName: partnerData.title,
        products: getDataMapString(DataMap.products, partnerData.products, dataMapField),
        actionString: crossListingCTA ? 'CTA_DNC' : 'CTA_PLT',
        industries: getDataMapString(DataMap.industries, partnerData.industries, dataMapField),
        categories: getDataMapString(DataMap.categories, partnerData.categories, dataMapField)
    };

    return JSON.stringify(telemetryPartnerData);
}

export function isEmbedHostDataDynamic(embedHost?: ProductEnum) {
    if (embedHost === ProductEnum['power-bi']) {
        return true;
    }

    return false;
}

export function getEmbedHostName(embedHost?: ProductEnum) {
    return embedHost != null ? ProductEnum[embedHost] : 'portal';
}

export function compareApiVersion(sourceVersion: string, targetVersion: string) {
    return (sourceVersion < targetVersion ? -1 : (sourceVersion > targetVersion ? 1 : 0));
}

export function IsMoonCakeNationalCloud(nationalCloud: string) {
    if (nationalCloud) {
        if (nationalCloud.toLowerCase() === Constants.mooncakeNationalCloud) {
            return true;
        }
    }
    return false;
}

export function getProductUrlKey(productTitle: string) {
    for (let key in DataMap.products) {
        if (DataMap.products[key]['LongTitle'] === productTitle) {
            return DataMap.products[key]['UrlKey'];
        }
    }
    return null;
}

export function saveCookie(cookieName: string, value: string, expiry: string) {
    try {
        document.cookie = cookieName + '=' + value + ';path=/;' + expiry;
    } catch (exception) {
        console.log(exception);
    }
}

export function readCookie(cookieName: string, shouldDecode = true) {
    try {
        let name = cookieName + '=';
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                let value = c.substring(name.length, c.length);
                if (shouldDecode) {
                    return JSON.parse(decodeURIComponent(value));
                } else {
                    return value;
                }
            }
        }
        return null;
    } catch (exception) {
        return null;
    }
}

export function logClientError(err: any, additionalDetails: string, file = '') {
    stackTrace.fromError(err).then((value: any) => {
        let stringifiedStack = value.map(function (sf: any) {
            return sf.toString();
        }).join('\n');
        let errorMessage = '';
        if (err && err.message) {
            errorMessage = 'Error Message: ' + err.message + '\n ';
        }
        additionalDetails = errorMessage + additionalDetails + '\n Stack: ' + stringifiedStack;
        // adding the file to query errors based on the ones that have a valid file path hence raised from our code base vs ones raised by external components
        let details: any = {
            file: file,
            additionalDetails: additionalDetails
        };
        console.log(additionalDetails);
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.Error,
            details: JSON.stringify(details),
            flushLog: true
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }).catch((errr: any) => {
        console.log(errr.message);
    });
}

// Utility function which determines if a string is a JSON or not.
// Added this to avoid crash in few cases where we receive an object instead of a json string.
export function isJsonString(str: string) {
    let parsedObj: any = null;
    try {
        parsedObj = JSON.parse(str);
    } catch (e) {
        return null;
    }
    return parsedObj;
};

export function queryContainsFlightCode(req: any) {
    return req && req.query && req.query.flightCodes;
}

export function queryContainsOfficeApps(req: any) {
    return false;
}

export function shouldCache(req: any): boolean {
    if (queryContainsFlightCode(req) || queryContainsOfficeApps(req)) {
        return false;
    }
    return true;
}

export function getSpzaUserIdAndNewUserModifier(): {
    spzaUserId: string,
    newUserModifier: string
} {
    let spzaUserId = '';
    let newUserModifier = Constants.Telemetry.ActionModifier.SpzaUserIdReturn;

    // Check if we have a spzaUserId strored inside the localStorage
    // If we already have one, use it. Otherwise, create a new one and store it for subsequent sessions.
    // With some browser settings localStorage can give an access denied exception this is a safe gaurd against that

    // localstorage is not guaranteed to be available everywhere
    let localStorage: any = null;
    try {
        localStorage = window.localStorage;
        if (localStorage) {
            spzaUserId = localStorage.getItem('spzaUserId');
        }
    } catch (err) {
        spzaUserId = 'localstorage inaccessible on this machine';
    }

    if (!spzaUserId) {
        // note how we treat a user that doesn't have localstorage as a new user each time. 
        spzaUserId = generateGuid();
        newUserModifier = Constants.Telemetry.ActionModifier.SpzaUserIdNew;

        if (localStorage) {
            try {
                localStorage.setItem('spzaUserId', spzaUserId);
            } catch (err) {
                console.log('local storage not accessible');
            }
        }
    }

    return {
        spzaUserId: spzaUserId,
        newUserModifier: newUserModifier
    };
}

// This method logs the landing page details, user settings, perf
export function logInitialTelemetryEvents(store: any) {
    
}

export function logTenantInfo(users: IUserDataState, isAutoSign: boolean, spzaUserId: string) {
    let instrument = SpzaInstrumentService.getProvider();
    if (users && users.signedIn && users.email) {
        let tenant = '';
        let emailParts = users.email.split('@');
        if (emailParts.length > 1) {
            tenant = emailParts[1];
        }

        // When the user is signed in, we need to correlate the spzaUserId with the signed-in information.
        // We extract the tid and oid and then map it to the spzaUserId
        let userDetails = {
            'tenant name': tenant,
            'tenand id': users.tid ? users.tid : '',
            'oid': users.oid ? users.oid : '',
            'spzaUserId': spzaUserId,
            'isAutoSign': isAutoSign,
            'isMSAUser': users.isMSAUser,
            'isFieldUser': users.isFieldUser,
            'emailHash': sha256(users.email).toString(),
            'alternateEmailHash': (users.alternateEmail && users.alternateEmail !== 'undefined') ? sha256(users.alternateEmail).toString() : ''
        };

        let tenantPayload = {
            eventName: Constants.Telemetry.Action.UserTenantInfo,
            data: JSON.stringify(userDetails)
        };

        instrument.probe<any>('logOneTimeInfo', tenantPayload);
    }
}

export function encodeVulnerableDataInInitalState(initialState: any) {
    let userState = initialState.users as IUserDataState;
    userState.firstName = encodeURI(userState.firstName);
    userState.lastName = encodeURI(userState.lastName);
    userState.displayName = encodeURI(userState.displayName);
    userState.email = encodeURI(userState.email);
    userState.alternateEmail = encodeURI(userState.alternateEmail);
}

export function decodeVulnerableDataInInitalState(initialState: any) {
    let userState = initialState.users as IUserDataState;
    userState.firstName = decodeURI(userState.firstName);
    userState.lastName = decodeURI(userState.lastName);
    userState.displayName = decodeURI(userState.displayName);
    userState.email = decodeURI(userState.email);
    userState.alternateEmail = decodeURI(userState.alternateEmail);
}

// Algorithm to find if a product supports MSA or not :
// By default AAD is supported by all the products
// App has products field which has list of products it supports.
// We need to iterate over all the products. 
// We need to show MSA + AAD signin dialog when all the products which we show support MSA
// else default to AAD signin.
export function isMSASupported(products: number) {
    let isMSAProduct = true;
    let bitmaskMatch = false; // We need to have at least one product supporting MSA

    for (let key in DataMap.products) {
        if (isOfficeNonSaasApp(key) && (products & DataMap.products[key].FilterID)) {
            bitmaskMatch = true;
            isMSAProduct = isMSAProduct && DataMap.products[key].AllowMSA;
        }
    }

    return (bitmaskMatch && isMSAProduct);
}

export function getSignInModalType(products: number, userInfo: IUserDataState) {
    let isMSAUser = userInfo.isMSAUser;
    let isMSASupportedProduct = isMSASupported(products);

    if (!userInfo.signedIn) {
        if (isMSASupportedProduct) {
            return Constants.SignInType.SignInWith_MSA_AAD; // For WXPO products which support both
        } else {
            return Constants.SignInType.SignInWith_AAD;
        }
    }

    // We need to switch to AAD signin dialog when :
    // 1) User is already signed in
    // 2) The product doesn't support MSA
    // 3) The user is an MSA user
    if (userInfo.signedIn && !isMSASupportedProduct && isMSAUser) {
        return Constants.SignInType.SwitchTo_AAD;
    }

    // If all the above conditions failed, it means the user is already signed in with proper authentication and can continue to Consent modal.
    return Constants.SignInType.Authorized;
}