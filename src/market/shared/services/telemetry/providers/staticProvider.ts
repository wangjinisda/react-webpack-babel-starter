// ----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import {Provider} from '../core/provider';
import {IInstrumentService} from '../core/instrument';

export class StaticProvider extends Provider {

    constructor(name: string, instrumentService?: IInstrumentService) {
        super(name, instrumentService);
    }

}