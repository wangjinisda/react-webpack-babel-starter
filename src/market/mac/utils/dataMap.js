var fs = require("fs");
var content = fs.readFileSync('../shared/mac/datamapping.json');

function camelCaseIt(val) {
    var valType = typeof val;
    if (valType === 'object') {
        var newObj = {};
        var keys = Object.keys(val);
        for (var i = 0, len = keys.length; i < len; i++) {
            var camelKey = camelCaseIt(keys[i]);
            var camelVal = val[keys[i]];
            newObj[camelKey] = typeof camelVal === 'object' ? camelCaseIt(camelVal) : camelVal.replace("\'", "");
            delete val[keys[i]];
        }

        return newObj;
    } else if (valType === 'string') {
        return val.slice(0, 1).toLowerCase() + val.slice(1);
    } else {
        return val;
    }
}

var json = camelCaseIt(JSON.parse(content));

// The final stream which goes into the dataMap file. Initializing with an empty string
var outStream = '';

// Disclaimer text on the top of the file
var disclaimerText = '// This is a generated file during the build. Please do not change anything in this file.\n\
// If you want to change anything in this file, please contact the project owners\n\n';

outStream += disclaimerText;

outStream += '/* tslint:disable:max-line-length */\n\n';

function getTypeInfo(value) {
    var valueType = typeof value;
    if (valueType === 'string') {
        return 'string';
    }
    if (valueType !== 'object') {
        return 'any';
    }

    if (Array.isArray(value)) {
        if (value.length > 0) {
            return getTypeInfo(value[0]) + '[]';
        } else {
            return 'any[]';
        }
    }
}

var targetPropertyCategory = null;
var targetProperty = null;
var targetPropertyCount = null;
var index = 1;

function updateFilterItem(f) {
    if (f.subCategoryDataMapping) {
        Object.keys(f.subCategoryDataMapping).forEach(function (sub) {
            updateFilterItem(f.subCategoryDataMapping[sub]);
        });
    } else if (targetProperty) {
        f["targetProperty"] = targetProperty;
        f["targetMask"] = index;
        index = index * 2;

        // This seems to be the largest 'bit' that browsers are allowing us to use bit operators with
        // For example 2147483648 & 2147483648 = -2147483648
        if (index > 1073741824) {
            targetPropertyCount++;
            index = 1;
            targetProperty = targetPropertyCategory + '_mask_' + targetPropertyCount;
        }
    }
}

// Add extra front end only fields
var dataMappings = json['dataMappings'];
Object.keys(dataMappings).forEach(function (d) {
    index = 1;
    targetPropertyCount = 1;
    targetPropertyCategory = d;
    targetProperty = targetPropertyCategory + '_mask_' + targetPropertyCount;
    Object.keys(dataMappings[d]).forEach(function (i) {
        var shortcuts = dataMappings[d][i].ShortcutFilters;
        var item = dataMappings[d][i];
        updateFilterItem(item);
    });
});

// Generate the interfaces
var interfaces = 'export interface IDataValues {\n';
var productKey = Object.keys(json['dataMappings']['category'])[0];
for (key in dataMappings['category']['compute']['subCategoryDataMapping']['featured']) {
    var optionalKey = ((key === 'targetProperty' || key === 'targetMask') ? key + '?' : key);
    interfaces += '    ' + optionalKey + ': ' + getTypeInfo(dataMappings['category']['compute']['subCategoryDataMapping']['featured'][key]) + ';\n'
}
interfaces += '    subCategoryDataMapping?: any;\n';
interfaces += '    count?: number;\n';
interfaces += '    isActive?: boolean;\n';
interfaces += '    checkFilter?: boolean;\n';
interfaces += '}\n\n';
interfaces += 'export interface IDataCollection {\n\
    [dataKey: string]: IDataValues;\n\
}\n\n\
export interface IDataMap {\n\
    category: IDataCollection;\n\
    globalFilter1: IDataCollection;\n\
    globalFilter2: IDataCollection;\n\
    globalFilter3: IDataCollection;\n\
    globalFilter4: IDataCollection;\n\
}\n\n';

outStream += interfaces;

function generateBackendKeyToLocKeyMap() {
    var result = 'export const BackendKeyToLocKey = {\n';
    var alreadyAdded = [];

    function tryAddItem(item) {
        if (alreadyAdded.indexOf(item.backendKey) == -1) {
            result += '    \'' + item.backendKey + '\': \'' + item.locKey + '\',\n';
            alreadyAdded.push(item.backendKey);
        }
    }

    for (dataMapKey in json['dataMappings']) {
        var dataMapJson = json['dataMappings'][dataMapKey];

        for (key in dataMapJson) {
            tryAddItem(dataMapJson[key]);

            if (dataMapJson.hasOwnProperty(key)) {
                var categoryJson = dataMapJson[key].subCategoryDataMapping;

                for (subKey in categoryJson) {
                    tryAddItem(categoryJson[subKey]);
                }
            }
        }
    }

    result += '};\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function generateLocKeyToURLKeyMap() {
    var result = 'export const LocKeyToURLKey = {\n';
    var alreadyAdded = [];

    function tryAddItem(item) {
        if (alreadyAdded.indexOf(item.locKey) == -1) {
            result += '    \'' + item.locKey + '\': \'' + item.urlKey + '\',\n';
            alreadyAdded.push(item.locKey);
        }
    }

    for (dataMapKey in json['dataMappings']) {
        var dataMapJson = json['dataMappings'][dataMapKey];

        for (key in dataMapJson) {
            tryAddItem(dataMapJson[key]);

            if (dataMapJson.hasOwnProperty(key)) {
                var categoryJson = dataMapJson[key].subCategoryDataMapping;

                for (subKey in categoryJson) {
                    tryAddItem(categoryJson[subKey]);
                }
            }
        }
    }


    result += '};\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function generateBackendKeyToURLKeyMap() {
    var result = 'export const BackendKeyToURLKey = {\n';
    var alreadyAdded = [];

    function tryAddItem(item) {
        if (alreadyAdded.indexOf(item.backendKey) == -1) {
            result += '    \'' + item.backendKey + '\': \'' + item.urlKey + '\',\n';
            alreadyAdded.push(item.backendKey);
        }
    }

    for (dataMapKey in json['dataMappings']) {
        var dataMapJson = json['dataMappings'][dataMapKey];

        for (key in dataMapJson) {
            tryAddItem(dataMapJson[key]);

            if (dataMapJson.hasOwnProperty(key)) {
                var categoryJson = dataMapJson[key].subCategoryDataMapping;

                for (subKey in categoryJson) {
                    tryAddItem(categoryJson[subKey]);
                }
            }
        }
    }

    result += '};\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function generateSubCategoryBitmask() {
    var result = 'export const SubCategoryBitmask = {\n';

    for (dataMapKey in json['dataMappings']) {
        var dataMapJson = json['dataMappings'][dataMapKey];

        for (key in dataMapJson) {
            if (dataMapJson.hasOwnProperty(key)) {
                var categoryJson = dataMapJson[key].subCategoryDataMapping;

                for (subKey in categoryJson) {
                    result += '    \'' + dataMapJson[key].backendKey + '_' + categoryJson[subKey].backendKey + '\': ' + '{\n' +
                        '        property: \'' + categoryJson[subKey].targetProperty + '\',\n' +
                        '        mask: ' + categoryJson[subKey].targetMask + '\n' +
                        '    },\n';
                }
            }
        }
    }

    result += '};\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function generateCategoryTargetPropertyList() {
    var result = 'export const CategoryTargetPropertyList = [\n';
    var alreadyAdded = [];

    function tryAddItem(item) {
        if (alreadyAdded.indexOf(item.targetProperty) == -1) {
            result += '    \'' + item.targetProperty + '\',\n';
            alreadyAdded.push(item.targetProperty);
        }
    }

    for (dataMapKey in json['dataMappings']) {
        var dataMapJson = json['dataMappings'][dataMapKey];

        for (key in dataMapJson) {
            if (dataMapJson.hasOwnProperty(key)) {
                var categoryJson = dataMapJson[key].subCategoryDataMapping;

                for (subKey in categoryJson) {
                    tryAddItem(categoryJson[subKey]);
                }
            }
        }
    }

    result += '];\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

function generateCategoryIgnoreList() {
    var result = 'export const CategoryIgnoreList = [\n';

    result += '    \'apps\',\n';

    result += '];\n\n';
    // Remove the last comma
    result = result.replace(/,(?=[^,]*$)/, '');
    return result;
}

outStream += generateBackendKeyToLocKeyMap();
outStream += generateBackendKeyToURLKeyMap();
outStream += generateLocKeyToURLKeyMap();
outStream += generateSubCategoryBitmask();
outStream += generateCategoryTargetPropertyList();
outStream += generateCategoryIgnoreList();

// Generate the main data mapping constant for the front end.
var dataMappingConst = 'export const DataMap: IDataMap = ' + JSON.stringify(dataMappings, null, 4) + ';';
outStream += dataMappingConst + '\n\n';

// Add the product ignore list const.
// var productIgnoreListConst = 'export const ProductIgnoreList = ' + JSON.stringify(json['productIgnoreList'], null, 4) + ';';
// outStream += productIgnoreListConst;

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
removeQuotes(json['dataMappings']['category'][productKey]);

// Replace LF with CRLF
finalContent = finalContent.replace(/\r?\n/g, "\r\n");

// Write into the dataMappings file
fs.writeFile('./src/mac/utils/dataMapping.tsx', finalContent);
