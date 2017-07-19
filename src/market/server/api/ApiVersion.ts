let apiVersions: string[] = [
    '2016-12-07',
    '2017-01-24',
    '2017-04-19'
];

export let errorMessages = {
    invalidApiVersion: "Invalid value for query string 'api-version'. Allowed values are " + JSON.stringify(apiVersions),
    missingApiVersion: "Query string 'api-version' is missing. Allowed values are " + JSON.stringify(apiVersions),
    multipleValuesForQueryParam: ' query string does not support multiple values. Please provide a single value'
};

export let minVersionForOData = process.env.minVersionForOData || '2016-12-07';

export function isValidAPIVersion(apiVersion: string): boolean {
    return apiVersions.indexOf(apiVersion) !== -1;
}