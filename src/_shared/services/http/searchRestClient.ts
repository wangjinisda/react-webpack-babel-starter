import * as httpProtocol from './httpProtocol';
import { ITelemetryData } from '../../Models/Models';
import { Promise } from 'es6-promise';
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

export function postSearch(endpoint: string, query: any, search: any) {

    let post = httpProtocol.post(endpoint, option);

    post.addQuery(query);

    return post
        .setHeader('api-key', getAppConfig('searchApiKey'))
        .setData(search)
        .request()
        .then((result: any) => {
            return result.value;
        })
        .catch((error: any) => {
            logError('Failed to search');
            return Promise.reject(error);
        });
}

export function postAppSearch(searchString: string, searchFields: any, select: any, includeOfficeApps: boolean, numberOfTops = 5): Promise<null> {

    let searchUrl = getAppConfig('searchUrl');
    if ( !searchUrl ) {
        return Promise.resolve([]);
    }

    let endpoint = searchUrl + '/suggest';

    let query = {
        'api-version': '2015-02-28'
    };

    let searchAppQuery = {
        search: searchString,
        fuzzy: true,
        top: numberOfTops,
        suggesterName: 'spzaappsuggest',
        searchFields: searchFields,
        select: select
    };

    // TODO[OfficeOnboarding]: Remove this once Office Onboarding is done
    if (!includeOfficeApps) {
        searchAppQuery['filter'] = "Products/all(x: x ne 'Office365')";
    }

    return postSearch(endpoint, query, searchAppQuery);
}

export function postPartnerSearch(searchString: string, numberOfTops = 5) {

    let searchUrl = getAppConfig('partnerSearchUrl');
    if ( !searchUrl ) {
        return Promise.resolve([]);
    }

    let endpoint = searchUrl + '/suggest';

    let query = {
        'api-version': '2015-02-28'
    };

    let searchPartnerQuery = {
        search: searchString,
        fuzzy: true,
        top: numberOfTops,
        suggesterName: 'spzapartnersuggest',
        searchFields: 'Title, TagLine',
        select: 'Title,id,FriendlyURL,Products,SmallIconUri'
    };

    return postSearch(endpoint, query, searchPartnerQuery);
}

export function postAllAppSearch(searchQuery: string, select = 'ApplicationId', numberOfTops = '250', queryType = 'full') {

    let searchUrl = getAppConfig('searchUrl');
    if ( !searchUrl ) {
        return Promise.resolve([]);
    }

    let endpoint = searchUrl + '/search';

    let query = {
        'api-version': '2015-02-28-Preview'
    };

    // note: order by has to be search score (default), since we do not want to follow 'next links' and want to limit to only a few apps.
    let searchAllAppQuery = {
        search: searchQuery,
        top: numberOfTops,
        queryType: queryType,
        select: select
    };

    return postSearch(endpoint, query, searchAllAppQuery);
}

export function postAllPartnerSearch(searchQuery: string, orderby = 'Title', select = 'FriendlyURL', numberOfTops = '7000', queryType = 'full') {

    let searchUrl = getAppConfig('partnerSearchUrl');
    if ( !searchUrl ) {
        return Promise.resolve([]);
    }

    let endpoint = searchUrl + '/search';

    let query = {
        'api-version': '2015-02-28-Preview'
    };

    let searchAllAppQuery = {
        search: searchQuery,
        top: numberOfTops,
        queryType: queryType,
        orderby: orderby,
        select: select
    };

    return postSearch(endpoint, query, searchAllAppQuery);
}

