let edge = require('edge');
let fs = require('fs');
import { ITelemetryEvent, ITelemetryData, ITelemetryEvents, IAppListingInfo, IPartnerListingInfo, IAcquistionPayload } from '../shared/Models';
import { IHttpRequest, IHttpRequestContext } from './ApiModels';
import { Constants } from './../shared/utils/constants';
import { generateGuid } from '../shared/utils/appUtils';
import { getStringQueryParam } from './Utils';

let stackTrace = require('stack-trace');
const emptyId = '00000000-0000-0000-0000-000000000000';
const path = require('path');
const jwt = require('jsonwebtoken');
let sha256 = require('crypto-js/sha256');
let agentParser = require('ua-parser-js');
const uuid = require('uuid');
const dll = require('./../../resources/Dlls/Microsoft.SaaSMarketPlace.Common.dll');
export module Logger {

    const LoggerDll: string = process.env.LOGGER_DLL_PATH || path.normalize(dll);
    // Series of CLR entry points to be used by edge, 
    // since we dont have an overload that takes the function name we have one func for each clr mrthod
    const clrDebug = getCLRMethod('Debug');
    const clrError = getCLRMethod('Error');
    const clrLogUserTelemetry = getCLRMethod('LogUserTelemetry');
    const clrLogHttpInboundRequestStart = getCLRMethod('LogHttpInboundRequestStart');
    const clrLogHttpInboundRequestEndWithSuccess = getCLRMethod('LogHttpInboundRequestEndWithSuccess');
    const clrLogHttpInboundRequestEndWithClientFailure = getCLRMethod('LogHttpInboundRequestEndWithClientFailure');
    const clrLogHttpInboundRequestEndWithServerFailure = getCLRMethod('LogHttpInboundRequestEndWithServerFailure');
    const clrLogHttpOutboundRequestStart = getCLRMethod('LogHttpOutboundRequestStart');
    const clrLogHttpOutboundRequestEndWithSuccess = getCLRMethod('LogHttpOutboundRequestEndWithSuccess');
    const clrLogHttpOutboundRequestEndWithServerFailure = getCLRMethod('LogHttpOutboundRequestEndWithServerFailure');
    const clrLogHttpOutboundRequestEndWithClientFailure = getCLRMethod('LogHttpOutboundRequestEndWithClientFailure');
    const clrLogPartnerAppInfo = getCLRMethod('LogPartnerAppInfo');
    const clrLogAcquisitionInfo = getCLRMethod('LogAcquisitionInfo');
    const clrLogDbResourceOverUsage = getCLRMethod('LogDbResourceOverUsage');

    let logStreamData: ILogStreamItem[] = null;
    let correlationIdToWatch = '';

    function getCLRMethod(methodName: string) {
        return edge.func({
            assemblyFile: process.env.LOGGER_DLL_PATH || path.normalize(dll),
            typeName: process.env.LOGGER_CLASS_NAME || 'Microsoft.SaaSMarketPlace.Common.Logging.NodeLogger',
            methodName: methodName
        });
    }

    // Call this function to start watch the log for the **session** based on the given correlation ID.
    // We use this function to immediately get the server side logs in the console for debugging purpose.
    export function startWatchingLog(correlationId: string) {
        correlationIdToWatch = correlationId;
        logStreamData = [];
        setTimeout(() => {
            stopWatchingLog(correlationId);
        }, 60000);  // Stop watching logs in 1 minute automatically in case we fail to stop watching log for any reasons.
    }

    export function stopWatchingLog(correlationId: string) {
        if (correlationId === correlationIdToWatch) {
            correlationIdToWatch = '';
            logStreamData = null;
        }
    }

    export function getLogStream(): ILogStreamItem[] {
        return logStreamData;
    }

    export function isWatchingLog(correlationId: string): boolean {
        return correlationIdToWatch === correlationId;
    }

    export function isLoggingEnabled(callbackFunction: Function) {
        return fs.exists(LoggerDll, callbackFunction);
    }

    function writeToLogStream(correlationId: string, operation: string, message: string) {
        if (correlationId && logStreamData && correlationId === correlationIdToWatch) {
            let now = new Date();
            let utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Gets the UTC time.
            logStreamData.push({
                timeStamp: utc.toISOString(),
                operation: operation,
                message: message
            });
        }
    }

    // To be used by Node server side code Debug events
    function Debug(operationName: string, message: string, exception: string, additionalData: any) {
        // A JSON object in the exception causes edge to crash with stack overflow hence the check.
        let exceptionString = '';
        if (exception) {
            // Stringify also handles non JSON object such as raw strings, int, bools etc..
            exceptionString = JSON.stringify(exception);
        }
        let debugMessage = {
            requestId: additionalData.requestId || uuid.v4(),
            correlationId: additionalData.correlationId || process.env.serverInstanceCorrelationId,
            operationName: operationName.toString() || '',
            message: message.toString() || '',
            exception: exceptionString
        };

        clrDebug(debugMessage);
    };

    // Overload to debug without request and correlationId for server debugging
    function Information(operationName: string, message: string, exception?: string, additionalData?: any) {
        // A JSON object in the exception causes edge to crash with stack overflow hence the check.
        let exceptionString = '';
        if (exception) {
            // Stringify handles non JSON object such as raw strings, int, bools etc..
            exceptionString = JSON.stringify(exception);
        }
        let requestId = uuid.v4();
        let correlationId = process.env.serverInstanceCorrelationId || emptyId;
        if (additionalData) {
            if (additionalData.requestId) {
                requestId = additionalData.requestId;
            }
            if (additionalData.correlationId) {
                correlationId = additionalData.correlationId;
            }
        }
        let debugMessage = {
            requestId: requestId,
            correlationId: correlationId,
            operationName: operationName.toString() || '',
            message: message.toString() || '',
            exception: exceptionString
        };

        clrDebug(debugMessage);
    };

    // To be used for Exception logging
    export function Exception(operationName: string, message: string, exception: string, otherInfo?: any) {

        let requestId = uuid.v4();
        let correlationId = process.env.serverInstanceCorrelationId;

        if (otherInfo) {
            requestId = otherInfo.requestId ? otherInfo.requestId : requestId;
            correlationId = otherInfo.correlationId ? otherInfo.correlationId : correlationId;

            if (otherInfo.request) {
                requestId = otherInfo.request.headers[Constants.Headers.RequestId] || requestId;
                correlationId = otherInfo.request.headers[Constants.Headers.CorrelationId] || correlationId;
            }
        }
        // A JSON object in the exception causes edge to crash with stack overflow hence the check.
        let exceptionString = '';
        if (exception) {
            // Stringify handles non JSON object such as raw strings, int, bools etc..
            exceptionString = JSON.stringify(exception);
        }
        let errorMessage = {
            requestId: requestId,
            correlationId: correlationId,
            operationName: operationName.toString() || '',
            message: message.toString() || '',
            exception: exceptionString
        };

        clrError(errorMessage);
    }

    // To be used by Browser via API route to log telemetry events
    export function LogTelemetryEvent(requestId: string, correlationId: string, event: ITelemetryEvent) {
        // For all the error events we want to add a hash based on the error stack/message for making the kusto queries easier. 
        if (event.actionModifier && event.actionModifier === Constants.Telemetry.ActionModifier.Error) {
            if (event.details) {
                event.details = JSON.stringify(getErrorDetailsWithHash(event.details));
            }
        }
        let message = {
            requestId: requestId || uuid.v4(),
            correlationId: correlationId || process.env.serverInstanceCorrelationId,
            page: event.page ? event.page.toString() : '',
            clientTimestamp: event.clientTimestamp ? event.clientTimestamp.toString() : '',
            action: event.action ? event.action.toString() : '',
            actionModifier: event.actionModifier ? event.actionModifier.toString() : '',
            details: event.details ? typeof (event.details) === 'string' ? event.details.toString() : JSON.stringify(event.details) : '',
            appName: event.appName ? event.appName.toString() : '',
            product: event.product ? event.product.toString() : '',
            featureFlag: event.featureFlag ? event.featureFlag.toString() : ''
        };
        clrLogUserTelemetry(message, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogTelemetry', error, '');
            }
        });
    }

    // To be used by Node server side API to log incoming requests start
    export function LogHttpInboundRequestStart(httpRequestContext: IHttpRequestContext) {
        clrLogHttpInboundRequestStart(httpRequestContext, function (error: any, result: any) {
            if (error) {
                Logger.Exception(httpRequestContext.operation, error, '', { requestId: httpRequestContext.requestID, correlationId: httpRequestContext.correlationID });
            }
        });
    }

    // To be used by Node server side API to log incoming requests end with success
    export function LogHttpInboundRequestEndWithSuccess(httpRequest: IHttpRequest) {
        clrLogHttpInboundRequestEndWithSuccess(httpRequest, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogHttpInboundRequestSuccess', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        }
        );
    }

    // To be used by Node server side API to log incoming requests end with client failure (4xx)
    export function LogHttpInboundRequestEndWithClientFailure(httpRequest: IHttpRequest) {
        clrLogHttpInboundRequestEndWithClientFailure(httpRequest, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogHttpInboundRequestEndWithClientFailure', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        });
    }

    // To be used by Node server side API to log incoming requests end with client failure (5xx)
    export function LogHttpInboundRequestEndWithServerFailure(httpRequest: IHttpRequest) {
        // console.log(httpRequest);
        clrLogHttpInboundRequestEndWithServerFailure(httpRequest, function (error: any, result: any) {
            if (error) {
                console.log(error);
                Logger.Exception('LogHttpInboundRequestEndWithServerFailure', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        });
    }

    // To be used by Node server side API to log outgoing requests start
    export function LogHttpOutboundRequestStart(httpRequestContext: IHttpRequestContext) {
        clrLogHttpOutboundRequestStart(httpRequestContext, function (error: any, result: any) {
            if (error) {
                Logger.Exception(httpRequestContext.operation, error, '', {
                    requestId: httpRequestContext.requestID,
                    correlationid: httpRequestContext.correlationID
                });
            }
        });
    }

    // To be used by Node server side API to log outgoing requests end with success
    export function LogHttpOutboundRequestEndWithSuccess(httpRequest: IHttpRequest) {
        clrLogHttpOutboundRequestEndWithSuccess(httpRequest, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogHttpOutboundRequestEndWithSuccess', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        });
    }

    // To be used by Node server side API to log outgoing requests end with client failure (4xx)
    export function LogHttpOutboundRequestEndWithServerFailure(httpRequest: IHttpRequest) {
        clrLogHttpOutboundRequestEndWithServerFailure(httpRequest, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogHttpOutboundRequestEndWithServerFailure', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        });
    }

    // To be used by Node server side API to log outgoing requests end with server failure (5xx)
    export function LogHttpOutboundRequestEndWithClientFailure(httpRequest: IHttpRequest) {
        clrLogHttpOutboundRequestEndWithClientFailure(httpRequest, function (error: any, result: any) {
            if (error) {
                Logger.Exception('LogHttpOutboundRequestEndWithClientFailure', error, '',
                    {
                        requestId: httpRequest.httpRequestContext.requestID,
                        correlationId: httpRequest.httpRequestContext.correlationID
                    });
            }
        });
    }

    // Helper method to log all Inbound request starts
    export function LogInboundRequestStart(request: any) {
        let requestId = uuid.v4();
        let correlationId = process.env.serverInstanceCorrelationId;
        // request can be null for direct server calls, thus the empty guids
        if (request) {
            // default to empty guids for missing headers
            requestId = request.headers[Constants.Headers.RequestId] || requestId;
            correlationId = request.headers[Constants.Headers.CorrelationId] || getStringQueryParam(request, 'correlationid') || correlationId;
        }
        try {
            let requestContext: IHttpRequestContext = {
                requestID: requestId,
                correlationID: correlationId,
                operation: request.baseUrl,
                httpMethod: request.method,
                hostName: request.hostname,
                targetUri: request.hostname + request.originalUrl,
                userAgent: request.headers[Constants.Headers.UserAgent] || '',
                clientIpAddress: '', // TODO: Bug node request is missing client ip behind a proxy,
                apiVersion: getStringQueryParam(request, 'version') || '',
                contentLength: request.headers['Content-Length'] || 0,
                headers: JSON.stringify(request.headers)
            };
            LogHttpInboundRequestStart(requestContext);

        } catch (exception) {
            Logger.Exception('LogHelper.LogInboundRequestStart', 'ExceptionLoggingRequest', exception);
        }
    }

    // Helper method to log all request end
    export function LogInboundRequestEnd(request: any, duration: number, httpStatus: number, errorMessage: string) {
        let requestId = uuid.v4();
        let correlationId = process.env.serverInstanceCorrelationId;
        if (request) {
            requestId = request.headers[Constants.Headers.RequestId] || requestId;
            correlationId = request.headers[Constants.Headers.CorrelationId] || getStringQueryParam(request, 'correlationid') || correlationId;
        }
        if (errorMessage) {
            // Stringify handles non JSON object such as raw strings, int, bools etc..
            errorMessage = JSON.stringify(errorMessage);
        }
        try {
            let requestContext: IHttpRequestContext = {
                requestID: requestId,
                correlationID: correlationId,
                operation: request.url,
                httpMethod: request.method,
                hostName: request.hostname,
                targetUri: request.hostname + request.url,
                userAgent: request.headers[Constants.Headers.UserAgent] || '',
                clientIpAddress: '', // TODO: Bug node request is missing client ip behind a proxy,
                apiVersion: getStringQueryParam(request, 'version') || '',
                contentLength: request.headers['Content-Length'] || 0,
                headers: JSON.stringify(request.headers)
            };

            let httpRequest: IHttpRequest = {
                httpRequestContext: requestContext,
                durationInMilliseconds: duration,
                httpStatusCode: httpStatus,
                errorMessage: errorMessage
            };

            if (httpStatus > 199 && httpStatus < 300) {
                LogHttpInboundRequestEndWithSuccess(httpRequest);
            } else if (httpStatus > 399 && httpStatus < 500) {
                LogHttpInboundRequestEndWithClientFailure(httpRequest);
            } else if (httpStatus > 499) {
                LogHttpInboundRequestEndWithServerFailure(httpRequest);
            }

        } catch (exception) {
            Logger.Exception('LogHelper.LogRequestEnd', 'ExceptionLoggingRequestEnd', exception);
        }
    }

    // Helper for logging outbound request end, since we create the request context we dont need to extract it from the express request
    export function LogOutboundRequestEnd(request: IHttpRequestContext, duration: number, httpStatus: number, errorMessage: string) {
        if (errorMessage) {
            // Stringify handles non JSON object such as raw strings, int, bools etc..
            errorMessage = JSON.stringify(errorMessage);
        }
        try {
            let httpRequest: IHttpRequest = {
                httpRequestContext: request,
                durationInMilliseconds: duration,
                httpStatusCode: httpStatus,
                errorMessage: errorMessage
            };
            if (httpStatus > 199 && httpStatus < 300) {
                LogHttpOutboundRequestEndWithSuccess(httpRequest);
            } else if (httpStatus > 399 && httpStatus < 500) {
                LogHttpOutboundRequestEndWithClientFailure(httpRequest);
            } else if (httpStatus > 499) {
                LogHttpOutboundRequestEndWithServerFailure(httpRequest);
            }
        } catch (exception) {
            Logger.Exception('LogHelper.LogOutboundRequestEnd', 'ExceptionLoggingRequestEnd', exception);
        }
    }

    // To be used by Browser via API route to log new ISV app info
    export function LogPartnerAppInfo(requestId: string, correlationId: string, info: IAppListingInfo | IPartnerListingInfo) {
        try {
            let message = {
                requestId: requestId,
                correlationId: correlationId,
                appInfoPayload: JSON.stringify(info)
            };
            clrLogPartnerAppInfo(message, function (error: any, result: any) {
                if (error) {
                    Logger.Exception('LogHelper.LogPartnerAppInfo', 'LogPartnerAppInfo', error);
                }
            });
        } catch (exception) {
            Logger.Exception('LoggerService.LogPartnerAppInfo', 'Error logging partner app info', exception, { requestId: requestId, correlationId: correlationId });
        }
    }

    export function LogDbResourceOverUsage(requestId: string, correlationId: string, requestCharge: number, latency: number, query: string) {
        try {
            let message = {
                requestId: requestId,
                correlationId: correlationId,
                requestCharge: (requestCharge ? requestCharge.toString() : '-1'),
                latency: (latency ? latency.toString() : '-1'),
                query: query
            };
            clrLogDbResourceOverUsage(message, function (error: any, result: any) {
                if (error) {
                    Logger.Exception('LogHelper.LogDbResourceOverUsage', 'LogDbResourceOverUsage', error);
                }
            });
        } catch (exception) {
            Logger.Exception('LoggerService.LogDbResourceOverUsage', 'Error logging db resource over usage', exception, { requestId: requestId, correlationId: correlationId });
        }
    }

    // To be used by Browser via API route to log app acquisition info
    export function LogAcquisitionInfo(requestId: string, correlationId: string, info: IAcquistionPayload, accessToken: any) {
        try {
            let token: any = accessToken ? jwt.decode(accessToken) : '';
            info.userInfo.firstName = info.userInfo.firstName ? info.userInfo.firstName : (token ? token.given_name : '');
            info.userInfo.lastName = info.userInfo.lastName ? info.userInfo.lastName : (token ? token.family_name : '');
            info.userInfo.email = info.userInfo.email ? info.userInfo.email : (token ? token.upn : '');
            info.userInfo.oid = info.userInfo.oid ? info.userInfo.oid : (token ? token.oid : '');
            info.userInfo.tid = info.userInfo.tid ? info.userInfo.tid : (token ? token.tid : '');
            Logger.LogAcquisitionInfoPayload(requestId, correlationId, info);
        } catch (exception) {
            Logger.Exception('Logger.LogAcquisitionInfo', 'Error logging acquisition info', exception, { requestId: requestId, correlationId: correlationId });
        }
    }

    // Separated these methods to call this one from tests to validate the arguments sent to this.
    export function LogAcquisitionInfoPayload(requestId: string, correlationId: string, info: IAcquistionPayload) {
        let message = {
            requestId: requestId,
            correlationId: correlationId,
            acquisitionInfoPayload: JSON.stringify(info)
        };
        clrLogAcquisitionInfo(message, function (error: any, result: any) {
            if (error) {
                Logger.Exception('Logger.LogAcquisitionInfo', 'LogAcquisitionInfo', error);
            }
        });
    }

    export function LogTelemetryEvents(requestId: string, correlationId: string, telemetrybatch: ITelemetryEvents, req?: any) {
        try {
            for (let i = 0; i < telemetrybatch.TelemetryEvents.length; i++) {
                try {
                    Logger.LogTelemetryEvent(requestId, correlationId, telemetryHelper(telemetrybatch.TelemetryEvents[i], req));
                } catch (exception) {
                    Logger.Exception('LoggerService.LogTelemetryEvents', 'Error logging telemetry row', exception, { requestId: requestId, correlationId: correlationId });
                }
            }
        } catch (exception) {
            Logger.Exception('LoggerService.LogTelemetryEvents', 'Error logging telemetry batch', exception, { requestId: requestId, correlationId: correlationId });
        }
    }

    export function logServerTelemetryEvent(payload: ITelemetryData, correlationId: string) {
        let event: ITelemetryEvent = {
            page: payload.page ? payload.page : '',
            action: payload.action ? payload.action : '',
            actionModifier: payload.actionModifier ? payload.actionModifier : '',
            clientTimestamp: new Date().toISOString(),
            details: payload.details ? payload.details : ''
        };

        let outEvents = { 'TelemetryEvents': [event] };
        let requestId = generateGuid();
        LogTelemetryEvents(requestId, correlationId, outEvents);
    }

    let noOp = function () { /* Do nothing. */ };
    export function EnableConsolePolicy() {
        if (process.env.siteEnvironment === 'prod') {
            console.error = noOp;
        } else if (process.env.enableLog !== 'true') {
            console.log = noOp;
            console.warn = noOp;
        }
    }

    function errorToConsole(message: string) {
        if (process.env.siteEnvironment !== 'prod') {
            console.error(message);
        }
    }

    export function logDebugMessage(requestId: string, correlationId: string, operation: string, message: string) {
        console.log(message);
        Debug(operation, message, '', { requestId: requestId, correlationId: correlationId });
        writeToLogStream(correlationId, operation, message);
    }

    export function logErrorMessage(requestId: string, correlationId: string, operation: string, message: string) {
        console.log(message);
        Exception(operation, message, '', { requestId: requestId, correlationId: correlationId });
    }

    export function logInfoMessage(operation: string, message: string, exception?: string, additionalData?: any, correlationId?: string) {
        console.log(message);
        Information(operation, message, exception, additionalData);
        writeToLogStream(correlationId, operation, message);
    }

    export function logError(operation: string, message: string, err: string, additionalData?: any, correlationId?: string) {
        errorToConsole(message);
        let trace = stackTrace.parse(err);
        errorToConsole(trace);
        Logger.Exception(operation, message + ':' + err, trace, additionalData);

        let payload: ITelemetryData = {
            page: 'Error Page (Server)',
            action: 'Page Load',
            actionModifier: Constants.Telemetry.ActionModifier.Error,
            details: '[Error Trace] ' + err + '   Stack: ' + JSON.stringify(trace)
        };

        logServerTelemetryEvent(payload, additionalData && additionalData.correlationId ? additionalData.correlationId : emptyId);
        writeToLogStream(correlationId, operation, message);
    }

    // Creates a hash based on the error stack or on the error message and returns the JSON with the hash
    function getErrorDetailsWithHash(errorMessage: string) {
        let errorStack = errorMessage.split('Stack:');
        let hash = errorStack.length > 0 ? sha256(errorStack[1]) : sha256(errorMessage);
        let errorDetails = {
            message: errorMessage,
            errorHash: hash.toString()
        };
        return errorDetails;
    }

    function telemetryHelper(event: ITelemetryEvent, req: any) {
        if (event.action === Constants.Telemetry.Action.UserSettings) {
            let originalResult = event.details;
            let ua: string = req.headers[Constants.Headers.UserAgent] || req.headers['user-agent'];
            let parseResult = 'undefined';
            if (ua) {
                parseResult = JSON.stringify(agentParser(ua));
            }

            let ip: string = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let ipMask = 'undefined';
            if (ip) {
                let ipParts = ip.split('.');
                if (ipParts.length > 2) {
                    ipMask = ipParts[0] + '.' + ipParts[1] + '.' + ipParts[2] + '.' + 'xxx';
                }
            }
            let ipResult = JSON.stringify({
                clientIP: ipMask
            });

            let updatedDetails = originalResult.substring(0, originalResult.length - 1) + ','
                + parseResult.substring(1, parseResult.length - 1) + ','
                + ipResult.substring(1, ipResult.length);
            event.details = updatedDetails;
            return event;
        } else {
            return event;
        }
    }
}

export interface ILogStreamItem {
    timeStamp: string;
    operation: string;
    message: string;
}