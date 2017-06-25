// ----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import {IConsumerService} from './consumer';

export interface IAction {
    (probeName: string, service: IConsumerService, context?: any): any;
}

export interface IActionTable {
    [name: string]: IAction;
}

export class LibAction {
    public count(aggregratingName: string, service: IConsumerService) {
        service.aggregation.increase(aggregratingName);
    }

}
