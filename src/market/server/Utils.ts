import * as models from './ApiModels';
import { Constants } from './../shared/utils/constants';
import * as fs from 'fs';
import { IRequestContext } from '../shared/Models';
import { ODataQuery, RequestQuery } from './api/RequestQuery';
import { GetLanguageCode } from './../shared/utils/locales';
import * as logHelper from './LogHelper';
import { isValidAPIVersion, errorMessages } from './api/ApiVersion';

const base64url = require('base64url');

let crypto = require('crypto');
let jwt = require('jsonwebtoken');
let userColectionPrefix = process.env.userCollectionPrefix || 'users';
let userCollectionSchemaVersion = process.env.userCollectionSchemaVersion || Constants.userCollectionSchemaVersion;
const userCollectionName: string = userColectionPrefix + '_' + userCollectionSchemaVersion;
const emptyId = '00000000-0000-0000-0000-000000000000';

export function getCertHash(thumbprint: string) {
    let b = new Buffer(20);

    let j = 0;
    let s = '';
    for (let i = 0; i < 20; i++) {
        s = thumbprint.substring(j, j + 2);
        b[i] = parseInt(s, 16);
        j = j + 2;
    };

    return base64url.encode(b);
}

export function generateUid(len: number) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')
        .slice(0, len);
}

export class RequestHeaders {
    requestId: string;
    correlationId: string;
    authorization?: string;

    constructor(requestId: string, correlationId: string, authorization?: string) {
        this.requestId = requestId;
        this.correlationId = correlationId;
        this.authorization = authorization;
    }
}

export class RequestCookies {
    appSourceCookie: string;
    appSourceLeadCookie: string;

    constructor(appSourceCookie?: string, appSourceLeadCookie?: string) {
        this.appSourceCookie = appSourceCookie;
        this.appSourceLeadCookie = appSourceLeadCookie;
    }
}

export function extractRequestCookies(req: any): RequestCookies {
    let appSourceCookie: string = null;
    let appSourceLeadCookie: string = null;

    if (req && req.cookies) {
        appSourceCookie = req.cookies[Constants.Cookies.AppSourceCookie] || null;
        appSourceLeadCookie = req.cookies[Constants.Cookies.AppSourceLeadCookie] || null;
    }

    return new RequestCookies(appSourceCookie, appSourceLeadCookie);
}


// Recommended to use this method to get the requestId and correlationId as a single typed object from a request object
export function extractRequestHeaders(req: any): RequestHeaders {
    let requestId = Constants.ReservedCorrelationIds.EmptyId;
    let correlationId = Constants.ReservedCorrelationIds.EmptyId;
    let authorization: string = null;

    if (req) {
        requestId = req.headers[Constants.Headers.RequestId] || Constants.ReservedCorrelationIds.EmptyId;
        correlationId = req.headers[Constants.Headers.CorrelationId] || Constants.ReservedCorrelationIds.EmptyId;
        authorization = req.headers[Constants.Headers.Authorization] || null;
    }

    return new RequestHeaders(requestId, correlationId, authorization);
}

// Helper method to create an Outgoing Request
export function createOutgoingHttpContext(incomingRequest: any, operation: string,
    httpMethod: string, hostname: string, targetUri: string,
    apiVersion: string, contentLength: number, headers: string): models.IHttpRequestContext {
    let requestId = emptyId;
    let correlationId = emptyId;
    if (incomingRequest) {
        if (incomingRequest.headers) {
            requestId = incomingRequest.headers[Constants.Headers.RequestId] || emptyId;
            correlationId = incomingRequest.headers[Constants.Headers.CorrelationId] || emptyId;
        }
    }
    let requestContext: models.IHttpRequestContext = {
        requestID: requestId,
        correlationID: correlationId,
        operation: operation || '',
        httpMethod: httpMethod || '',
        hostName: hostname || '',
        targetUri: targetUri || '',
        userAgent: '',
        clientIpAddress: '',
        apiVersion: apiVersion || '',
        contentLength: contentLength || 0,
        headers: JSON.stringify(headers) || ''
    };
    return requestContext;
}

export function getStringQueryParam(req: any, queryParamKey: string): string {
    if (!req || !req.query || !req.query[queryParamKey]) {
        // Handle it as a 400 in the future
        return null;
    }

    let queryParamValue: any = req.query[queryParamKey];
    if (Array.isArray(queryParamValue)) {
        if (queryParamValue.length === 0) {
            return null;
        }

        // When we receive retries from the front end view API's we currently receive duplicate 
        // query string parameters and we reject the request. We are temporarily allowing the 
        // multiple query string parameters to be used with the first value to be used. This will
        // be removed once the front end retry logic no longer sends multiple query string parameters
        // on retries.
        queryParamValue = queryParamValue[0];

        // TODO: Re-enable this and remove the line above once the retry logic sends single query string parameters.
        // If multiple values are provided for the same query param, throw Error
        // throw Error(queryParamKey + errorMessages.multipleValuesForQueryParam);
    }

    return decodeURIComponent(queryParamValue);
}

export function throwIfQueryParamPresent(req: any, queryParamKey: any) {
    let value = getStringQueryParam(req, queryParamKey);
    if (value) {
        throw Error(queryParamKey + ' is not supported');
    }
}

interface IStringMap {
    [key: string]: string;
}

function Merge(obj1: IStringMap, obj2: IStringMap) {
    for (let prop in obj2) {
        if (obj2.hasOwnProperty(prop)) {
            obj1[prop] = obj2[prop];
        }
    }
}

const path = require('path');

// TODO: Consider taking a dependency on 3rd party libraries like promisify-node.
// Since this seemed to be the only use, it was an overkill for now.
function readDir(dir: string) {
    return new Promise(function (resolve, reject) {
        fs.readdir(dir, function (err: any, files: string[]) {
            if (err) {
                reject(err);
            }
            resolve(files);
        });
    });
}

function readFile(file: string) {
    return new Promise(function (resolve, reject) {
        fs.readFile(file, 'utf8', function (err: any, data: string) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

function readStat(file: string) {
    return new Promise(function (resolve, reject) {
        fs.stat(file, function (err: any, stat: fs.Stats) {
            if (err) {
                reject(err);
            }
            resolve(stat);
        });
    });
}

export function readLocaleDirectoriesRecursive(fulldir: string, additionalResourcesFileName: string): Promise<any> {
    fulldir = path.normalize(path.resolve(process.cwd(), fulldir));
    let stringMap: IStringMap = {};
    return readDir(fulldir)
        .then((files: string[]) => {
            let fpromises = files.map((o: string) => {
                o = path.normalize(fulldir + '/' + o);
                return readStat(o)
                    .then<any>((stat: fs.Stats) => {
                        if (stat.isDirectory()) {
                            return readLocaleDirectoriesRecursive(o, additionalResourcesFileName).then((sm: IStringMap) => Merge(stringMap, sm));
                        }
                        if (stat.isFile()) {
                            if (o.indexOf('resources.json') > -1 || o.indexOf(additionalResourcesFileName) > -1) {
                                return readFile(o)
                                    .then((data: string) => {
                                        let localepath = o.substr(0, o.lastIndexOf('\\'));
                                        let localekey = GetLanguageCode(localepath.substr(localepath.lastIndexOf('\\') + 1));
                                        let localizationData = stringMap[localekey];
                                        if (data) {
                                            if (localizationData) {
                                                // there is already data, let's merge in the additional data
                                                let additionalData = JSON.parse(data);
                                                for (let key in additionalData) {
                                                    localizationData[key] = additionalData[key];
                                                }
                                            } else {
                                                localizationData = JSON.parse(data);
                                            }
                                        }
                                        // write it back
                                        stringMap[localekey] = localizationData;
                                    });
                            }
                        }
                    });
            });
            return Promise.all(fpromises);
        })
        .then(() => stringMap);
}

export function getUserCollectionName() {
    return userCollectionName;
}

export function getRequestContext(req: any) {
    let requestId = Constants.ReservedCorrelationIds.EmptyId;
    let correlationId = Constants.ReservedCorrelationIds.EmptyId;
    let apiVersion = Constants.appsourceApiVersion;
    let requestUrl = '';
    let headers: any[] = [];

    if (req) {
        requestId = req.headers[Constants.Headers.RequestId] || Constants.ReservedCorrelationIds.EmptyId;
        correlationId = req.headers[Constants.Headers.CorrelationId] || Constants.ReservedCorrelationIds.EmptyId;
        apiVersion = getStringQueryParam(req, 'api-version') || getStringQueryParam(req, 'version');
        requestUrl = req.url;
        headers = req.headers;
    }

    let requestContext: IRequestContext = {
        correlationId: correlationId,
        requestId: requestId,
        operation: requestUrl,
        apiVersion: apiVersion,
        continuation: null,
        headers: headers
    };

    return requestContext;
}

export function rotateArray(array: any[], numElements: number) {
    while (numElements-- > 0) {
        let tmp = array.shift();
        array.push(tmp);
    }

    return array;
}


// TODO: Move this method and getRequestContext methods out of Utils.tsx
//       to remove the cyclic dependency on Utils.tsx from these classes
export function getRequestQuery(req: any) {
    let query = new RequestQuery();
    let requestHeaders = extractRequestHeaders(req);
    let requestContext = getRequestContext(req);

    checkAndLogDuplicateQueryStringParameters(req, requestContext);

    query.requestContext = requestContext;
    query.apiVersion = getStringQueryParam(req, 'api-version');
    query.flightCode = getStringQueryParam(req, 'flightCodes');
    query.billingRegion = getStringQueryParam(req, 'billingregion');
    query.appId = getStringQueryParam(req, 'appId');
    query.planId = getStringQueryParam(req, 'planId');
    query.partnerId = getStringQueryParam(req, 'partnerId');
    query.testDriveOfferId = getStringQueryParam(req, 'testdriveofferid');
    query.id = getStringQueryParam(req, 'id');
    query.headers = requestHeaders;
    query.odataQuery = ODataQuery.createODataQuery(req);
    query.cookies = extractRequestCookies(req);
    query.requestContext.continuation = query.odataQuery.$skiptoken;

    if (!query.apiVersion) {
        throw Error(errorMessages.missingApiVersion);
    } else if (!isValidAPIVersion(query.apiVersion)) {
        throw Error(errorMessages.invalidApiVersion);
    }

    return query;
}

function checkAndLogDuplicateQueryStringParameters(req: any, requestContext: IRequestContext) {
    if (!req || !req.query) {
        return;
    }

    let keys = Object.keys(req.query);
    for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(req.query[keys[i]])) {
            logDebug(requestContext, 'Duplicate query string parameters found:' + req.originalUrl);
            break;
        }
    }
}

export function logDebug(requestContext: IRequestContext, message: string) {
    if (logHelper.hasOwnProperty('Logger')) {
        logHelper.Logger.logDebugMessage(requestContext.requestId, requestContext.correlationId, requestContext.operation, message);
    }
}

export function logError(requestContext: IRequestContext, message: string, error: string) {
    if (logHelper.hasOwnProperty('Logger')) {
        logHelper.Logger.logError(requestContext.operation, message, error,
            { requestId: requestContext.requestId, correlationId: requestContext.correlationId });
    }
}

export function logAcquisitionInfo(requestContext: IRequestContext, body: any) {
    if (logHelper.hasOwnProperty('Logger')) {
        logHelper.Logger.LogAcquisitionInfo(requestContext.requestId, requestContext.correlationId, body, this.authToken);
    }
}

/**
 * Helper function for logging the outbound request end.
 * 
 * @param {models.IHttpRequestContext} request : The HttpRequestContext.
 * @param {number} duration : The duration of the request.
 * @param {number} httpStatus : The Http Status response code.
 * @param {string} errorMessage : The error message if available.
 */
export function logOutboundRequestEnd(request: models.IHttpRequestContext, duration: number, httpStatus: number, errorMessage: string) {
    if (logHelper.hasOwnProperty('Logger')) {
        logHelper.Logger.LogOutboundRequestEnd(request, duration, httpStatus, errorMessage);
    }
}

export function IsAppAndPartnerDataMerged(): boolean {
    let settingValue = process.env.mergeDataCollections || 'false';
    return (settingValue === 'true');
}

export function IsSASExtensionForSendMailEnabled(): boolean {
    let settingValue = process.env.extendSASValidity || 'false';
    return (settingValue === 'true');
}

// This is the helper function which generates the HTML for the sub Iframe for auto sign-in.
// This HTML will help the iFrame to post message to the parent and do the auto sign-in.
export function getIframeHTML(user: any, from: string, requestId: string, correlationId: string) {
    let HTML = '',
        userOid = '',
        userTid = '';

    if (user && user.accessToken && user.accessToken.spza) {
        let decodedToken = jwt.decode(user.accessToken.spza);
        userOid = decodedToken ? decodedToken.oid : '';
        userTid = decodedToken ? decodedToken.tid : '';
    }

    // Check whether the mandatory fields are null or not before posting the message to the parent window.
    // TODO : oid and tid will be null. These values should be fetched from graph API
    if (user && user.id && user.signedIn && user.group
        && user.idToken && user.accessToken && user.refreshToken
        && user.givenName && user.familyName && user.email) {
        let u = {
            msgType: 'authIframe',
            id: user.id,
            signedIn: user.signedIn,
            group: user.group,
            idToken: user.idToken,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
            firstName: user.givenName,
            lastName: user.familyName,
            displayName: user.displayName || '',
            oid: userOid,
            tid: userTid,
            email: user.email,
            alternateEmail: user.alternateEmail || '',
            isMSAUser: user.isMSAUser || false,
            isFieldUser: user.isFieldUser || false
        };

        logHelper.Logger.logDebugMessage(requestId, correlationId, Constants.OperationNames.Signin, from + ' Auto SignIn successful. Passing the payload to parent from subIframe');

        // This is the post message payload which is sent to the parent window. This payload is handled in the appview's componentDidMount
        let payload = JSON.stringify(u);
        HTML =
            `<!DOCTYPE html>
                <html>
                  <head>
                    <script>window.parent.postMessage(\'${payload}\', '*')</script>
                  </head>
                </html>`;
    }

    return HTML;
}

export function isGuid(guid: string): boolean {
    let pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
    return pattern.test(guid);
}

export function checkReqHeaders(req: any) {
    if (req && req.headers) {
        let requestId = req.headers[Constants.Headers.RequestId];
        let correlationId = req.headers[Constants.Headers.CorrelationId];

        if (requestId && !isGuid(requestId)) {
            return 'No requestid or wrong request Id format in header';
        }

        if (correlationId && !isGuid(correlationId)) {
            return 'No correlationId or wrong correlationId format in header';
        }
    }

}

export function clone(obj: any): any {
    if (!obj) {
        return obj;
    }

    return JSON.parse(JSON.stringify(obj));
}

export function getAuthorizationTokenForDocDB(verb: any, resourceType: any, resourceLink: any, date: any, masterKey: any) {
    let key = new Buffer(masterKey, 'base64');

    let text = (verb || '').toLowerCase() + '\n' +
        (resourceType || '').toLowerCase() + '\n' +
        (resourceLink || '') + '\n' +
        date.toLowerCase() + '\n' +
        '' + '\n';

    let body = new Buffer(text, 'utf8');
    let signature = crypto.createHmac('sha256', key).update(body).digest('base64');
    let MasterToken = 'master';
    let TokenVersion = '1.0';

    return encodeURIComponent('type=' + MasterToken + '&ver=' + TokenVersion + '&sig=' + signature);
}

export function endsWith(str: string, suffix: string) {
    let regex = new RegExp(suffix + '$');
    return regex.test(str);
}

// Utility method to extract the query param 
 export function getQueryParamValue(queryParams: string, paramName: string) {
     let urlQueryParams = queryParams;
    // If we pass entire query string, instead of just query params, we need to strip out the first part to extract the query params
    if (queryParams.indexOf('?') > -1) {
        let splitValues = queryParams.split('?');
        urlQueryParams = (splitValues && splitValues.length > 1) ? splitValues[1] : urlQueryParams;
    }
    let keyValues = urlQueryParams ? urlQueryParams.split('&') : '';
    for (let i = 0; (keyValues && i < keyValues.length); i++) {
        let tuple = keyValues[i].split('=');
        if (tuple && tuple.length > 0 && (tuple[0] === paramName)) {
            return tuple[1];
        }
    }

    return '';
}
