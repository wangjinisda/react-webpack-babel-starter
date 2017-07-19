import { ProductEnum } from '../shared/utils/dataMapping';
import { fetchPowerBIData, fetchEmbedAppData } from './actions/embedThunks';
import { constants } from './constants';
import { getWindow } from '../shared/services/window';
import { ITelemetryData, IAppDataItem } from '../shared/Models';
import { Constants } from '../shared/utils/constants';
import { createEmbedUserSignInAction } from '../shared/actions/actions';
import { SpzaInstrumentService } from '../shared/services/telemetry/spza/spzaInstrument';
import * as embedHostUtils from './embedHostUtils';
import { getEmbedHostName,
    getTelemetryResponseUrl,
    getHandoffUrlForProduct,
    checkOriginSource } from '../shared/utils/appUtils';

let appDataRequestStart = 0;

export function postEmbedAcquisitionMessage(app: IAppDataItem) {
    postMessageToHost({
        msgType: constants.actionTypes.acquireApp,
        data: {
            applicationId: app.appid,
            category: app.privateApp ? 'private' : 'public',
            redirectUrl: app.handoffURL || getHandoffUrlForProduct(String(app.primaryProduct), app.appid, false, app.products),
            product: ProductEnum[app.primaryProduct],
            responseUrl: getTelemetryResponseUrl(app.appid)
        }
    });
}

export function postMessageToHost(payload: any) {
    // Added a lag of 150ms here so that when we do a handoff, the telemetry call is not failed.
    // We use this 150ms buffer to construct the telemetry call and make it before we leave SPZA portal.
    getWindow().setTimeout(() => {
        getWindow().parent.postMessage(payload, '*');
    }, 150);
}

export function logPageLoadFinished(embedHost?: ProductEnum) {
    let timeAtTelemetryMethodCall = new Date().getTime();

    // This event is used to indicate that the In App gallery apps rendering is finished.
    let payload: ITelemetryData = {
        page: 'In App Gallery',
        action: Constants.Telemetry.Action.PageLoad,
        actionModifier: Constants.Telemetry.ActionModifier.End,
        details: 'In App Gallery tiles rendering finished'
    };
    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

    if (embedHostUtils.hasDynamicData(embedHost)) {
        let timing = performance.timing;
        // Telemetry for Network Latency
        let networkLatency = timing.responseEnd - timing.fetchStart;

        let currentTime = new Date().getTime();
        // The time taken for page load once the page is received from the server
        // we may find timing.loadEventEnd as 0 if called before load event fires.
        // If so, use current time as approximation till we fix it properly
        let loadEventEnd = (timing.loadEventEnd !== 0 ? timing.loadEventEnd : currentTime);

        // The time taken for page load once the page is received from the server
        let pageLoadTime = loadEventEnd - timing.responseEnd;

        // The whole process of navigation and page load
        let navigationToPageLoad = currentTime - timing.navigationStart;
        let dataLatency = currentTime - appDataRequestStart;

        // the data we are getting here is valuable, but seems very browser specific (some browsers do not properly support)
        // so introducing a new number here that will always be consistent:
        let timePassedSinceNavigationStart = timeAtTelemetryMethodCall - timing.navigationStart;

        let perfTimings = {
            networkLatency: networkLatency,
            pageLoadTime: pageLoadTime,
            navigationToPageLoad: navigationToPageLoad,
            timePassedSinceNavigationStart: timePassedSinceNavigationStart,
            allTimings: timing, // Dumping raw timings for perf telemetry analysis
            'isEmbedded': true,
            'embedHost': getEmbedHostName(embedHost),
            'isAuthenticated': false,
            'dataLatency': dataLatency
        };

        let perfPayload = {
            eventName: Constants.Telemetry.Action.PerfEvents,
            data: JSON.stringify(perfTimings),
            flushLog: true
        };

        SpzaInstrumentService.getProvider().probe<any>('logOneTimeInfo', perfPayload);
    }

    postMessageToHost({
        msgType: constants.actionTypes.finishedLoadingContentProviderList
    });
}

export function initializeListener(dispatch: any, embedHost: ProductEnum) {
    let currWindow = getWindow();
    if (currWindow.parent !== currWindow) {
        currWindow.addEventListener('message', (e: any) => {
            receiveMessage(e, dispatch, embedHost);
        });
    }

    if (!embedHostUtils.hasDynamicData(embedHost)) {
        // If it is not dynamic data on embed host, we are done
        // with fetching the app data.
        appDataRequestStart = new Date().getTime();
        logPageLoadFinished(embedHost);
    }
}

// handle message from parent window
export function receiveMessage(event: any, dispatch: any, embedHost: ProductEnum) {
    if (!event || !event.origin) {
        return;
    }

    if (!checkOriginSource(event.origin)) {
        return;
    }

    let msg = event.data;

    switch (msg.msgType) {
        case 'loadMarketplace':
            // PowerBI won't log page load finished until after it fetches and parses
            // the app list from the PowerBI backend
            if (msg.hostData.getAppsEndpoint) {
                // This event is used to indicate that the additional data is about to be fetched.
                appDataRequestStart = new Date().getTime();
                let detailsObject = {
                    message: '[Start] Partner App data request start (' + ProductEnum[embedHost] + ')',
                    endPoint: msg.hostData.getAppsEndpoint
                };

                let payload: ITelemetryData = {
                    page: 'In App Gallery(' + ProductEnum[embedHost] + ')',
                    action: Constants.Telemetry.Action.NetworkCall,
                    actionModifier: Constants.Telemetry.ActionModifier.Start,
                    details: JSON.stringify(detailsObject)
                };
                SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

                dispatch(fetchEmbedAppData(embedHost, msg.hostData));
            } else if (msg.hostData.backendUrlOverride) {
                // This event is used to indicate that the Power BI data is about to be fetched.
                appDataRequestStart = new Date().getTime();
                let detailsObject = {
                    message: '[Start] Power BI Request Start. loadMarketplace message Received from Power BI',
                    endPoint: msg.hostData.backendUrlOverride
                };
                let payload: ITelemetryData = {
                    page: 'In App Gallery(PowerBI)',
                    action: Constants.Telemetry.Action.NetworkCall,
                    actionModifier: Constants.Telemetry.ActionModifier.Start,
                    details: JSON.stringify(detailsObject)
                };
                SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
                dispatch(fetchPowerBIData(msg.hostData));
            }

            msg.hostData.email = msg.hostData.workEmail;
            dispatch(createEmbedUserSignInAction(msg.hostData));
            break;
        default:
            return;
    }
}
