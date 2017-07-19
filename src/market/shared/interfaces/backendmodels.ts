// ------------------------------------------------------------------------------
//
//     This code was generated from C# classes.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
//     To update this file compile the applicable C# project.
//
// ------------------------------------------------------------------------------

export module Microsoft_SaaSMarketPlace_Solutions_Models {
export enum AADApplicationCredentialType {
     Secret = <any>'Secret',
     Certificate = <any>'Certificate'
}

export enum FailureCode {
     ApplicationExecution = <any>'ApplicationExecution',
     Infrastructure = <any>'Infrastructure',
     InvalidMetadata = <any>'InvalidMetadata',
     Timeout = <any>'Timeout',
     AdalException = <any>'AdalException',
     ResourceManagerAuthorization = <any>'ResourceManagerAuthorization',
     SubscriptionNotFound = <any>'SubscriptionNotFound'
}

export enum SolutionInstanceState {
     NotStarted = <any>'NotStarted',
     Provisioning = <any>'Provisioning',
     Provisioned = <any>'Provisioned',
     Assigning = <any>'Assigning',
     Assigned = <any>'Assigned',
     Refreshing = <any>'Refreshing',
     Deprovision = <any>'Deprovision',
     Deprovisioning = <any>'Deprovisioning',
     Deprovisioned = <any>'Deprovisioned'
}

export enum SolutionOutputType {
     String = <any>'String',
     SecureString = <any>'SecureString',
     Url = <any>'Url',
     HandOffUrl = <any>'HandOffUrl',
     MetadataMarkdown = <any>'MetadataMarkdown'
}

export enum SolutionProvisioningType {
     TestDrive = <any>'TestDrive',
     Pilot = <any>'Pilot',
     Production = <any>'Production'
}

export enum TestDriveAssignmentStrategy {
     User = <any>'User',
     Tenant = <any>'Tenant',
     Custom = <any>'Custom'
}

export enum TestDriveExpirationStrategy {
     Deprovision = <any>'Deprovision',
     Refresh = <any>'Refresh'
}

export enum TestDriveInstanceState {
     Hot = <any>'Hot',
     Warm = <any>'Warm',
     Assigned = <any>'Assigned',
     Cold = <any>'Cold'
}

export enum TransitionType {
     Provision = <any>'Provision',
     Deprovision = <any>'Deprovision'
}

     export interface AADApplicationConfiguration {
          applicationId: string;
          applicationKey: string;
          keyType: Microsoft_SaaSMarketPlace_Solutions_Models.AADApplicationCredentialType;
          tenantId: string;
     }
     export interface BaseSolutionDocument {
          _etag?: string;
          _self?: string;
          createdDate: string;
          doctype: Microsoft_SaaSMarketPlace_Webjobs_Models.DocType;
          id: string;
          isActive: boolean;
          modifiedDate: string;
          partitionKey: string;
          solutionId: string;
     }
     export interface SolutionInstance extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          expirationDate?: string;
          failureCode?: Microsoft_SaaSMarketPlace_Solutions_Models.FailureCode;
          lastInstanceTransitionDetailId: string;
          provisioningState: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstanceState;
          provisioningType: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionProvisioningType;
          region: string;
          solutionVersion: number;
     }
     export interface SolutionInstanceTransitionDetail extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          correlationId: string;
          endTime?: string;
          failureCode?: Microsoft_SaaSMarketPlace_Solutions_Models.FailureCode;
          outputLog: string;
          persistedOutput: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionOutput[];
          provisioningState: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstanceState;
          solutionInstanceId: string;
          solutionVersion: number;
          startTime: string;
     }
     export interface SolutionLifetimeDefinition {
          transitionDefinitions: Microsoft_SaaSMarketPlace_Solutions_Models.TransitionDefinition[];
     }
     export interface SolutionLifetimes {
          testDriveLifetime: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionLifetimeDefinition;
     }
     export interface SolutionManifest extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          createdBy: Microsoft_SaaSMarketPlace_Solutions_Models.User;
          internalVersion: number;
          lifetimes: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionLifetimes;
          product: string;
          tenantId: string;
          version: string;
     }
     export interface SolutionOutput {
          index: number;
          isVisible: boolean;
          key: string;
          type: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionOutputType;
          value: any;
     }
     export interface TestDriveConfiguration extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          applicationConfiguration: Microsoft_SaaSMarketPlace_Solutions_Models.AADApplicationConfiguration;
          assignmentStrategy: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveAssignmentStrategy;
          avgDeploymentTime: string;
          defaultManagementSetting: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveManagementSetting;
          escalationEmail: string[];
          expirationStrategy: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveExpirationStrategy;
          isTrialEnabled: boolean;
          managementSettings: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveLocationMangementSetting[];
          maxTrialAcquisitions: number;
          product: string;
          trialDuration: string;
     }
     export interface TestDriveInstance extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          acquisitionPriority: number;
          failureCode?: Microsoft_SaaSMarketPlace_Solutions_Models.FailureCode;
          instanceId: string;
          region: string;
          state: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveInstanceState;
     }
     export interface TestDriveLocationMangementSetting extends Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveManagementSetting {
          azureOrchestrationResourceGroup: string;
          region: string;
     }
     export interface TestDriveManagementSetting {
          azureSubscriptionId: string;
          hotInstances?: number;
          maxInstances?: number;
          warmInstances?: number;
     }
     export interface TransitionDefinition {
          definitionLocation: string;
          definitionName: string;
          kind: Microsoft_SaaSMarketPlace_Solutions_Models.TransitionType;
     }
     export interface User {
          objectId: string;
          tenantId: string;
     }
     export interface Workspace extends Microsoft_SaaSMarketPlace_Solutions_Models.BaseSolutionDocument {
          createdBy: Microsoft_SaaSMarketPlace_Solutions_Models.User;
          Users: Microsoft_SaaSMarketPlace_Solutions_Models.User[];
     }
}
export module Microsoft_SaaSMarketPlace_Solutions_Models_StoredProcedures {
export enum AcquireTestDriveStatusCodes {
     Success = <any>'Success',
     ValidationError = <any>'ValidationError',
     NoInstancesAvailable = <any>'NoInstancesAvailable',
     RetryLimitReached = <any>'RetryLimitReached',
     NoActiveManifest = <any>'NoActiveManifest',
     SolutionInstanceNotFound = <any>'SolutionInstanceNotFound',
     TestDriveNotConfigured = <any>'TestDriveNotConfigured'
}

export enum SynchronizationStatusCode {
     Success = <any>'Success',
     PartialSuccess = <any>'PartialSuccess',
     ValidationFailure = <any>'ValidationFailure',
     PreconditionFailed = <any>'PreconditionFailed'
}

     export interface AcquireTestDriveRequest {
          solutionId: string;
          solutionInstance: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstance;
          testDriveDurationInSeconds: number;
     }
     export interface AcquireTestDriveResponse {
          message: string;
          solutionInstance: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstance;
          statusCode: Microsoft_SaaSMarketPlace_Solutions_Models_StoredProcedures.AcquireTestDriveStatusCodes;
          testDriveInstance: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveInstance;
     }
     export interface DeregisterColdInstancesRequest {
          coldInstancesToDeregister: number;
          region: string;
          solutionId: string;
     }
     export interface SynchronizationInstanceRequest {
          solutionInstance: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstance;
          solutionInstanceDetail: Microsoft_SaaSMarketPlace_Solutions_Models.SolutionInstanceTransitionDetail;
          testDriveInstance: Microsoft_SaaSMarketPlace_Solutions_Models.TestDriveInstance;
     }
     export interface SynchronizationTestDriveResponse {
          instancesUpserted: number;
          message: string;
          statusCode: Microsoft_SaaSMarketPlace_Solutions_Models_StoredProcedures.SynchronizationStatusCode;
     }
}
export module Microsoft_SaaSMarketPlace_Webjobs_Models {
export enum DocType {
     None = <any>'None',
     App = <any>'App',
     Partner = <any>'Partner',
     Checksummap = <any>'Checksummap',
     Metadata = <any>'Metadata',
     Search = <any>'Search',
     Acquisition = <any>'Acquisition',
     Review = <any>'Review',
     TestDriveConfiguration = <any>'TestDriveConfiguration',
     SolutionInstance = <any>'SolutionInstance',
     SolutionInstanceTransitionDetail = <any>'SolutionInstanceTransitionDetail',
     TestDriveInstance = <any>'TestDriveInstance',
     Workspace = <any>'Workspace',
     SolutionManifest = <any>'SolutionManifest',
     Pricing = <any>'Pricing',
     ReviewEmail = <any>'ReviewEmail',
     SideLoadedSolutionMetadata = <any>'SideLoadedSolutionMetadata',
     ADTenantsWithNoConsent = <any>'ADTenantsWithNoConsent',
     StaticPartner = <any>'StaticPartner',
     OfficeReviewMapping = <any>'OfficeReviewMapping',
     OfficeReviewWatermark = <any>'OfficeReviewWatermark'
}

export enum TestDriveType {
     Showcase = <any>'Showcase',
     AzureTestDriveService = <any>'AzureTestDriveService',
     SolutionsTestDrive = <any>'SolutionsTestDrive'
}

     export interface AppsourcePartitionedResourceBase extends Microsoft_SaaSMarketPlace_Webjobs_Models.AppsourceResourceBase {
          partitionKey: string;
     }
     export interface AppsourceResourceBase {
          doctype: Microsoft_SaaSMarketPlace_Webjobs_Models.DocType;
          id: string;
     }
     export interface DocumentLinkResource {
          DocumentName: string;
          DocumentUri: string;
     }
     export interface ReviewEmail extends Microsoft_SaaSMarketPlace_Webjobs_Models.AppsourcePartitionedResourceBase {
          acquisitionId: string;
          appId: string;
          createdDate: string;
          isActive: boolean;
          lastDeliveryAttempt?: string;
          modifiedDate: string;
          reviewRequestSent?: string;
          userId: string;
     }
     export interface TestDriveDetails {
          Description: string;
          Duration: string;
          EstimatedDeploymentDuration: string;
          InstructionsDocument: Microsoft_SaaSMarketPlace_Webjobs_Models.DocumentLinkResource;
          OfferId: string;
          PublisherId: string;
          ShowcaseLink: string;
          Type: Microsoft_SaaSMarketPlace_Webjobs_Models.TestDriveType;
          Videos: Microsoft_SaaSMarketPlace_Webjobs_Models.VideoLinkResource[];
     }
     export interface VideoLinkResource {
          ThumbnailURL: string;
          VideoLink: string;
          VideoName: string;
     }
}
