// ----------------------------------------------------------------------
// <copyright company='Microsoft Corporation'>
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import * as provider from './provider';

import {IConsumerServiceList, IConsumerService} from './consumer';
import {IInfoBuffer, InfoBuffer} from './buffer';

export interface IInstrumentService {

    name: string;
    provider: provider.IProviderList;
    service: IConsumerServiceList;
    systemInfo: IInfoBuffer;

    getProvider(name?: string): provider.IProvider;
    addProvider(provider: provider.IProvider): boolean;
    updateProvider(provider: provider.IProvider): boolean;
    removeProvider(name: string): void;

    getConsumerService(name: string): IConsumerService;
    addConsumerService(ConsumerService: IConsumerService): boolean;
    updateConsumerService(ConsumerService: IConsumerService): boolean;
    removeConsumerService(name: string): void;
}

export class InstrumentService implements IInstrumentService {

    public name: string;
    public provider: provider.IProviderList;
    public service: IConsumerServiceList;
    public systemInfo: IInfoBuffer;

    // its not private, its public.
    constructor() {
        this.name = 'instrumentService';
        this.provider = {};
        this.service = {};
        this.systemInfo = new InfoBuffer();
    }

    public getProvider(name?: string): provider.IProvider {
        let providerName = name ? name : 'static';
        return this.provider[providerName];
    }

    public addProvider(provider: provider.IProvider): boolean {

        let name = provider.name;

        if (this.provider[name] !== undefined) {
            return false;
        }

        this.provider[name] = provider;
        return true;
    }

    public updateProvider(provider: provider.IProvider): boolean {

        let name = provider.name;

        if (this.provider[name] === undefined) {
            return false;
        }

        this.provider[name] = provider;
        return true;
    }

    public removeProvider(name: string): void {
        this.provider[name] = undefined;
    }

    public getConsumerService(name: string): IConsumerService {
        return this.service[name];
    }

    public addConsumerService(ConsumerService: IConsumerService): boolean {

        let name = ConsumerService.name;

        if (this.service[name] !== undefined) {
            return false;
        }

        this.service[name] = ConsumerService;
        return true;
    }

    public updateConsumerService(service: IConsumerService): boolean {

        let name = service.name;

        if (this.service[name] === undefined) {
            return false;
        }

        this.service[name] = service;
        return true;
    }

    public removeConsumerService(name: string): void {
        this.service[name] = undefined;
    }

}
