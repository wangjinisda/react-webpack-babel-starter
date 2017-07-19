import * as React from 'react';
import { Constants } from './constants';
import { getWindow } from '../services/window';
import { ITelemetryData } from './../Models';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';

export enum OwnerType {
    App,
    Partner
};

export function getDetailInformation(item: any, id: string): any {
    if (item.detailInformation && item.detailInformation[id]) {
        return item.detailInformation[id];
    } else {
        return '';
    }
}

// Use this method only for the Array items in the details fields
export function getDetailArrayItem(item: any, id: string) {
    if (item.detailInformation && item.detailInformation[id] && item.detailInformation[id].length > 0) {
        return item.detailInformation[id];
    } else {
        return '';
    }
}

export function getDetailInformationAsDivElement(item: any, id: string): JSX.Element {
    let information = this.getDetailInformation(item, id);

    if (information) {
        return <div>{information}</div>;
    } else {
        return null;
    }
}

export function getListElements(list: string[], maxItems = -1): JSX.Element[] {
    let listRender: JSX.Element[] = [];
    if (list) {
        for (let i = 0; i < list.length; i++) {
            if (i === maxItems) {
                break;
            }
            listRender.push(
                <div className='leftSideItem'>{list[i]}</div>
            );
        }
    }
    return listRender;
}

export function generateLinkPayloadAndLogTelemetry(ownerType: OwnerType, ownerId: string, linkType: string, link: string, tabOwner?: string): void {
    let detailsObject = {
        linkType: linkType,
        link: link,
        tab: tabOwner ? tabOwner : ''
    };

    this.generateClickPayloadAndLogTelemetry(ownerType, ownerId, Constants.Telemetry.ActionModifier.Link, detailsObject);
}

export function generateClickPayloadAndLogTelemetry(ownerType: OwnerType, ownerId: string, actionModifier: string, detailsObject: any): void {
    let payload: ITelemetryData = {
        page: getWindow().location.href,
        action: Constants.Telemetry.Action.Click,
        actionModifier: actionModifier,
        details: JSON.stringify(detailsObject)
    };

    if (ownerType === OwnerType.App) {
        payload.appName = ownerId;
    } else if (ownerType === OwnerType.Partner) {
        payload.partnerId = ownerId;
    }

    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
}

export function generateFilterClickPayloadAndLogTelemetry(ownerType: OwnerType, ownerId: string, actionModifier: string, detailsObject: any): void {
    let payload: ITelemetryData = {
        page: getWindow().location.href,
        action: Constants.Telemetry.Action.FilterClick,
        actionModifier: actionModifier,
        details: JSON.stringify(detailsObject)
    };

    if (ownerType === OwnerType.App) {
        payload.appName = ownerId;
    } else if (ownerType === OwnerType.Partner) {
        payload.partnerId = ownerId;
    }

    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
}

export function generateTileClickPayloadAndLogTelemetry(actionModifier: string, detailsObject: any): void {
    let payload: ITelemetryData = {
        page: getWindow().location.href,
        action: Constants.Telemetry.Action.Click,
        actionModifier: actionModifier,
        details: JSON.stringify(detailsObject)
    };

    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
}

export function generateBreadcrumbPayloadAndLogTelemetry(linkType: string): void {
    let detailsObject = {
        linkType: linkType,
        link: getWindow().location.href
    };

    let payload: ITelemetryData = {
        page: getWindow().location.href,
        action: Constants.Telemetry.Action.Click,
        actionModifier: Constants.Telemetry.ActionModifier.Breadcrumb,
        details: JSON.stringify(detailsObject)
    };

    SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
}