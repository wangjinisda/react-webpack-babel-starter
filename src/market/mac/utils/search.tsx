import * as React from 'react';
import { IAppSearchResult } from '../Models';
import { ISearchResult } from '../../shared/Models';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');

export function getAppSuggesterSearchFields() {
    return 'Title, ShortDescription, Publisher';
}

export function getAppSuggesterSelectFields() {
    return 'ApplicationId,ShortDescription,Title,SmallIconUri,Publisher';
}

export function shouldIgnoreOfficeApps(includeOfficeApps: boolean) {
    return true;
}

export function convertAppSearchResult(app: any): IAppSearchResult {
    return {
        id: app.ApplicationId,
        logo: app.SmallIconUri,
        publisher: app.Publisher,
        text: app.Title,
        type: 'AppSearchResult'
    };
}

export function renderAppSearchResultDescription(app: IAppSearchResult, context?: any) {
    return <div className='Description'>{app.publisher}</div>;
}

// TODO: remove when we add partners in MAC
export function shouldShowPartnerSearchAll() {
    return false;
}

export function getPlaceholderText(context: any) {
    return context.loc('SB_MacPlaceholder');
}

export function getDetailPath(context: any, filter: ISearchResult) {
    return context.buildHref(routes.appDetails, { appid: filter.id }, { 'tab': 'Overview' });
}