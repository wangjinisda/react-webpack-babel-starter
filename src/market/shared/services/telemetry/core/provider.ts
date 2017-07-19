// ----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import {IConsumerService} from './consumer';
import * as action from './action';
import * as instrument from './instrument';

export interface IProviderList {
    [name: string]: IProvider;
}

export interface IRecord {
    epid: number;
    size: number;
    data: any;
}

export interface IEnablingControlBlock {
    service: IConsumerService;
    action: action.IAction;
}

export interface IEnablingList {
    [probeName: string]: IEnablingControlBlock[];
}

export interface IProvider {
    name: string;

    enabling: IEnablingList;

    // on/off probes
    enableProbe(probeName: string, service: IConsumerService, action: action.IAction): boolean;
    disableProbe(probeName: string): void;

    probe<T>(probeName: string, context?: T): void;
}

export class Provider implements IProvider {

    public name: string;
    public namedProbe: string[];
    public enabling: IEnablingList;

    constructor(name: string, instrumentService?: instrument.IInstrumentService) {

        this.name = name;

        if (instrumentService) {
            this.register(instrumentService);
        }

        this.enabling = {};
    }

    public register(service: instrument.IInstrumentService): boolean {
        return service.addProvider(this);
    }

    public enableProbe(probeName: string, service: IConsumerService, action: action.IAction): boolean {

        let ecb: IEnablingControlBlock = {
            service: service,
            action: action
        };

        if (!this.enabling[probeName]) {
            this.enabling[probeName] = [];
        }

        this.enabling[probeName].push(ecb);

        return true;
    }

    public disableProbe(probeName: string): void {
        this.enabling[probeName] = undefined;
    }

    public probe<T>(name: string, context?: T): void {

        let enablings = this.enabling[name];

        if (enablings) {
            for (let enabling of enablings) {
                enabling.action(name, enabling.service, context);
            }
        }
    }

}
