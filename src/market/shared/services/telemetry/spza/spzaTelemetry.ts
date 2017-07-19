// ----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import {LibAction} from '../core/action';
import {IInfoBuffer, Buffer, AggregationBuffer} from '../core/buffer';
import {ConsumerService} from '../core/consumer';
import {IInstrumentService} from '../core/instrument';
import {StaticProvider} from '../providers/staticProvider';
import {generateGuid} from '../../../utils/appUtils';
import {ITelemetryEvent, ITelemetryData} from '../../../Models';
import { Constants } from '../../../utils/constants';
import {IBufferItem} from  '../core/buffer';
import * as request from 'superagent';
require('superagent-retry')(request);
import { getAppConfig } from '../../init/appConfig';

const publishRetryCount = process.env.publishTelemetryRetryCount || 2;

interface ITelemetryPayload {
    events: ITelemetryEvent[];
    correlationId: string;
}

class TelemetryActions extends LibAction {
    private timeoutID: number = -1;

    public initSystemInfo(probeName: string, service: SpzaTelemetryService) {
        service.systemInfo['correlationId'] = getAppConfig('correlationId');
    }

    public loggerFlush(probeName: string, service: SpzaTelemetryService): void {
        let buffer = service.buffer;
        let events: any = [];
        if (buffer) {
            while (!buffer.isEmpty()) {
                let event = buffer.pop().data;
                events.push(event);
            }

            let correlationId = getAppConfig('correlationId');

            let telemetryPayload: ITelemetryPayload = {
                events: events,
                correlationId: correlationId
            };
            service.action.publishTelemetryEvent(telemetryPayload);

            window.onbeforeunload = null;
        }
    }

    public logEvent(probeName: string, service: SpzaTelemetryService, payload: ITelemetryData): void {
        let event: ITelemetryEvent = service.createDebugEvent(payload);
        service.action.pushRecordInBuffer(probeName, service, event, payload.flushLog);
    }

    public logAndFlushEvent(probeName: string, service: SpzaTelemetryService, payload: ITelemetryData): void {
        let event: ITelemetryEvent = service.createDebugEvent(payload);
        service.action.pushRecordInBuffer(probeName, service, event, true);
    }

    public logUserSystemInfo(probeName: string, service: SpzaTelemetryService, locale: string): void {
        let screenResolution = {
            'Width': screen.width,
            'Height': screen.height
        };

        let browser = service.action.detectBrowser().split(' ');
        let browserInfo = {
            'Browser': browser[0],
            'version': browser[1]
        };

        let data = {
            'Screen Resolution': screenResolution,
            'Browser Info': browserInfo,
            'Locale': locale
        };

        let obj: ITelemetryData = {
            page: '',
            action: Constants.Telemetry.Action.UserSettings,
            actionModifier: 'Info',
            details: JSON.stringify(data)
        };

        let event: ITelemetryEvent = service.createDebugEvent(obj);
        service.action.pushRecordInBuffer(probeName, service, event, false);
    }

    public logOneTimeInfo(probeName: string, service: SpzaTelemetryService, payload: any): void {
        let obj: ITelemetryData = {
            page: '',
            action: payload.eventName,
            actionModifier: payload.actionModifier ? payload.actionModifier : 'Info',
            details: payload.data
        };

        let event: ITelemetryEvent = service.createDebugEvent(obj);
        service.action.pushRecordInBuffer(probeName, service, event, payload.flushLog);
    }

    private publishTelemetryEvent(telemetryPayload: ITelemetryPayload): void {
        let outEvents = { 'TelemetryEvents': telemetryPayload.events };
        let serializedEvents = JSON.stringify(outEvents);
        console.log('[CorrelationId] ' + telemetryPayload.correlationId);

        (request.post('https://' + window.location.hostname + '/api/log')
            .set('Content-Type', 'application/json')
            .set('x-ms-requestid', generateGuid())
            .set('x-ms-correlationid', telemetryPayload.correlationId)
            .send(serializedEvents) as any)
            .retry(publishRetryCount)
            .end(function (err: any, res: request.Response) {
                if (err === null) {
                    console.log('[Success] Telemetry Logs submitted successfully');
                } else {
                    console.log('[Fail] Telemetry Log failed : ' + err);
                }
            });
    }

    private detectBrowser(): string {
        let ua = navigator.userAgent;
        let tem: any;
        let M: any = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) {
                return tem.slice(1).join(' ').replace('OPR', 'Opera');
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }

        return M.join(' ');
    }

    private pushRecordInBuffer(probeName: string, service: SpzaTelemetryService, event: ITelemetryEvent, flushLog: boolean) {
        let record: IBufferItem = {
            provider: 'static',
            probe: probeName,
            time: new Date().getTime(),
            data: event
        };

        service.buffer.push(record);
        if ((service.buffer.getSize() > service.maxBufferSize) || flushLog) {
            service.action.loggerFlush(probeName, service);
        } else {
            // let's start a timer to flush the buffer
            // this will help safeguard against never reaching the maxBufferSize
            // and risk not storing anything at all
            service.action.startBufferTimer(probeName, service);

            // attach to beforeunload event to make sure we flush out the telemetry buffer before we close the browser
            if (!window.onbeforeunload) {
                window.onbeforeunload = function () {
                    // flush the buffer if we have anything in it
                    if (service.buffer.getSize() > 0) {
                        service.action.loggerFlush(probeName, service);
                    }

                    return;
                };
            }
        }
    }

    private startBufferTimer(probeName: string, service: SpzaTelemetryService) {
        const flushTimer = 30000; // 30 seconds

        if (this.timeoutID > -1) {
            window.clearTimeout(this.timeoutID);
            this.timeoutID = -1;
        }

        this.timeoutID = window.setTimeout(() => {
            // flush the buffer if we have anything in it
            if (service.buffer.getSize() > 0) {
                service.action.loggerFlush(probeName, service);
            }

            this.timeoutID = -1;
        }, flushTimer);
    }
}

export class SpzaTelemetryService extends ConsumerService {
    public buffer: Buffer;
    public action: TelemetryActions;
    public systemInfo: IInfoBuffer;
    public host: string;
    public maxBufferSize: number;

    constructor(instrumentService: IInstrumentService, isClient: boolean) {
        let name = (isClient ? 'client telemetry' : 'server telemetry');
        super(name, instrumentService);

        if (isClient) {
            this.action = new TelemetryActions();
            this.buffer = new Buffer(150);
            // This is the maximum number of records stored in the buffer before flushing 
            this.maxBufferSize = 20;
            this.aggregation = new AggregationBuffer();

            if (instrumentService) {
                this.systemInfo = instrumentService.systemInfo;
            }

            this.registerProbes();
        }
    }

    public createDebugEvent(obj: ITelemetryData): ITelemetryEvent {
        let event: ITelemetryEvent = {
            page: obj.page ? obj.page : '',
            action: obj.action ? obj.action : '',
            actionModifier: obj.actionModifier ? obj.actionModifier : '',
            clientTimestamp: new Date().toISOString(),
            appName: obj.appName ? obj.appName : '',
            product: obj.product ? obj.product : -1,
            featureFlag: obj.featureFlag ? obj.featureFlag : '',
            details: obj.details ? obj.details : ''
        };

        return event;
    }

    public registerProbes(): void {
        let p = <StaticProvider>this.instrumentService.getProvider('static');

        if (p) {
            p.enableProbe('initSystemInfo', this, this.action.initSystemInfo);
            p.enableProbe('logTelemetryInfo', this, this.action.logEvent);
            p.enableProbe('logAndFlushTelemetryInfo', this, this.action.logAndFlushEvent);

            // These are one time telemetry events
            p.enableProbe('logUserSystemInfo', this, this.action.logUserSystemInfo);
            p.enableProbe('logOneTimeInfo', this, this.action.logOneTimeInfo);
        }
    }
}