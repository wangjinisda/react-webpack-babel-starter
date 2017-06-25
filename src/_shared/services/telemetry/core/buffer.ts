// ----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ----------------------------------------------------------------------

import * as action from './action';

export interface IBufferList {
    [name: string]: IBuffer;
}

export interface IAggregationTable {
    [AggregatingName: string]: number;
}

export interface IAggregationBuffer {
    name: string;
    record: IAggregationTable;
    callback: action.IActionTable;

    increase(entryName: string): boolean;
    add(entryName: string, size: number): boolean;
    empty(entryName: string): boolean;
    addEntry(entryName: string): boolean;
}


export interface IInfoEntryTable {
    [EntryName: string]: string;
}

export interface IInfoBuffer {
    name: string;
    record: IInfoEntryTable;

    lookup(entryName: string): string;
    remove(entryName: string): void;
    create(entryName: string, info: string): boolean;
    update(entryName: string, info: string): boolean;
}

export class InfoBuffer implements IInfoBuffer {

    public name: string;
    public record: IInfoEntryTable;

    constructor(name?: string) {
        this.name = name || 'instrument.core.InfoBuffer';
        this.record = {};
    }

    lookup(entryName: string): string {
        return this.record[entryName];
    }

    remove(entryName: string): void {
        this.record[entryName] = undefined;
    }

    create(entryName: string, info: string): boolean {
        if (this.record[entryName]) {
            return false;
        }

        this.record[entryName] = info;

        return true;
    }

    update(entryName: string, info: string): boolean {
        if (!this.record[entryName]) {
            return false;
        }

        this.record[entryName] = info;

        return true;
    }

}

export class AggregationBuffer implements IAggregationBuffer {

    public name: string;
    public record: IAggregationTable;
    public callback: action.IActionTable;

    constructor(name?: string) {
        this.name = name || 'instrument.core.AggregationBuffer';
        this.record = {};
        this.callback = {};
    }

    public increase(entryName: string): boolean {
        this.record[entryName] += 1;

        let action = this.callback['increase'];
        if (action) {
            action.apply(this, [entryName, this.record[entryName]]);
        }

        return true;
    }

    public add(entryName: string, size: number): boolean {
        this.record[entryName] += size;

        let action = this.callback['add'];
        if (action) {
            action.apply(this, [entryName, this.record[entryName]]);
        }

        return true;
    }

    public empty(entryName: string): boolean {

        if (!this.record[entryName]) {
            return false;
        }
        this.record[entryName] = 0;

        let action = this.callback['empty'];
        if (action) {
            action.apply(this, [entryName, this.record[entryName]]);
        }

        return true;
    }

    public addEntry(entryName: string): boolean {
        if (this.record[entryName]) {
            return false;
        }
        this.record[entryName] = 0;
        return true;
    }
}


export interface IBufferItem {
    provider: string;
    probe: string;
    time: number;
    data: Object;
}

export interface IBufferCall {
    (item: IBufferItem, buffer: IBuffer): void;
}

export interface IBuffer {

    name: string;

    push(item: IBufferItem): number;
    pop(): IBufferItem;

    empty(): void;

    firstItem(): IBufferItem;
    lastItem(): IBufferItem;
    getItem(index: number): IBufferItem;
    setItem(index: number, item: IBufferItem): void;
    isEmpty(): boolean;
    isFull(additionalSize?: number): boolean;

    setOverflow(overflow: IBufferCall): void;

    getLength(): number;
    getSize(): number;

    getEnd(): number;

    jsondump(): string;
}


export class Buffer implements IBuffer {

    public name: string;

    private data: IBufferItem[];

    private size: number;
    private length: number;

    private start: number;
    private end: number;

    private overflow: IBufferCall;

    constructor(length: number) {

        this.name = 'instrument.core.Buffer';
        this.data = [];
        this.size = 0;

        this.overflow = null;

        this.start = 0;
        this.end = 0;
        this.length = length;
    }

    public push(item: IBufferItem): number {

        if (this.overflow && this.size + 1 > this.length) {
            this.overflow(this.data[(this.end + 1) % this.length], this);
        }

        this.data[(this.end + 1) % this.length] = item;

        if (this.size < this.length) {
            if (this.size + 1 > this.length) {
                this.size = this.length;
            } else {
                this.size += 1;
            }
        }

        this.end = (this.end + 1) % this.length;
        this.start = (this.length + this.end - this.size + 1) % this.length;

        return this.size;
    }

    public pop(): IBufferItem {
        if (this.size === 0) {
            return null;
        }
        let item = this.data[this.end];
        delete this.data[this.end];
        this.end = (this.end - 1 + this.length) % this.length;
        this.size--;
        return item;
    }

    public firstItem(): IBufferItem {
        return this.data[this.start];
    }

    public lastItem(): IBufferItem {
        return this.data[this.end];
    }

    public getItem(index: number): IBufferItem {
        return this.data[(this.start + index) % this.length];
    }

    public setItem(index: number, item: IBufferItem): void {
        this.data[(this.start + index) % this.length] = item;
    }

    public isEmpty(): boolean {
        return this.size === 0;
    }

    public isFull(additionalSize = 0): boolean {
        return (this.getLength() + additionalSize) > this.size;
    }

    public setOverflow(overflow: IBufferCall): void {
        this.overflow = overflow;
    }

    public getLength(): number {
        return this.length;
    }

    public getSize(): number {
        return this.size;
    }

    public getEnd(): number {
        return this.end;
    }

    public empty(): IBuffer {
        this.size = this.start = 0;
        this.end = this.length - 1;
        return this;
    }

    public jsondump(): string {
        return JSON.stringify(this.data);
    }
}
