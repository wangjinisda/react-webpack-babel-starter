// ----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { InstrumentService } from '../core/instrument';
import { StaticProvider } from '../providers/staticProvider';
import { SpzaTelemetryService } from './spzaTelemetry';

export class SpzaInstrumentService extends InstrumentService {
    private static _instance: SpzaInstrumentService = null;
    private staticProvider: StaticProvider;
    private telemetryService: SpzaTelemetryService;

    public static getInstance(isClient = true) {
        if (SpzaInstrumentService._instance === null) {
            SpzaInstrumentService._instance = new SpzaInstrumentService(isClient);
        }

        return SpzaInstrumentService._instance;
    }

    public static getProvider(isClient = true) {
        return SpzaInstrumentService.getInstance(isClient).getProvider();
    }

    // Ideally the design should leverage the Add\RemoveProvider and Add\RemoveConsumerServices
    // for this. However, we currently hard code the usage of StaticProvider as well as use
    // probe method directly all over our client code for instrumentation.
    // This will be the cheapest change, with no fall-outs\open issues for now.
    // In future if we add other types of providers, we will anyway need to decouple our dependency
    // on static providers and at the time we can make both client and server explcitly op-into
    // the providers\consumers of their choice. 
    public static disableInstrumentation() {
        if (SpzaInstrumentService._instance) {
            throw new Error('Error : Instantiation failed. Use SpzaInstrumentService.getInstance');
        }
        SpzaInstrumentService.getInstance(false);
    }

    constructor(isClient: boolean) {
        if (SpzaInstrumentService._instance) {
            throw new Error('Error : Instantiation failed. Use SpzaInstrumentService.getInstance');
        } else {
            super();

            this.name = 'SpzaInstrument';
            this.staticProvider = new StaticProvider('static', this);
            this.telemetryService = new SpzaTelemetryService(this, isClient);
            SpzaInstrumentService._instance = this;
        }
    }
}