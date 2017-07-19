// import { getFilterData } from 'utils/filterHelpers';
import { getFilterData } from './../../mac/utils/filterHelpers';
// import { IDataMap, IDataValues } from 'utils/dataMapping';
import { IDataMap, IDataValues } from './../../mac/utils/dataMapping';

export const match = 'match';

export interface IFilterGroup {
    filters: IDataValues[];
    ignore: boolean;
}

// Helper method to increase the counts for all Filters in a FilterList where the item matches.
function increaseCounts(filterData: any, item: any) {
    for (let i = 0, len = filterData.length; i < len; i++) {
        let f = filterData[i];
        if (f.match && f.match(item)) {
            f.count++;
        }
    }
    return;
}

/*
    Calls into a platform specific 'getFilterData' function to get the list of filters to 
    iterate over.  Then adds matching apps to an array and does counting.
    Parameters:
        'params': React-router params object.  It will contain pieces of the URL that might be
            needed by an app specific module to determine which filters are active.
        'query': React-router query object.  Contains key-value pairs of URL query params
        'items': this is an array of either apps or partners
        'data': TODO: Rename + typing? -- this is a reference to a DataMapping object
    TODO: Should counting be optional?  It adds extra CPU time and is only used by Home right now
    TODO: 'isMac' parameter should be removed
*/
export function performFilter<T1>(params: any, query: any, items: T1[], data: IDataMap|any, performCounting: boolean, resetCounts = true) {
    // this block of code builds up an array of 'active' filters.  This is used to
    // determine if a 'curated' page should be shown
    let activeFilters: IDataValues[] = [];
    let filterData = getFilterData(params, query, data, resetCounts);
    filterData.forEach((filterList) => {
        filterList.filters.forEach((filter: any) => {
            if (filter.isActive) {
                activeFilters.push(filter);
            }
        });
    });

    // TODO: Ideally we could skip the filtering/counting if no filters are applied
    // but for cloning the DataMap for a specific collection, it requires doing a count
    // with no filters applied to decide which items to drop.  Maybe a parameter to indicate
    // if counting should be done?  We also technically don't need to count on the GalleryPage 

    // Loop over all items
    let matchingItems: T1[] = [];
    for (let a = 0, len = items.length; a < len; a++) {
        let item = items[a];

        let itemMatches = true;

        // An array to store for each 'Group' returned as part of 'filterData' if the item
        // matches that specific 'Group'
        let matchesGroup: boolean[] = [];

        // match top level filter (category, industry, product) - AND
        // can't short circuit if we want to do 'counting' later
        for (let i = 0, len = filterData.length; i < len; i++) {
            let topFilter = filterData[i].filters;
            let matchesCategory = filterData[i].ignore;

            // match sub filters - OR
            // could short-circuit this as soon as matchesCategory becomes true
            if (!matchesCategory) {
                for (let j = 0, len2 = topFilter.length; j < len2; j++) {
                    let f = topFilter[j];
                    if (f.checkFilter) {
                        matchesCategory = matchesCategory || f.match(item);
                    }
                }
            }
            matchesGroup[i] = matchesCategory;
            itemMatches = itemMatches && matchesCategory;
        }

        if (performCounting) {
            // Perform counting.  Algorithm is as follows:
            // Loop over each top level group in the filterData array.  If the item matches every
            // filter group except that one, increment the counts of the filters in the current group
            for (let i = 0, len = matchesGroup.length; i < len; i++) {
                let passesGroup = true;
                for (let j = 0, len2 = matchesGroup.length; j < len2; j++) {
                    if (i !== j) {
                        passesGroup = passesGroup && matchesGroup[j];
                    }
                }
                if (passesGroup) {
                    increaseCounts(filterData[i].filters, item);
                }
            }
        }

        if (!itemMatches) {
            continue;
        }

        matchingItems.push(item);
    }

    return {
        items: matchingItems,
        activeFilters: activeFilters
    };
}
