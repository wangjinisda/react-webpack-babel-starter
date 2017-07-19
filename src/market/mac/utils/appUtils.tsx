import { DataMap, IDataCollection, CategoryIgnoreList } from './dataMapping';

export function getDataMapValues(collection: IDataCollection, app: any) {
    // if the category is not found in the ignore list, proceed
    // otherwise ignore
    return Object.keys(DataMap.category).filter((key) => CategoryIgnoreList.indexOf(key) < 0).map((categoryValue) => {
        const keys = Object.keys(DataMap.category[categoryValue].subCategoryDataMapping);
        const keysLength = keys.length;

        for (let i = 0; i < keysLength; i++) {
            const subCategoryValue = keys[i];
            const subCategory = DataMap.category[categoryValue].subCategoryDataMapping[subCategoryValue];

            if (app[subCategory.targetProperty] & subCategory.targetMask) {
                const category = DataMap.category[categoryValue];

                return category;
            }
        }
    }).filter((value) => value);
}

export function getDataMapString(collection: IDataCollection, app: any, field: string) {
    let dataMapValues = getDataMapValues(collection, app);
    let result = dataMapValues.map((value) => {
        if (value) {
            return value[field];
        } else {
            return '';
        }
    }
    ).join(', ');

    return result;
}