import { ILeadGenInfo, ILeadgenPayload, ILeadConfigInfo } from './../shared/Models';


export interface IAppLead extends ILeadgenPayload {
    actionCode: LeadActionCode;
    appName?: string;
    appId: string;
    description?: string;
}

export interface IPartnerLead extends ILeadgenPayload {
    partnerId: string;
    partnerName?: string;
    email: string;
    appName?: string;
    appLinkUrl?: string;
}

export interface ILeadGenSvcPayload {
    leadSource: string;
    customerInfo: ILeadGenInfo;
    actionCode: string;
    productId: string;
    description?: string;
}

export interface ILeadGenSettingsSvcPayload {
    leadDestination: string;
    leadConfiguration: ILeadConfigInfo;
    publisherDisplayName: string;
    productId: string;
    offerDisplayName: string;
    contactEmail?: string;
}

export class LeadPayload implements ILeadGenSvcPayload {

    leadSource: string = process.env.leadGenSource;
    customerInfo: ILeadGenInfo;
    actionCode: string;
    productId: string;
    description?: string;

    constructor(userInfo: ILeadGenInfo, actionCode: string, productId: string, description?: string) {
        this.customerInfo = userInfo;
        this.actionCode = actionCode;
        this.productId = productId;
        this.description = description;
    }
}

export class LeadSettingsPayload implements ILeadGenSettingsSvcPayload {

    leadDestination: string;
    leadConfiguration: ILeadConfigInfo;
    publisherDisplayName: string;
    productId: string;
    offerDisplayName: string;
    contactEmail?: string;

    constructor(leadDestination: string, leadConfiguration: ILeadConfigInfo, productId: string, publisherDisplayName: string, offerDisplayName: string, contactEmail?: string) {
        this.leadDestination = leadDestination;
        this.leadConfiguration = leadConfiguration;
        this.productId = productId;
        this.publisherDisplayName = publisherDisplayName;
        this.offerDisplayName = offerDisplayName;
        this.contactEmail = contactEmail;
    }
}

// API request validation result
export class ValidationResult {
    result: boolean;
    message: string;
}

// API response
export class ApiResponse {
    statusCode: number;
    response: string;
}

// Valid set of actions code
export enum LeadActionCode {
    'INS' = 1,
    'INF',
    'INA',
    'PLT',
    'DM',
    'DNC',
    'StartTestDrive'
}

export enum AppActionCode {
    'GET' = 0,
    'TRY' = 1,
    'REQUEST_TRIAL' = 2
}

// Logger Models

export interface IHttpRequestContext {
    requestID: string;
    correlationID: string;
    operation: string;
    httpMethod: string;
    hostName: string;
    targetUri: string;
    userAgent: string;
    clientIpAddress: string;
    apiVersion: string;
    contentLength: number;
    headers: string;
}

export interface IHttpRequest {
    httpRequestContext: IHttpRequestContext;
    httpStatusCode: number;
    durationInMilliseconds: number;
    errorMessage: string;
}

// Notify result models 
export enum AcquisitionResult {
    'UserNotAuthorized' = 1,
    'DeploymentFailedDueToPackage',
    'DeploymentFailed',
    'Successful',
    'UserCancel',
    'UserTimeOut'
}

export interface IAcquisitionResult {
    acquisitionResult: AcquisitionResult;
    detail: string;
}

export interface INewsletterSubscriptionInfo {
  emailAddress: string;
}