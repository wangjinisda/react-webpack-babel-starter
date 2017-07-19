import * as httpProtocol from './httpProtocol';
import { ITelemetryData } from '../../Models';
import { getWindow } from '../../services/window';
import { Constants } from '../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    clientType: 'webBrowser',
    requireCorrelationId: true,
    stringifyPostData: false,
    allowOrigin: true,
    fullEndpoint: false
};

export interface LeadInfo {
    appId?: string;
    product?: number;
    partnerId?: string;
}

const errorMessage = {
    'Failed to search': '[Fail] Failed to search apps.'
};


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

export function get(accessToken: string) {

    let endpoint = getAppConfig('graphApi') + '/v1.0/me/photo/$value';

    let get = httpProtocol.get(endpoint, option);

    return get.setHeader('Authorization', accessToken).request()
        .then((result: any) => {
            let reader = new FileReader();
            reader.readAsDataURL(result);
            reader.onloadend = function () {
                return (reader.result);
            };
        })
        .catch((error: any) => {
            logError('Failed to search');
            return Promise.reject(error);
        });
}