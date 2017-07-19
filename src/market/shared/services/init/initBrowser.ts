import * as appConfig from './appConfig';
// import { ApiVersion } from 'specifics';
import { ApiVersion } from './../../../mac/specifics';

export function initBrowserConfig(name: string, store: any, embedded = false) {
    if (!store) {
        throw Error('store object is NOT found. Is program running under browser?');
    };

    let state = store.getState();
    appConfig.init({
        runtimeEnvironment: 'browser',
        embedded: embedded,
        appName: name,
        graphApi: state.users.graphApi,
        correlationId: state.config.correlationId,
        hostname: window.location.hostname,
        config: state.config,
        basePath: 'https://' + window.location.hostname + '/' + state.config.locale,
        apiVersion: ApiVersion,
        store: store,
        searchUrl: state.config.searchUrl,
        partnerSearchUrl: state.config.partnerSearchUrl,
        searchApiKey: state.config.searchAPIKey
    });
};
