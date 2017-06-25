// ----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import * as action from './action';
import * as buffer from './buffer';
import * as instrument from './instrument';

export interface IConsumerServiceList {
    [name: string]: IConsumerService;
}
// each ConsumerService only has one buffer and one aggregation table
// but it can has multiple publishers to report
export interface IConsumerService {
    name: string;
    action: action.LibAction;
    buffer: buffer.IBuffer;
    aggregation: buffer.IAggregationBuffer;
    instrumentService: instrument.IInstrumentService;

    register(service: instrument.IInstrumentService): boolean;
}

export class ConsumerService implements IConsumerService {
    public name: string;
    public action: action.LibAction;
    public buffer: buffer.IBuffer;
    public aggregation: buffer.IAggregationBuffer;
    public instrumentService: instrument.IInstrumentService;

    constructor(name: string, instrumentService?: instrument.IInstrumentService) {
        this.name = name;

        if (instrumentService) {
            this.instrumentService = instrumentService;
            this.register(instrumentService);
        }

    }

    public register(service: instrument.IInstrumentService): boolean {
        return service.addConsumerService(this);
    }
}
