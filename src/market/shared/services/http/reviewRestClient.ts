import * as httpProtocol from './httpProtocol';
import { ITelemetryData, IUserReview } from '../../Models';
import { getWindow } from '../../services/window';
import { Constants } from '../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    requireCorrelationId: true,
    stringifyPostData: false
};

const errorMessage = {
    'Failed to post': 'Cannot submit review to the service.',
    'Failed to get': 'Unable to fetch user reviews from the service.',
    'Failed to delete': 'Unable to perform the delete operation from the service.',
    'appId not availble': 'appId is not available to perform this operation'
};

function logError(index: string, error?: any) {
    let instrument = SpzaInstrumentService.getProvider();

    let code = '';
    if (error && error.response && error.response.statusCode) {
        code = error.response.statusCode.toString();
    };

    instrument.probe<ITelemetryData>(
        'logAndFlushTelemetryInfo',
        generateTelemetryPayload(errorMessage[index] + ' ' + code)
    );
}

export function generateTelemetryPayload(details: any): ITelemetryData {
    let _details = details || '';

    if (typeof details !== 'string') {
        _details = JSON.stringify(details);
    }

    let page = 'server';
    if ( getAppConfig('runtimeEnvironment') === 'browser' ) {
        page = getWindow().location.href;
    }

    return {
        page: page,
        action: Constants.Telemetry.Action.Click,
        actionModifier: Constants.Telemetry.ActionModifier.Error,
        details: _details
    };
}

export function post(authMethod: string, authKey: string, review: IUserReview) {

    let endpoint = '/api/userreview';

    let instrument = SpzaInstrumentService.getProvider();
    instrument.probe<ITelemetryData>(
        'logAndFlushTelemetryInfo',
        generateTelemetryPayload({
            event: 'submit review',
            appName: review.title,
            appId: review.appid
        }));

    let post = httpProtocol.post(endpoint, option);
    return post.setHeader(authMethod, authKey)
        .setData(review)
        .request()
        .catch((error: any) => {
            logError('Failed to post', error);
            return Promise.reject(error);
        });
}

export function get(authMethod: string, authKey: string, appId: string): Promise<IUserReview[]> {

    if (!appId || appId === '*') {
        appId = '';
    }

    let endpoint = '/api/userreview/' + appId;

    let get = httpProtocol.get(endpoint, option);
    return get.setHeader(authMethod, authKey)
        .request()
        .catch((error: any) => {
            logError('Failed to get', error);
            return Promise.reject(error);
        });
}

export function del(authMethod: string, authKey: string, appId: string): Promise<any> {

    let endpoint = '/api/userreview/' + appId;

    if (!appId) {
        logError('appId not available');
        return null;
    };

    let del = httpProtocol.del(endpoint, option);
    del.option.parseResult = false;

    return del.setHeader(authMethod, authKey)
        .request()
        .catch((error: any) => {
            logError('Failed to delete', error);
            return Promise.reject(error);
        });
}