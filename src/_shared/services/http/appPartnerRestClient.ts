import * as httpProtocol from './httpProtocol';
import { IPartnerListingInfo, ITelemetryData } from '../../models/models';
import { getWindow } from '../../services/window';
import { Constants } from '../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    requireCorrelationId: true,
    stringifyPostData: false,
    fullEndpoint: true
};

export interface LeadInfo {
    appId?: string;
    product?: number;
    partnerId?: string;
}

let errorMessage = {
    'Failed to search': '[Fail] Failed to search apps.'
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

export function getTileData(flightCode: string, includeOfficeApps: boolean) {
    let endpoint = '/view/tiledata/';
    let get = httpProtocol.get(endpoint, option);

    if (flightCode) {
        get.addQueryEntry(Constants.QueryStrings.flightCodes, flightCode);
    }

    if (includeOfficeApps) {
        get.addQueryEntry('officeApps', 'true');
    }

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getInitialState');
            return Promise.reject(error);
        });
}

export function getExtraData(idList: { [id: string]: number }) {
    let endpoint = '/view/appsextra/';
    let post = httpProtocol.post(endpoint, option);

    return post
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .setData(idList)
        .request()
        .catch((error: any) => {
            logError('Failed to getExtraData');
            return Promise.reject(error);
        });
}

export function getAppPricing(id: string, billingRegion?: string) {
    let endpoint = '';
    endpoint += '/view/appPricing/' + id;

    if (billingRegion) {
        endpoint += '/' + billingRegion;
    }

    let get = httpProtocol.get(endpoint, option);

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getAppPricing');
            return Promise.reject(error);
        });
}

export function getApps(id?: string, flightCode?: string, billingRegion?: string, includeExtraData?: boolean, includeOfficeApps?: boolean) {
    let endpoint = '';
    if (id) {
        endpoint += '/view/app/' + id;
    } else {
        endpoint += '/view/apps';
    }

    let get = httpProtocol.get(endpoint, option);

    if (flightCode) {
        get.addQueryEntry(Constants.QueryStrings.flightCodes, flightCode);
    }

    if (billingRegion) {
        get.addQueryEntry(Constants.QueryStrings.billingRegion, billingRegion);
    }

    if (includeExtraData) {
        get.addQueryEntry('extraData', 'true');
    }

    if (includeOfficeApps) {
        get.addQueryEntry('officeApps', 'true');
    }

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getApps');
            return Promise.reject(error);
        });
}

export function getPartners(id = '') {
    let endpoint = '';

    if (id) {
        endpoint += '/view/partner/' + id;
    } else {
        endpoint += '/view/partners';
    }

    let get = httpProtocol.get(endpoint, option);

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getFeaturedApps');
            return Promise.reject(error);
        });
}

export function postPartnerForm(partnersform: IPartnerListingInfo) {
    let endpoint = '/api/registerpartner';

    let post = httpProtocol.post(endpoint, option);

    return post
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .setData(partnersform)
        .request()
        .catch((error: any) => {
            logError('Failed to post LeadInfo', error);
            return Promise.reject(error);
        });
}

export function getFeaturedApps(includeOfficeApps?: boolean) {
    let endpoint = '/view/featuredapps';

    let get = httpProtocol.get(endpoint, option);

    if (includeOfficeApps) {
        get.addQueryEntry('officeApps', 'true');
    }

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getFeaturedApps');
            return Promise.reject(error);
        });
}

export function getFeaturedPartners() {
    let endpoint = '/view/featuredpartners';

    let get = httpProtocol.get(endpoint, option);

    return get
        .addQueryEntry('version', getAppConfig('apiVersion'))
        .request()
        .catch((error: any) => {
            logError('Failed to getFeaturedApps');
            return Promise.reject(error);
        });
}

