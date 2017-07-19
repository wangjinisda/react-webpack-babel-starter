import * as httpProtocol from './httpProtocol';
import { ITelemetryData } from '../../Models';
import { getWindow } from '../../services/window';
import { Constants } from '../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { ILeadgenPayload, IAcquistionPayload } from '../../Models';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    clientType: 'webBrowser',
    requireCorrelationId: true,
    stringifyPostData: false
};

export interface LeadInfo {
    appId?: string;
    product?: number;
    partnerId?: string;
    planId?: string;
}

const errorMessage = {
    'Failed to post LeadInfo': '[Fail] Failed to submit lead info data',
    'Failed to post AcqInfo': '[Fail] Failed to submit acquisition info data'
};

export function generateTelemetryPayload(details: any): ITelemetryData {
    let _details = details || '';

    if (typeof details !== 'string') {
        _details = JSON.stringify(details);
    }

    let page = 'server';
    if (getAppConfig('runtimeEnvironment') === 'browser') {
        page = getWindow().location.href;
    }

    return {
        page: page,
        action: Constants.Telemetry.Action.Click,
        actionModifier: Constants.Telemetry.ActionModifier.Error,
        details: _details
    };
}

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

export function postLeadgenInfo(leadInfo: LeadInfo, payload: ILeadgenPayload, accessToken: string) {
    let endpoint = '/view/createLead';
    let config = getAppConfig('config');

    // empty leadinfo
    if (!leadInfo && (Object.keys(leadInfo).length === 0 && leadInfo.constructor === Object)) {
        throw Error('[Failure] Lead gen api query params is 0');
    }

    let post = httpProtocol.post(endpoint, option);

    if (accessToken) {
        post.setAuthHeader(accessToken);
    }

    return post
        .setQuery(leadInfo)
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .addQueryEntry('flightCodes', config.flightCodes)
        .setData(payload)
        .request()
        .catch((error: any) => {
            logError('Failed to post LeadInfo', error);
            return Promise.reject(error);
        });
}

export function postAcquisitionInfo(payload: IAcquistionPayload, accessToken: string, isNationalCloud: boolean) {
    let endpoint = '/api/acquisitionInfo';

    let post = httpProtocol.post(endpoint, option);

    if (accessToken && !isNationalCloud) {
        post.setAuthHeader(accessToken);
    }

    return post.setData(payload).request()
        .then((result: string) => {
            return (result);
        },
        (error: any) => {
            logError('Failed to post AcqInfo', error);
            return Promise.reject(error);
        });
}
