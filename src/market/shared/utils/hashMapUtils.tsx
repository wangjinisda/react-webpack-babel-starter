import { ICuratedSection } from '../Models';

// hashmap that maps the passed identifier value to the index in the array
// i.e. if we pass an array of apps with appid as the identifier
// the returned map will be h[appid] = index in array
export function generateHashMap(data: any[], identifiers: string[]) {
    let hash: { [id: string]: number; } = {};
    const dataLength = data.length;
    const idsLength = identifiers.length;

    for (let i = 0; i < dataLength; i++) {
        // data is allowed to be null
        if (data[i]) {
            for (let j = 0; j < idsLength; j++) {
                if (data[i][identifiers[j]]) {
                    hash[data[i][identifiers[j]].toString().toLowerCase()] = i;
                }
            }
        }
    }

    return hash;
}

// Generates the hashmap for the given array of any objects.
// @param data the data object array to be hashed
// @param input the array of the property names of the data array item. hashed items will be generated based on each of the property names.
// @param output the property name for the data array item, the hashed item value will be picked up based on this property. 
// Note: if this param value is null, the hashed item value will be the item itself instead of a property value of this item.
// @param hashMap if this hashMap is passed in, all the new hash items will be added on top of this hashmap.
export function generateCustomHashMap(data: any[], input: string[], output: string, hashMap?: { [id: string]: string; }) {
    let hash: { [id: string]: string; } = {};
    const dataLength = data.length;
    const inputLength = input.length;

    // append to the passed HashMap
    if (hashMap) {
        hash = hashMap;
    }

    for (let i = 0; i < dataLength; i++) {
        // data is allowed to be null
        if (data[i]) {
            for (let j = 0; j < inputLength; j++) {
                if (data[i][input[j]]) {
                    if (output && data[i][output]) {
                        hash[data[i][input[j]].toString().toLowerCase()] = data[i][output].toString().toLowerCase();
                    } else {
                        // if "output" parameter is empty, it means directly hash the data member itself.
                        hash[data[i][input[j]].toString().toLowerCase()] = data[i];
                    }
                }
            }
        }
    }

    return hash;
}

export function parseCuratedSections<T>(sections: ICuratedSection<T>[], data: T[], hashMap: { [id: string]: number; }) {
    let result: ICuratedSection<T>[] = [];

    if (sections) {
        sections.forEach((section: ICuratedSection<T>) => {
            let newItems: T[] = [];

            let items: any[] = section.items;
            if (items) {
                items.forEach((item: any) => {
                    const id = item.id;
                    const index = hashMap[id];

                    if (index >= 0) {
                        newItems.push(data[index]);
                    }
                });
            }

            // if we can't find any data for any item in the curated section
            // let's not show the section at all
            if (newItems.length > 0) {
                result.push({
                    titleId: section.titleId,
                    items: newItems
                });
            }
        });
    }

    return result;
}

export function getCrossListingData(crossListingIDs: any[], data: any[], hashMap: { [id: string]: number; }) {
    let result: any[] = [];

    if (crossListingIDs) {
        const length = crossListingIDs.length;

        if (length > 0) {
            // this means we've already processed this information
            // we just return it as is
            if (typeof crossListingIDs[0] !== 'string') {
                return crossListingIDs;
            }

            for (let i = 0; i < length; i++) {
                let index = hashMap[crossListingIDs[i]];

                if (index >= 0) {
                    result.push(data[index]);
                }
            }
        }
    }

    return result;
}