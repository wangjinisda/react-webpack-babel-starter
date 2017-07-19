import * as httpProtocol from './httpProtocol';
import { ISolutionInstanceStatusResponse, ITestDriveAcquistionsResponse } from '../../Models';
import { logError } from '../../utils/httpClientUtil';
import { getAppConfig } from '../../services/init/appConfig';

let option: httpProtocol.IHttpOption = {
    requireCorrelationId: true,
    stringifyPostData: false
};

export function createTestDrive(payload: any, accessToken: string, testDriveToken: string, flightCodes?: string) {
    // for 0.1 is always testdriveofferid=0.1
    let endpoint = '/api/v2.0/acquisitions?api-version={0}';
    endpoint = endpoint.replace('{0}', getAppConfig('apiVersion'));
    if (flightCodes) {
        endpoint = endpoint + '&flightCodes=' + flightCodes;
    }
    let post = httpProtocol.post(endpoint, option);
    let authTokenHeader = {
        'x-ms-authorization': 'Bearer ' + testDriveToken
    };
    post.addHeader(authTokenHeader);

    if (accessToken) {
        post.setAuthHeader(accessToken);
    }

    return post
        .setData(payload)
        .request()
        .then((result: any) => {
            let testDriveInstance: ITestDriveAcquistionsResponse = result.instance;
            testDriveInstance.appid = payload.appData.appid;
            return testDriveInstance;
        })
        .catch((error: any) => {
            logError('Failed to create a testdrive' + error.toString());
            return Promise.reject(error);
        });
}

export function getTestDrive(appId: string, instanceId: string, accessToken: string, testDriveToken: string) {
    let endpoint = '/api/v2.0/acquisitioninstances?api-version={0}&$filter=appid eq \'{1}\'  and acquisitiontype eq \'CTA_TestDrive\'';
    endpoint = endpoint.replace('{0}', getAppConfig('apiVersion')).replace('{1}', appId).replace('{2}', instanceId);
    let get = httpProtocol.get(endpoint, option);
    let authTokenHeader = {
        'x-ms-authorization': testDriveToken
    };
    get.addHeader(authTokenHeader);

    if (accessToken) {
        get.setAuthHeader(accessToken);
    }

    return get
        .request()
        .then((result: any) => {
            let r: ISolutionInstanceStatusResponse = result;
            return r;
        })
        .catch((error: any) => {
            logError('Failed to get a testdrive' + error.toString());
            return Promise.reject(error);
        });
}

export function getTestDriveInstance(appId: string, instanceId: string, accessToken: string, testDriveToken: string) {
    let endpoint = '/api/v2.0/acquisitions?api-version={0}&$filter=appid eq \'{1}\' and acquisitioninstanceid eq \'{2}\'';
    endpoint = endpoint.replace('{0}', getAppConfig('apiVersion')).replace('{1}', appId).replace('{2}', instanceId);
    let get = httpProtocol.get(endpoint, option);
    let authTokenHeader = {
        'x-ms-authorization': testDriveToken
    };
    get.addHeader(authTokenHeader);

    if (accessToken) {
        get.setAuthHeader(accessToken);
    }

    return get
        .request()
        .then((result: any) => {
            return result;
        })
        .catch((error: any) => {
            logError('Failed to get a testdrive' + error.toString());
            return Promise.reject(error);
        });
}