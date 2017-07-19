import { IFilterGroup, match } from '../../shared/utils/filterModule';
import { IDataMap, IDataValues, IDataCollection } from './dataMapping';
import { Constants } from '../utils/constants';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { IBuildHrefContext } from '../interfaces/context';

export const l1CategoryIdentifier = 'l1Category';

const dataMappings = [
    {
        urlKey: 'product',
        filterGroup: 'products'
    },
    {
        urlKey: 'industry',
        filterGroup: 'industries'
    },
    {
        urlKey: 'category',
        filterGroup: 'categories'
    }
];

/*  
    Helper function for appSource - primary function is to augment and return list of filters.
    Properties added during this method are:
        count: number of matches this filter would have it were enabled -- starts at 0 and is 
            modified during the performFilter function
            Currently I am optionally resetting the count so that apps and partners can be filtered
            and counted in sequence while allowing the latter to add on to the counts from the former
            instead of resetting them.  Not super happy about this, but I haven't thought of an 
            alternative that I am more content with.
        isActive: determines if the filter is active based on the input parameters and 
            a mask - for AppSource this is ShortcutBitmask but I don't know if it will be the same
            for MAC or if we will keep that concept AppSource specific.  Maybe L1 Categories are similar?
        checkFilter: kind of a hack?  'dynamics-365-for-operations' will cause 'dynamics-365' to appear 
            active, but we shouldn't filter things that match 'dynamics-365' only the subproduct
    Returns an object has two properties:
        filters: array of Filter objects (the same ones defined in DataMapping)
        ignore: boolean -- shortcut to indicate if the entire grouping has no filters applied so that 
            we don't need to check each app against that group.
*/
function helper(query: any, urlKey: string, category: IDataCollection, resetCounts: boolean) {
    if (!category) {
        return {
            filters: [],
            ignore: true
        };
    }

    let items = query && query[urlKey] ? query[urlKey].split(';') : [];

    let filters: any[] = [];
    let keys = Object.keys(category);
    let shouldIgnore = true;

    let mask = 0;
    for (let i = 0, len = items.length; i < len; i++) {
        let filter = category[items[i]];
        if (filter) {
            mask = mask | filter.FilterID;
        } else {
            shouldIgnore = false;
        }
    }

    for (let i = 0, len = keys.length; i < len; i++) {
        let filter = category[keys[i]];
        if (resetCounts) {
            filter.count = 0;
        }
        let maskMatch = (filter.FilterID | filter.ShortcutBitmask) & mask;

        // isActive will determine if the checkbox should be toggled
        filter.isActive = (maskMatch > 0);

        // checkFilter will determine if apps will be filtered against this filter
        filter.checkFilter = filter.isActive;

        filters.push(filter);
    }

    // loop again through the filters
    // if a filter has children and one of its children is active, the parent filter should be un-checked
    filters.forEach((filter: any) => {
        const childrenKeys = filter.ShortcutFilters ? Object.keys(filter.ShortcutFilters) : [];

        childrenKeys.forEach((key: string) => {
            const childFilter = category[filter.ShortcutFilters[key]];

            if (childFilter && childFilter.isActive) {
                filter.checkFilter = false;
            }
        });
    });

    return {
        filters: filters,
        ignore: mask === 0 && shouldIgnore
    };
}

/*  
    AppSource specific filter function that takes a URL (params + query) and returns filters that
    are used by the calling function to filter and count apps or partners.  
    Returns a list of { filters, ignore } objects
    Notes:
        Right now there is a hardcoded 'product', 'industry', 'category' bit.  Ideally the
        DataMapping file would replace the property names with the urlKey (products -> product)
        so that this function could just iterate over Object.keys(DataMapping).  Small thing because
        I still expect that this will be separate from the MAC implementation because of the 
        explicity Category -> SubCategory relationship in MAC.
*/
export function getFilterData(params: any, query: any, DataMap: IDataMap, resetCounts: boolean): IFilterGroup[] {
    return dataMappings.map((m) => helper(query, m.urlKey, DataMap ? DataMap[m.filterGroup] : {}, resetCounts));
}

/* 
    This function is to add 'match' functions to all the Filters in a DataMap object.  
    Currently it is called in the AppView constructor, but it should eventually be called once
    whenever the DataMap object is created (once we have multiple copies of it) -- or in AppView constructor
    or the bundle entry file since even though the DataMap copies will be sent to the client in the State,
    the 'match' functions will be removed when stringifying the state
            match: function that takes an app and returns true if the app matches the filter 
            This does not take into account if the filter is active/inactive or visible/hidden
*/
export function updateMatchFunctions(DataMap: IDataMap) {
    dataMappings.map((m) => m.filterGroup).forEach(function (value) {
        let filterGroup = DataMap[value];
        let filters = Object.keys(filterGroup);
        for (let i = 0, len = filters.length; i < len; i++) {
            let filter = filterGroup[filters[i]];
            filter[match] = function (app: any) {
                return app ? ((app[value] & filter.ShortcutBitmask) > 0) : false;
            };
        }
    });

    return DataMap;
}

export function getFilterLink(context: IBuildHrefContext,
    filter: IDataValues,
    galleryPageMode: Constants.GalleryPageMode,
    allowShortcutFilter: boolean) {
    let query = filter.FilterGroup;

    // Use the ShortctUrlKey if it exists and is allowed - the home page sets that argument to true
    // because it wants to apply all the child filters instead of a parent filter
    let filterValue = (allowShortcutFilter ? filter.ShortcutUrlKey : filter.UrlKey);

    // For top level product filters, only allow one to be selected at a time
    if (query === 'product' && !filter.IsChildFilter) {
        if (filter.isActive) {
            filterValue = null;
        }
    } else {
        // For all other filters, append or remove the specific value
        filterValue = (filter.isActive ? '!' : ';') + filterValue;
    }
    let route = galleryPageMode === Constants.GalleryPageMode.Apps ? routes.marketplace : routes.marketplacePartners;
    let newProps = {
        [query]: filterValue,
        page: '1'
    };
    return context.buildHref(route, null, newProps);
};

// Show curated data if there are any filters applied that aren't top level product filters
export function shouldShowCuratedData(activeFilters: IDataValues[]) {
    return activeFilters.length === 0 ||
        (activeFilters.length === 1 && activeFilters[0].FilterGroup === 'product' && activeFilters[0].ShortcutFilters);
}

export function shouldPerformGalleryPageCounting() {
    return false;
}

export function getFilterType(filter: IDataValues) {
    return filter.FilterGroup ? filter.FilterGroup : '';
}