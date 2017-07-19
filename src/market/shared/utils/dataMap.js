var fs = require("fs");
var content = fs.readFileSync('../shared/appsource/datamapping.json');
var json = JSON.parse(content);

// The final stream which goes into the dataMap file. Initializing with an empty string
var outStream = '';

// Disclaimer text on the top of the file
var disclaimerText = '// This is a generated file during the build. Please do not change anything in this file.\n\
// If you want to change anything in this file, please contact the project owners\n\n';

outStream += disclaimerText;

outStream += '/* tslint:disable:max-line-length */\n\n';

function generateEnum(enumName, enumType) {
    var dataMapJson = json['dataMappings'][enumType];
    var result = 'export enum ' + enumName + ' {\n';

    for (key in dataMapJson) {
        if (dataMapJson.hasOwnProperty(key)) {
            result += '    \'' + key + '\' = ' + dataMapJson[key].FilterID + ',\n'
        }
    }

    result += '}\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function getTypeInfo(value) {
    var valueType = typeof value;
    if (valueType !== 'object') {
        return valueType;
    }

    if (Array.isArray(value)) {
        if (value.length > 0) {
            return getTypeInfo(value[0]) + '[]';
        } else {
            return 'any[]';
        }
    }
}

function generateBitmaskEnum(enumName, enumType) {
    var dataMapJson = json['dataMappings'][enumType];
    var result = 'export enum ' + enumName + ' {\n';

    for (key in dataMapJson) {
        if (dataMapJson.hasOwnProperty(key)) {
            result += '    \'' + dataMapJson[key].BackendKey + '\' = ' + dataMapJson[key].FilterID + ',\n'
        }
    }

    result += '}\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

// These 3 lines below create ProductEnum, IndustryEnum and CategoryEnum in the dataMap file
// We could add the ProductEnum and other Enums into the Single Source of Truth file and use that mapping here.
// But I don't want to bloat up the SST file with just the Enums mappings
outStream += generateEnum('ProductEnum', 'products');
outStream += generateEnum('IndustryEnum', 'industries');
outStream += generateEnum('CategoryEnum', 'categories');

outStream += generateBitmaskEnum('ProductBitmaskEnum', 'products');
outStream += generateBitmaskEnum('IndustryBitmaskEnum', 'industries');
outStream += generateBitmaskEnum('CategoryBitmaskEnum', 'categories');

var groupUrlMap = {
    'products': 'product',
    'categories': 'category',
    'industries': 'industry'
};

// Add extra front end only fields
var dataMappings = json['dataMappings'];
Object.keys(dataMappings).forEach(function (d) {
    Object.keys(dataMappings[d]).forEach(function (i) {
        var shortcuts = dataMappings[d][i].ShortcutFilters;
        var item = dataMappings[d][i];
        item.ShortcutUrlKey = item.UrlKey;
        item.ShortcutBitmask = item.FilterID;
        item.FilterGroup = groupUrlMap[d];
        if (shortcuts && shortcuts.length > 0) {
            item.ShortcutUrlKey = shortcuts.map(function (s) {
                return dataMappings[d][s].UrlKey;
            }).join(';');

            // an item's bitmask value should be itself plus
            // its children combined
            // this will allow us to have apps/partners that don't have to belong to a child
            // for them to belong to a parent
            item.ShortcutBitmask = item.FilterID + shortcuts.reduce(function (acc, s) {
                return acc + dataMappings[d][s].FilterID;
            }, 0);
        }
    });
});

// Generate the interfaces
var interfaces = 'export interface IDataValues {\n';

// We are picking a product that has all non-fields so that type can be inferred correctly.
var productKey = 'dynamics-365';
for (key in json['dataMappings']['products'][productKey]) {
    interfaces += '    ' + key + ': ' + getTypeInfo(json['dataMappings']['products'][productKey][key]) + ';\n'
}

interfaces += '    isActive?: boolean;\n';
interfaces += '    count?: number;\n';
interfaces += '    match?: (item: any) => boolean;\n';
interfaces += '    checkFilter?: boolean;\n';
interfaces += '}\n\n';
interfaces += 'export interface IDataCollection {\n\
    [dataKey: string]: IDataValues;\n\
}\n\n\
export interface IDataMap {\n\
    products: IDataCollection;\n\
    categories: IDataCollection;\n\
    industries: IDataCollection;\n\
}\n\n';

outStream += interfaces;

// Generate the main data mapping constant for the front end.
var dataMappingConst = 'export const DataMap: IDataMap = ' + JSON.stringify(dataMappings, null, 4) + ';';
outStream += dataMappingConst + '\n\n';

// Add the product ignore list const.
var productIgnoreListConst = 'export const ProductIgnoreList = ' + JSON.stringify(json['productIgnoreList'], null, 4) + ';';
outStream += productIgnoreListConst;

// Post-processing the final content
// 1) Replace the double quotes with the single quotes in the tsx file to avoid linting errors
// 2) Remove the quotes around 'products', 'industries' and 'categories'
// 3) Remove the quotes around 'FilterID', 'LocKey', 'Title', 'UrlKey' and 'BackendKey'
var finalContent = outStream.replace(/"/g, "'");

function removeQuotes(itemsList) {
    for (key in itemsList) {
        var str = '\'' + key + '\'';
        var regExp = new RegExp(str, "g");
        finalContent = finalContent.replace(regExp, key)
    }
}

removeQuotes(json['dataMappings']);
removeQuotes(json['dataMappings']['products'][productKey]);

// Replace LF with CRLF
finalContent = finalContent.replace(/\r?\n/g, "\r\n");
finalContent = finalContent.replace(/ProductCode:/, "ProductCode?:");
finalContent = finalContent.replace(/AllowMSA:/, "AllowMSA?:");

// Write into the dataMappings file
fs.writeFile('./src/shared/utils/dataMapping.tsx', finalContent);
