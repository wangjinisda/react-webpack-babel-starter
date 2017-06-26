import * as testDriveRestClient from '../services/http/testDriveRestClient';
import { IUserInfo, IAppDataItem, ITestDriveAcquistionsResponse, SolutionInstanceStatus } from '../Models/Models';
import { Constants } from './constants';
import { saveCookie, readCookie } from './appUtils';
let sha256 = require('crypto-js/sha256');

// 24 hours, after which the user will be asked to consent for the lead again
const cookieExpiryInterval = 1000 * 3600 * 24;

// Created a new test drive calling the BE API for the current app and the current user
// Failure will result in setting the test drive state to ERROR
export function initializeTestDrive(userInfo: IUserInfo, appData: IAppDataItem, acessToken: string, testdriveToken: string, flightCodes: string) {
    let payload: any = {
        acquisitionType: Constants.ActionStrings.TestDrive,
        appData: {
            appid: appData.appid,
            appName: appData.title ? appData.title : '',
            builtFor: appData.builtFor ? appData.builtFor : '',
            publisher: appData.publisher ? appData.publisher : '',
            category: appData.privateApp ? 'private' : 'public'
        },
        userInfo: userInfo
    };
    return testDriveRestClient.createTestDrive(payload, acessToken, testdriveToken, flightCodes);
}

export function getTestDriveByInstance(appId: string, instanceId: string, accessToken: string, testdriveToken: string) {
    let promise = new Promise((resolve, reject) => {
        testDriveRestClient.getTestDriveInstance(appId, instanceId, accessToken, testdriveToken)
            .then((r: any) => {
                let response: any[] = r.filter((item: any) => { return item.instance.id === instanceId; });
                if (response && response.length > 0) {
                    response[0].instance.appid = appId;
                    resolve(response[0].instance);
                } else {
                    // unable to locate the instance for the user
                    reject(null);
                }
            }, () => {
                reject(null);
            });
    });
    return promise;
}

// Only called for AppSource 
export function createAndPollForTestDrive(userInfo: IUserInfo, appData: IAppDataItem, acessToken: string, testdriveToken: string, flightCodes: string) {
    let counter = 0;
    let intervalId: any = null;
    let promise = new Promise((resolve, reject) => {
        // Create a new test drive.
        initializeTestDrive(userInfo, appData, acessToken, testdriveToken, flightCodes)
            .then((r: ITestDriveAcquistionsResponse) => {
                intervalId = setInterval(() => {
                    // Poll for the test drive to turn hot 2 times with an interval of 2.5 secs
                    getTestDriveByInstance(appData.appid, r.id, acessToken, testdriveToken)
                        .then((output: ITestDriveAcquistionsResponse) => {
                            if (output.status === SolutionInstanceStatus.Ready) {
                                clearInterval(intervalId);
                                resolve(output);
                            } else if (counter >= 2) {
                                clearInterval(intervalId);
                                resolve(output);
                            }
                        }).catch(() => {
                            clearInterval(intervalId);
                            reject(null);
                        });
                    counter++;
                }, 2500);
            }, () => {
                clearInterval(intervalId);
                reject(null);
            }).catch(() => {
                clearInterval(intervalId);
                reject(null);
            });
    });
    return promise;
}

export function getAllTestDriveByAppId(appId: string, accessToken: string, testdriveToken: string) {
    let promise = new Promise((resolve, reject) => {
        testDriveRestClient.getTestDriveInstance(appId, '', accessToken, testdriveToken)
            .then((r: any) => {
                resolve(r);
            }, () => {
                reject(null);
            });
    });
    return promise;
}

// Any failure with setting the cookie is swallowed, it would just set the behaviour as to cookies was never there
// expiryInterval is as a parameter as a test hook
export function setTestDriveCookie(appId: string, userName: string, testDriveInstanceId: string, expiryInterval = cookieExpiryInterval) {
    let cookieName = sha256(appId + userName);
    let now = new Date();
    let time = now.getTime();
    let expireTime = time + expiryInterval;
    now.setTime(expireTime);
    saveCookie(cookieName.toString(), testDriveInstanceId, 'expires=\'' + now.toUTCString() + '\'');
}

// Any failure to read the cookie will set the behaviour as to cookie was never set
export function isTestDriveInProgress(appId: string, userName: string) {
    let cookieName = sha256(appId + userName);
    let cookie = readCookie(cookieName.toString(), false);
    return cookie ? true : false;
}