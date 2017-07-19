import { match } from '../../shared/utils/filterModule';
import { IDataMap, IDataValues } from './dataMapping';
import { Constants } from '../../shared/utils/constants';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { IBuildHrefContext } from '../../shared/interfaces/context';

export const globalFilterIdentifier = 'globalFilter';
export const l1CategoryIdentifier = 'l1Category';

/*  
    MAC specific filter function that takes a URL (params + query) and returns filters that
    are used by the calling function to filter and count apps or partners.  
    Returns a list of { filters, ignore } objects
    Notes:
*/
export function getFilterData(params: any, query: any, DataMap: IDataMap, resetCounts: boolean) {
    let category = params && params.category;

    let result: any[] = [];
    let subcategories = query && query.subcategories ? query.subcategories.split(';') : [];
    let refineby = query && query.filters ? query.filters.split(';') : [];

    let dataMapKeys = Object.keys(DataMap);

    for (let k = 0, len3 = dataMapKeys.length; k < len3; k++) {
        let filters: any[] = [];
        let ignore = true;
        let filterInRefineByQuery = false;
        let keys = Object.keys(DataMap[dataMapKeys[k]]);

        for (let i = 0, len = keys.length; i < len; i++) {
            let cat = DataMap[dataMapKeys[k]][keys[i]];
            let sKeys = Object.keys(cat.subCategoryDataMapping);

            let activeSubcategory = false;
            for (let j = 0, len2 = sKeys.length; j < len2; j++) {
                let filter = cat.subCategoryDataMapping[sKeys[j]];
                filterInRefineByQuery = filterInRefineByQuery || (refineby.indexOf(filter.urlKey) >= 0);

                filter.count = 0;

                // Could be converted to some bitmask logic like the AppSource function uses
                filter.isActive = (category === keys[i] && (subcategories.indexOf(filter.urlKey) >= 0)) ||
                    (refineby.indexOf(filter.urlKey) >= 0);

                activeSubcategory = activeSubcategory || filter.isActive;
                filter.checkFilter = filter.isActive;

                filters.push(filter);
            }

            cat.count = 0;
            cat.isActive = category === keys[i];
            cat.checkFilter = cat.isActive && activeSubcategory === false;

            // TODO: technically we don't need to check this filter if there are any subcategory filters
            cat.checkFilter = cat.isActive && !activeSubcategory;

            filters.push(cat);
        }

        if (dataMapKeys[k] === 'category') {
            ignore = !category;
        } else {
            ignore = !filterInRefineByQuery;
        }

        result.push({ filters: filters, ignore: ignore });
    }

    return result;
}

/* 
    This function is to add 'match' functions to all the Filters in a DataMap object.  
    Currently it is called in the AppView constructor, but it should eventually be called once
    whenever the DataMap object is created (once we have multiple copies of it) -- or in AppView constructor
    or the bundle entry file since even though the DataMap copies will be sent to the client in the State,
    the 'match' functions will be removed when stringifying the state
            match: function that takes an app and returns true if the app matches the filter 
            This does not take into account if the filter is active/inactive or visible/hidden

                let dataMapKeys = Object.keys(DataMap);

    for (let k = 0, len3 = dataMapKeys.length; k < len3; k++) {
        let keys = Object.keys(DataMap[dataMapKeys[k]]);

        for (let i = 0, len = keys.length; i < len; i++) {
            let cat = DataMap[dataMapKeys[k][keys[i]]];
*/
// TODO - maybe this can go away and the 'match' function can take an entire filter + app and 
// then decide at that time how to do the comparison
export function updateMatchFunctions(DataMap: IDataMap) {
    let dataMapKeys = Object.keys(DataMap);

    for (let k = 0, len3 = dataMapKeys.length; k < len3; k++) {
        let keys = Object.keys(DataMap[dataMapKeys[k]]);

        for (let i = 0, len = keys.length; i < len; i++) {
            let cat = DataMap[dataMapKeys[k]][keys[i]];
            let sKeys = Object.keys(cat.subCategoryDataMapping);

            let childMatchFns: ((app: any) => boolean)[] = [];
            for (let j = 0, len2 = sKeys.length; j < len2; j++) {
                let filter = cat.subCategoryDataMapping[sKeys[j]];

                let match = function (app: any) {
                    return app ? ((app[filter.targetProperty] & filter.targetMask) > 0) : false;
                };

                childMatchFns.push(match);

                filter.match = match;
            }

            let parentMatch = function (app: any) {
                for (let i = 0, len = childMatchFns.length; i < len; i++) {
                    if (childMatchFns[i](app)) {
                        return true;
                    }
                }

                return false;
            };

            cat[match] = parentMatch;
        }
    }

    return DataMap;
}

export function getFilterLink(context: IBuildHrefContext,
    filter: IDataValues,
    galleryPageMode: Constants.GalleryPageMode,
    allowShortcutFilter: boolean) {
    if (filter.subCategoryDataMapping) {
        return context.buildHref(routes.marketplace,
            { category: filter.isActive ? null : filter.urlKey },
            { subcategories: null, page: '1', filters: null }
        );
    } else {
        let type = filter.targetProperty.substring(0, filter.targetProperty.indexOf('_mask_'));

        if (type === 'category') {
            return context.buildHref(routes.marketplace,
                null,
                { subcategories: (filter.isActive ? '!' : ';') + filter.urlKey, page: '1' }
            );
        } else if (type.indexOf(globalFilterIdentifier) === 0) {
            return context.buildHref(routes.marketplace,
                null,
                { filters: (filter.isActive ? '!' : ';') + filter.urlKey, page: '1' }
            );
        }
    }
}

export function shouldShowCuratedData(activeFilters: IDataValues[]) {
    return activeFilters.length === 0 ||
        activeFilters.length === 1 && activeFilters[0].subCategoryDataMapping;
}

export function shouldPerformGalleryPageCounting() {
    return true;
}

export function getFilterType(filter: IDataValues) {
    return filter.subCategoryDataMapping ? 'l1CategoryIdentifier' : 'subcategories';
}