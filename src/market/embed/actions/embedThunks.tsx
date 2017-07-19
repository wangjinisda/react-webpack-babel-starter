import { IState } from '../../State';
import { Promise } from 'es6-promise';
import * as request from 'superagent';
import { createPowerBIDataReceivedAction, createPartnerAppDataReceivedAction } from '../../shared/actions/actions';
import { logPageLoadFinished } from '../embedMessaging';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../../shared/Models';
import { Constants } from '../../shared/utils/constants';
import { ProductEnum } from '../../shared/utils/dataMapping';
import { generateGuid } from '../../shared/utils/appUtils';
require('superagent-retry')(request);

const publishRetryCount = process.env.publishTelemetryRetryCount || 2;

interface IEmbedHostData {
    context: any;
    accessToken: string;
    getAppsEndpoint: string;
};

export function fetchEmbedAppData(embedHost: ProductEnum, hostData: IEmbedHostData) {
    return function (dispatch: any, getState: () => IState) {
        let state = getState();
        let getAppsEndpoint = hostData.getAppsEndpoint;
        if (!getAppsEndpoint) {
            throw new Error('No getAppsEndpoint specified');
        }

        return new Promise((resolve, reject) => {
            (request.get(getAppsEndpoint)
                .set('Accept', 'application/json')
                .set('x-ms-correlationid', state.config.correlationId)
                .set('x-ms-requestid', generateGuid())
                .set('Authorization', 'Bearer ' + hostData.accessToken)
                .set('Context', JSON.stringify(hostData.context))  as any)
                .retry(publishRetryCount)
                .end((err: any, res: request.Response) => {
                    if (err) {
                        reject(err);
                    } else {
                        let payload: ITelemetryData = {
                            page: 'In App Gallery(' + ProductEnum[embedHost] + ')',
                            action: Constants.Telemetry.Action.NetworkCall,
                            actionModifier: Constants.Telemetry.ActionModifier.End,
                            details: '[End] Partner App data is received. Data dispatched for parsing'
                        };
                        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

                        let appData = JSON.parse(res.text);
                        dispatch(createPartnerAppDataReceivedAction({
                            appData: appData.applications,
                            embedHost: embedHost
                        }));

                        logPageLoadFinished(embedHost);
                        resolve(appData);
                    }
            });
        });
    };
}

// TODO: Add error handling for PowerBI failure
export function fetchPowerBIData(hostData: any) {
    return function (dispatch: any, getState: () => IState) {
        let state = getState();
        // TODO: this should probably be api.powerbi.com for the default
        let pbiApi = 'https://api.powerbi.com/v1.0/spza/applications';
        if (hostData.backendUrlOverride && hostData.backendUrlOverride.length > 1) {
            pbiApi = hostData.backendUrlOverride + '/v1.0/spza/applications';
        }

        return new Promise((resolve, reject) => {
            let guid = generateGuid();
            (request.get(pbiApi)
                .set('Accept', 'application/json')
                .set('Access-Control-Allow-Origin', '*')
                .set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE')
                .set('Access-Control-Allow-Headers', 'x-requested-with')
                .set('ActivityId', state.config.correlationId)
                .set('x-ms-correlationid', state.config.correlationId)
                .set('X-PowerBI-User-GroupId', hostData.context.groupId)
                .set('x-ms-requestid', guid)
                .set('RequestId', guid)
                .set('Authorization', 'Bearer ' + hostData.accessToken)  as any)
                .retry(publishRetryCount)
                .end(function (err: any, res: request.Response) {
                    if (err === null && res && res.ok && !res.noContent) {
                        try {
                            // This event is used to indicate that the Power BI data is fetched. Parsing and rendering starts after this step
                            let payload: ITelemetryData = {
                                page: 'In App Gallery(PowerBI)',
                                action: Constants.Telemetry.Action.NetworkCall,
                                actionModifier: Constants.Telemetry.ActionModifier.End,
                                details: '[End] PowerBI data is received. Data dispatched for parsing'
                            };
                            SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

                            let appData = JSON.parse(res.text);
                            dispatch(createPowerBIDataReceivedAction({
                                appData: appData.applications
                            }));

                            logPageLoadFinished(ProductEnum['power-bi']);
                            resolve(appData);
                        } catch (err) {
                            reject(err);
                        }
                    } else {
                        reject(err);
                    }
                });
        });
    };
}
