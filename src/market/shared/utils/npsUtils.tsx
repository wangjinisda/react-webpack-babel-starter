import { Constants } from './../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from './../Models';
import { getWindow } from './../services/window';
import { getAppConfig } from '../services/init/appConfig';

export module NpsModule {
    let showModal: () => void;
    let npsHelper: Nps = null;
    let idleCounter = 0;
    let blocked = false;
    let idleTimer: any = null;
    let isNotSameCorrelationId = false;
    let sessionStartTime = 0;

    export function setTimer(callback: any, interval?: number) {
        // check every 1 second
        idleTimer = window.setInterval(callback, interval || 1000);
    }

    export function reset() {
        blocked = false;
        idleTimer = null;
    }

    function dLog(debugMsg?: string) {
        let instrument = SpzaInstrumentService.getProvider();
        let data = {
            npsFrom: debugMsg,
            npsStore: npsHelper.getStore()
        };
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.NPS,
            actionModifier: Constants.Telemetry.ActionModifier.Debug,
            details: JSON.stringify(data)
        };
        instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
    }

    export function checkForNPS(viewedAppsCount?: number, acquiredAppsCount?: number, interval?: number, debugMsg?: string) {
        if (npsHelper) {
            let waitTime = 30 * 1000; // If all conditions are met, we wait for 30 seconds since the start-up to show the NPS popup.
            let currentTime = Date.now();

            if (sessionStartTime && (currentTime - sessionStartTime > waitTime)) {
                const viewedApps = viewedAppsCount || npsHelper.getItem('viewedApps');
                const acquiredApps = acquiredAppsCount || npsHelper.getItem('acquiredApps');
                const isAppsCriteriaValid = (viewedApps && (viewedApps >= npsHelper.viewedAppsTriggerNumber)) ||
                    (acquiredApps && (acquiredApps >= npsHelper.acquiredAppsTriggerNumber));

                if (isAppsCriteriaValid && isNotSameCorrelationId && npsHelper.due() && idleTimer == null) {
                    // turn on the timer
                    setTimer(() => {
                        if (!blocked) {
                            idleCounter++;
                            if (idleCounter >= 3) {
                                window.clearInterval(idleTimer);
                                idleTimer = null;
                                dLog(debugMsg);
                                ResetNPSCount();
                                showModal();
                            };
                        };
                    }, interval);
                }
            }
        }
    }

    export function IncreaseAppDetail(interval?: number) {
        if (npsHelper) {
            let viewedApps = npsHelper.getItem('viewedApps');

            if (!viewedApps) {
                viewedApps = 1;
            } else {
                viewedApps += 1;
            }
            npsHelper.setItem('viewedApps', viewedApps);

            checkForNPS(viewedApps, npsHelper.getItem('acquiredApps'), interval, 'detailsPage');
        };
    };

    export function IncreaseAppAcquisition(interval?: number) {
        if (npsHelper) {
            let acquiredApps = npsHelper.getItem('acquiredApps') || 0;

            acquiredApps++;
            npsHelper.setItem('acquiredApps', acquiredApps);

            checkForNPS(npsHelper.getItem('viewedApps'), acquiredApps, interval, 'detailsPage');
        };
    }

    export function ResetNPSIdle() {
        if (npsHelper) {
            idleCounter = 0;
        }
    }

    export function ResetNPSCount() {
        if (npsHelper) {
            npsHelper.setItem('viewedApps', 0);
            npsHelper.setItem('acquiredApps', 0);
        }
    }

    export function SetShortInterval() {
        if (npsHelper) {
            npsHelper.setNext(npsHelper.shortInterval);
        }
    }

    export function SetInterval(interval: number, offset?: boolean) {
        if (npsHelper) {
            npsHelper.setNext(interval, offset);
        }
    }

    export function Declined() {
        if (npsHelper) {
            if (npsHelper.getItem('secondTime')) {
                npsHelper.setItem('secondTime', false);
                npsHelper.setNext(npsHelper.longInterval);
            } else {
                npsHelper.setItem('secondTime', true);
                npsHelper.setNext(npsHelper.shortInterval);
            };
        }
    }

    export function Submitted() {
        if (npsHelper) {
            // succeeded 
            npsHelper.setItem('secondTime', false);
            npsHelper.setNext(npsHelper.longInterval);
        }
    }

    export function BlockShowingNPS() {
        if (npsHelper) {
            blocked = true;
        }
    }

    export function AllowShowingNPS() {
        if (npsHelper) {
            blocked = false;
            ResetNPSIdle();
        }
    }

    export function Initialize(showModalFunction: () => void, localStorage?: any, timerInterval?: number) {
        if (localStorage) {
            // only init from client
            sessionStartTime = Date.now();
            showModal = showModalFunction;
            npsHelper = new Nps(localStorage);

            let currentCorrelationId = getAppConfig('correlationId');

            let savedCorrelationId = npsHelper.getItem('correlationId');
            if (savedCorrelationId && (currentCorrelationId !== savedCorrelationId)) {
                isNotSameCorrelationId = true;
            } else {
                isNotSameCorrelationId = false;
                npsHelper.setItem('correlationId', currentCorrelationId);
            }

            let viewedApps = npsHelper.getItem('viewedApps');
            if (!viewedApps) {
                viewedApps = 0;
            }

            let acquiredApps = npsHelper.getItem('acquiredApps');
            if (!acquiredApps) {
                acquiredApps = 0;
            }

            checkForNPS(viewedApps, acquiredApps, timerInterval, 'landingPage');
        }
    }

    export interface INpsData {
        next: number;
        nextText: string;
        secondTime: boolean;
        viewedApps: number;
        acquiredApps: number;
    }

    class Nps {
        public longInterval: number;
        public shortInterval: number;
        public timeTriggerInterval: number;
        public viewedAppsTriggerNumber: number;
        public acquiredAppsTriggerNumber: number;

        private storeTitle: string;
        private localStorage: any;

        constructor(localStorage?: any) {
            this.storeTitle = 'nps';
            this.longInterval = 1000 * 3600 * 24 * 30 * 3; // delay after accepting
            this.shortInterval = 1000 * 3600 * 24 * 30 * 1;      // delay after denying
            this.timeTriggerInterval = 1000 * 3600 * 1; // amount of delay the user needs to wait to see an nps dialog after the first visit
            this.viewedAppsTriggerNumber = 2;   // amount of apps viewed has to be greater than this number in order to trigger nps
            this.acquiredAppsTriggerNumber = 1; // amount of apps that need to be acquired before triggering nps
            this.localStorage = localStorage;
        }

        reset(next?: number) {
            let initNext = next || Date.now();
            initNext += this.timeTriggerInterval; // This is added to find the 'time' at which we need to show the nps for the first time 

            let date = new Date(initNext);
            let store: INpsData = {
                next: initNext,
                nextText: date.toString(),
                secondTime: false,
                viewedApps: 0,
                acquiredApps: 0
            };
            this.setStore(store);
            return store;
        }

        getStore() {
            try {
                let storeString: string = this.localStorage.getItem(this.storeTitle);
                if (storeString && storeString !== 'null') {
                    return JSON.parse(storeString);
                } else {
                    return this.reset();
                }
            } catch (e) {
                return this.reset();
            }
        }

        setStore(store: INpsData) {
            let storeString: string = JSON.stringify(store);
            try {
                this.localStorage.setItem(this.storeTitle, storeString);
            } catch (e) {
                // In case of quota exceed exception we dont want to crash rather not let NPS show up.
            }
        }

        getItem(section: string) {
            let store = this.getStore();
            if (store && (section in store)) {
                return store[section];
            } else {
                return null;
            }
        }

        setItem(section: string, data: any) {
            let store = this.getStore();
            if (store) {
                store[section] = data;
            };
            this.setStore(store);
        }

        getNext() {
            let next: number = this.getItem('next');
            if (next) {
                return next;
            } else {
                return 0;
            };
        }

        setNext(next: number, offset = true) {
            if (offset) {
                next = Date.now() + next;
            };
            let nextText = new Date(next);
            this.setItem('next', next);
            this.setItem('nextText', nextText.toString());
        }

        due(next?: number): boolean {
            let by = next || this.getNext();
            let now = Date.now();
            return now >= by;
        }
    }
}