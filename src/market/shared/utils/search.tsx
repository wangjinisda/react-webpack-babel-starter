import * as React from 'react';
import { IAppSearchResult, ISearchResult } from '../Models';
import { getProductLongTitleFromDisplayName } from './appUtils';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { DataMap, ProductEnum } from './dataMapping';

export function getAppSuggesterSearchFields() {
    return 'Title, ShortDescription, Publisher';
}

export function getAppSuggesterSelectFields() {
    return 'ApplicationId,Title,SmallIconUri,Product';
}

export function shouldIgnoreOfficeApps(includeOfficeApps: boolean) {
    return includeOfficeApps;
}

export function convertAppSearchResult(app: any): IAppSearchResult|any{
    return {
        id: app.ApplicationId,
        logo: app.SmallIconUri,
        product: getProductLongTitleFromDisplayName(app.Product),
        text: app.Title,
        type: 'AppSearchResult'
    };
}

export function renderAppSearchResultDescription(app: IAppSearchResult, context?: any) {
    return <div className='Description'>{context.locParams('Tile_For', [app.product])}</div>;
}

// TODO: remove when we add partners in MAC
export function shouldShowPartnerSearchAll() {
    return true;
}

export function getPlaceholderText(context: any) {
    return context.loc('SB_Placeholder');
}

export function getDetailPath(context: any, filter: ISearchResult) {
    return context.buildHref(routes.appDetails, {
        productId: getProductUrlKeyFromDisplayName(filter['product']), appid: filter.id
    }, {});
}

// Does a reverse look up on the data map from the product display name to get the product key
// Reverse lookup as dont want to create a new map to maintain
function getProductUrlKeyFromDisplayName(displayName: string): string {
    for (let item in ProductEnum) {
        // When you iterate over an Enum it gives you both the indexes and the string values
        // The regex makes sure you dont compare the indexes.
        if (ProductEnum.hasOwnProperty(item) && !/^\d+$/.test(item)) {
            if (displayName === DataMap.products[item].Title || displayName === DataMap.products[item].LongTitle) {
                return DataMap.products[item].UrlKey;
            }
        }
    }
    // Came here means none the expected products matched,
    // Some one handcrafted the Url with a non existant prod.
    // return an empty string as you cannot show details anyways
    return '';
}