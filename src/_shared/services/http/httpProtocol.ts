import { generateGuid } from '../../utils/appUtils';
import * as superagent from 'superagent';
require('superagent-retry')(superagent);
import { Promise } from 'es6-promise';
import { Constants } from '../../utils/constants';
import { getAppConfig } from '../init/appConfig';

const queryString = require('query-string');

export interface IHttpHeader {
    'Access-Control-Allow-Origin'?: string;
    'Access-Control-Allow-Methods'?: string;
    'Access-Control-Allow-Headers'?: string;
    'Content-Type'?: string;
    'x-ms-requestid'?: string;
    'x-ms-correlationid'?: string;
    'User-Agent'?: string;
}

export interface IHttpOption {
    clientType?: string;
    contentType?: string;
    requireCorrelationId?: boolean;
    flushTelemetry?: boolean;
    retry?: number;
    stringifyPostData?: boolean;
    parseResult?: boolean;
    allowOrigin?: boolean;
    fullEndpoint?: boolean;
    // When set, request(..) returns the actual response from the HTTP call.
    // Otherwise it returns only the response body.
    returnRawResponse?: boolean;
}

export const errorMessage = {
    'Failed to post': 'Failed to make a POST request',
    'Failed to get': 'Failed to make a GET request',
    'Failed to delete': 'Failed to make a DELETE request',
    'appId not availble': 'appId is not available to perform this operation',
    'correlationId not availble': 'correlationId is missing to perform this operation'
};

export class HttpWrapper {
    endpoint: string = '';
    query: any = {};
    baseUrl: string = '';
    header: IHttpHeader = {};
    option: IHttpOption = {};
    method: string = '';
    data: any;

    constructor(endpoint: string, method: string, option?: IHttpOption) {
        let appConfig = getAppConfig();

        // set default option
        this.addOption({
            clientType: appConfig.runtimeEnvironment,
            contentType: 'application/json',
            requireCorrelationId: true,
            flushTelemetry: false,
            retry: Constants.ClientHttpRequestRetryCount,
            stringifyPostData: false,
            parseResult: true,
            allowOrigin: false,
            fullEndpoint: false,
            returnRawResponse: false
        });

        // merge custom option
        if ( option ) {
            this.addOption(option);
        }

        if (this.option.fullEndpoint) {
            this.baseUrl = 'https://' + appConfig.hostname;
            this.endpoint = this.baseUrl + endpoint;
        } else {
            this.endpoint = endpoint;
        }

        if (this.option.clientType !== 'browser') {
            this.header['User-Agent'] = appConfig.httpUserAgent;
        }

        // set correlationId
        if (this.option.requireCorrelationId) {
            this.header[Constants.Headers.CorrelationId] = appConfig.correlationId;
        }

        this.header['Content-Type'] = this.option.contentType;
        this.header[Constants.Headers.RequestId] = generateGuid();

        this.method = method;
    }

    addOption(option: IHttpOption) {
        for (let entry in option) {
            if (option.hasOwnProperty(entry)) {
                this.option[entry] = option[entry];
            }
        };
        return this.option;
    }

    copyOption(option?: IHttpOption) {
        option = option || this.option;

        let copy: IHttpOption = {};
        for (let entry in option) {
            if (option.hasOwnProperty(entry)) {
                copy[entry] = option[entry];
            }
        };

        return copy;
    }

    setQuery(query: any) {
        if (query) {
            this.query = query;
        }
        return this;
    }

    addQuery(query: any) {
        for (let entry in query) {
            if (query.hasOwnProperty(entry)) {
                this.query[entry] = query[entry];
            }
        };
        return this;
    }

    addQueryEntry(entry: string, value: string) {
        if (!this.query) {
            this.setQuery({});
        }
        this.query[entry] = value;
        return this;
    }

    getQueryString(query?: any): string {
        query = query || this.query;
        if (query) {
            // It uses encodeURIComponent if 'strict' is set to false. Otherwise it strictly encodes URI components with strict-uri-encode.
            return queryString.stringify(query, {strict : false});
        } else {
            return '';
        }
    }

    setData(data: any) {
        this.data = data;
        return this;
    }

    setRetry(retry: number) {
        this.option.retry = retry;
        return this;
    }

    setHeader(entry: string, value: string) {
        this.header[entry] = value;
        return this;
    }

    setAuthHeader(token: string, authHeaderTitle = 'Authorization' ) {
        this.header[authHeaderTitle] = 'Bearer ' + token;
        return this;
    }

    addHeader(header: IHttpHeader) {
        for (let entry in header) {
            if (header.hasOwnProperty(entry)) {
                this.header[entry] = header[entry];
            }
        };
        return this.header;
    }

    emptyQuery() {
        if (!this.query) {
            return true;
        }

        for (let entry in this.query) {
            if (this.query.hasOwnProperty(entry)) {
                return false;
            }
        }
        return true;
    }

    request(retry?: number) {

        let url = this.endpoint;

        if ( !this.emptyQuery() ) {
            url += '?' + this.getQueryString(this.query);
        }

        let request: any = null;

        if (this.method === 'POST') {
            request = superagent.post(url);
        };

        if (this.method === 'GET') {
            request = superagent.get(url);
        };

        if (this.method === 'DELETE') {
            request = superagent.delete(url);
        };

        if ( retry == null ) {
            retry = this.option.retry;
        };

        if ( retry > 0 ) {
            request.retry(retry);
        };

        if (this.option.allowOrigin) {
            this.addHeader({
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
                'Access-Control-Allow-Headers': 'x-requested-with'
            });
        }

        if (this.option.requireCorrelationId && !this.header[Constants.Headers.CorrelationId]) {
            return Promise.reject(Error('CorrelationId not found in the header'));
        };

        // set headers
        for (let property in this.header) {
            if (this.header.hasOwnProperty(property)) {
                request.set(property, this.header[property]);
            }
        };

        // POST need data
        if (this.method === 'POST') {
            if (this.option.contentType === 'application/json' &&
                typeof this.data !== 'string' &&
                this.option.stringifyPostData) {
                request.send(JSON.stringify(this.data));
            } else {
                request.send(this.data);
            }
        };

        let self = this;

        return new Promise((resolve, reject) => {
            request.end(function (err: any, res: superagent.Response) {
                if (err === null && res) {
                    if (self.option.returnRawResponse) {
                        resolve(res);
                    } else if (res.ok && res.text && self.option.parseResult &&
                        (self.option.contentType === 'application/json' || res.header['Content-Type'] === 'application/json')) {
                        try {
                            let result = JSON.parse(res.text);
                            resolve(result);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        resolve(res.text);
                    }
                } else {
                    reject(err);
                }
            });
        });
    }
}

export function post(endpoint: string, option?: IHttpOption) {
    return new HttpWrapper(endpoint, 'POST', option);
}

export function get(endpoint: string, option?: IHttpOption) {
    return new HttpWrapper(endpoint, 'GET', option);
}

export function del(endpoint: string, option?: IHttpOption) {
    return new HttpWrapper(endpoint, 'DELETE', option);
}