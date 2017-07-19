import * as logHelper from '../../server/LogHelper';
import * as models from '../../shared/Models';

/**
 * Parse the authorization header details and return an object containing the username / password.
 * 
 * @param {models.IRequestContext} requestContext - The request context.
 * @param {string} authorizationHeader - The authorization header value.
 * @returns
 * 
 * @memberOf EmailTelemetryController
 */
export function ParseAuthorizationHeader(requestContext: models.IRequestContext, authorizationHeader: string): any {
    if (authorizationHeader && authorizationHeader !== '') {
        let parts = authorizationHeader.split(' ');

        if (parts[0] === 'Basic') {
            let values = new Buffer(parts[1], 'base64').toString('ascii').split(':');
            let username = values[0];
            let password = values[1];

            return { username: username, password: password };
        } else {
            // Invalid scheme
            logDebug(requestContext, 'basicAuthUtils.ParseAuthorizationHeader', 'The authorization scheme is invalid. Expected "Basic" but received:' + parts[0]);
        }
    } else {
        // Header undefined or empty
        logDebug(requestContext, 'basicAuthUtils.ParseAuthorizationHeader', 'authorization header is required for authentication but is undefined or empty.');
    }

    return null;
}

function logDebug(requestContext: models.IRequestContext, operation: string, message: string) {
    if (logHelper.hasOwnProperty('Logger')) {
        logHelper.Logger.logDebugMessage(requestContext.requestId, requestContext.correlationId, requestContext.operation, message);
    }
}