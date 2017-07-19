import { getFormattedString } from './appUtils';
let config = require('./partnersManifest.json');

export function getPowerBIEmbedReportURL(reportName: string) {
    let defaultFieldObj = config.fieldHub.queryParams['Default'];
    let fieldObj = reportName && (typeof (reportName) === 'string') ? config.fieldHub.queryParams[reportName] : defaultFieldObj;

    let reportId = defaultFieldObj.reportId;
    let sectionId = defaultFieldObj.sectionId;

    if (fieldObj && fieldObj.reportId && fieldObj.sectionId) {
        reportId = fieldObj.reportId;
        sectionId = fieldObj.sectionId;
    }

    let handOffUrl = config.fieldHub.embedEndpoint;
    let shouldShowFilterPane = false;
    let urlArgs = [reportId, sectionId, shouldShowFilterPane];

    return getFormattedString(handOffUrl, urlArgs);
}
