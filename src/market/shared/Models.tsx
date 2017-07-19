export interface ISearchItem {
  type: string;
  text: string;
}

export interface ISearchResult extends ISearchItem {
  id: string;
  logo: string;
}

export interface ISearchShowAll extends ISearchItem {
    type: 'SearchShowAll';
}

export interface IAppSearchResult extends ISearchResult {
    type: 'AppSearchResult';
    product: string;
    publisher: string;
}

export interface IPartnerSearchResult extends ISearchResult {
    type: 'PartnerSearchResult';
    product: string;
}

export interface IFilterItem {
  text: string;
  id: number;
  active: boolean;
  locid: string;
  additionalData?: IFilterAdditionalData; // This is the optional data which is needed only for product filters
}

export interface IFilterAdditionalData {
  iconURL: string;
  learnMoreURL: string;
}

export interface IFilterGroups {
  filterByProduct: IFilterItem[];
  filterByCategory: IFilterItem[];
  filterByIndustry: IFilterItem[];
}

export interface IImages {
  ImageName: string;
  ImageUri: string;
}

export interface ICollateralDocuments {
  DocumentName: string;
  DocumentUri: string;
}

export interface IDemoVideos {
  VideoLink: string;
  VideoName: string;
  ThumbnailURL: string;
}

export interface ICompetencies {
  Type: string;
  Names: string[];
}

export interface IDetailInformation {
  Description: string;
  LargeIconUri: string;
  Images?: IImages[];
  DemoVideos?: IDemoVideos[];
  CollateralDocuments?: ICollateralDocuments[];
  LanguagesSupported?: string[];
}

export interface IAppDetailInformation extends IDetailInformation {
  Subcategories?: string[];
  Keywords?: string[];
  HelpLink: string;
  SupportLink: string;
  PrivacyPolicyUrl?: string;
  AdditionalPurchasesRequired?: boolean;
  Countries?: string[];
  AppVersion?: string;
  PlatformVersion?: string;
  ReleaseDate?: string;
  CertifiedPartners?: IPartnerDataItem[];
  // The below properties are added for Office Onboarding. These will be valid for other products also in the future
  Capabilities?: string[];
  AverageRating?: number;
  NumberOfRatings?: number;
  WorksWith?: string[];
  SiteLicenceAvailable?: boolean;
  IconBackgroundColor?: string;
  TestDriveDetails?: ITestDriveItem;
  // TODO: add pricing meta data
}

export interface IPartnerDetailInformation extends IDetailInformation {
  ShortDescription: string;
  HQAddress: IAddress;
  OtherLocations?: IAddress[];
  Website?: string;
  Phone?: string;
  Certifications?: string[];
  Competencies?: ICompetencies[];
  YearFounded?: string;
  EmployeeCount?: string;
  DateJoined: string;
  LeadGenEmail: string;
  ApplicationsSupported?: IAppDataItem[];
}

export interface IAddress {
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state?: string;
  country: string;
  postal?: string;
}

export interface IDataItem {
  title: string;
  products: number;
  industries: number;
  categories: number;
  filtermatch: boolean;
  friendlyURL?: string; // An alternative match for the 'appid or partnerid' in the detail page URL
  detailLoadFailed: boolean;
}

// In the future we might want to have a single interface that IPartnerDataItem and IAppDataItem both extend depending on the schema and use cases
export interface IPartnerDataItem extends IDataItem {
  partnerId: string;
  tagline: string;
  competencyType?: number;
  competencyName?: string;
  detailInformation?: IPartnerDetailInformation;
  iconURL?: string;
}

export interface IAppDataItemBasicData extends IDataItem {
  appid: string;
  publisher: string;
  builtFor: string;
  iconBackgroundColor?: string;
  actionString: string;
  primaryProduct: number;
  handoffURL?: string;
  showcaseLink?: string;
  privateApp?: boolean;
  leadgenEnabled?: boolean;
  detailInformation?: IAppDetailInformation;    // todo: with TS2.0 we should set this to non-nullable so that our appdetail page can be written more succinct
  testDriveType?: string;
  startingPrice?: IStartingPrice;
  extraDataLoaded?: boolean;
}

export interface ITestDriveItem {
  type: string;
  showcaseLink?: string;
  publisherId?: string;
  offerId?: string;
  description?: string;
  duration?: string;
  videos?: IDemoVideos[];
  instructionsDocument?: ICollateralDocuments;
}

export interface IAppDataItemExtraData {
  appid: string;
  shortDescription?: string;
  licenseTermsUrl?: string;
  iconURL?: string;
}

export interface IAppDataItem extends IAppDataItemBasicData, IAppDataItemExtraData {
}

export interface ICuratedSection<T> {
  titleId: string;
  items: T[];
}

export interface IUserInfo {
    firstName: string;
    lastName: string;
    email: string;
    displayName?: string;
    phone?: string;
    country?: string;
    company?: string;
    title?: string;
    oid?: string;
    tid?: string;
    thumbphoto?: string;
    alternateEmail?: string;
    isMSAUser: boolean;
    isFieldUser: boolean;
}

// Please do not change this model. This is used for Leadgen payload
export interface ILeadGenInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
    company?: string;
    title?: string;
    oid?: string;
    tid?: string;
}

export interface ILeadConfigInfo {
    serverId?: string;
    munchkinId?: string;
    formId?: string;
    url?: string;
    authenticationType?: string;
    userName?: string;
    password?: string;
    connectionString?: string;
    objectIdentifier?: string;
    containerName?: string;
}

export interface ILeadgenPayload {
  customerInfo: ILeadGenInfo;
  acquisitionType?: string;
}

export interface IVideo {
  videoLink: string;
  thumbnailURL: string;
}

export interface IDrive {
  urlLink: string;
}

export interface IFieldHub {
  url: string;
}

export interface IDisclaimer {
  title: string;
  description: string;
}

export interface IReviewPayload {
  showModal: boolean;
  app: IAppDataItem;
  accessKey: string;
  ctaType: string;
  callback: any;
}

export interface IAcquistionUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  title?: string;
  oid?: string;
  tid?: string;
  alternateEmail?: string;
}

export interface IAcquistionAppInfo {
  appid: string;
  appName: string;
  builtFor: string;
  publisher: string;
  category?: string;
}

export interface IAcquistionPartnerInfo {
  partnerUrl: string;
  partnerName: string;
  products: string;
}

export interface IAcquistionPayload {
  acquisitionId?: string;
  acquisitionTime: string;
  ctaType: string;
  appData?: IAcquistionAppInfo;
  partnerData?: IAcquistionPartnerInfo;
  userInfo: IAcquistionUserInfo;
}

export interface IAcquistionPayloadV2 {
  acquisitionId?: string;
  acquisitionType: string;
  appData?: IAcquistionAppInfo;
  partnerData?: IAcquistionPartnerInfo;
  userInfo: IAcquistionUserInfo;
  planId?: string;
}

// Telemetry Models. This is the common model between front-end and WFE backend which talks with the telemetry service
// This Telemetry event will be constructed from the ITelemetryData
export interface ITelemetryEvent {
  page: string;
  action: string;
  actionModifier: string;
  clientTimestamp: string;
  appName?: string;
  product?: number;
  featureFlag?: string;
  details?: string;
}

// This is the telemetry model which we use for logging.
// Notice that this doesn't have timestamp. That will be added while constructing the debug event
export interface ITelemetryData {
  page: string;
  action: string;
  actionModifier: string;
  appName?: string;
  partnerId?: string;
  partnerUrl?: string;
  product?: number;
  featureFlag?: string;
  details?: string;
  flushLog?: boolean;
}

export interface ITelemetryEvents {
  TelemetryEvents: ITelemetryEvent[];
}

export interface IAppListingInfo {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  company: string;
  website: string;
  appName: string;
  industry: string;
  description: string;
  cloudIntegrations: string[];
  appUses?: string[];
  msEmails?: string;
  type: string;
  referral: string;
  location: string;
  trialUrl: string;
}

export interface IPartnerListingInfo {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  company: string;
  website: string;
  msEmails?: string;
  companyListings?: string;
  industries?: string[];
  appListings?: string;
  type: string;
  referral: string;
}

export interface IUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  company?: string;
  title?: string;
  id: string;
  lastLogin?: string;
}

export interface IUserAcquisitionInfo {
  id: string;
  userid: string;
  email: string;
  fullName: string;
  appid: string;
  appName: string;
  publisher: string;
  product: string;
  acquisitionTime: string;
  ctaType: string;
  accessKey?: string;
  useridHash?: string;
  category?: string;
  acquisitionType?: string;
  acquisitionInstanceId?: string;
  acquisitionInstanceType?: string;
  isAcquisitionSuccess?: boolean;
  partitionKey?: string;
  doctype?: string;
  isAuthenticated?: boolean;
  sourceAppId?: string;
}

export interface IUserReview {
  // These are mandatory while pushing to Db
  // TODO: Have a different interface for client Model
  id?: string;
  userId?: string;
  appid: string;
  product: string;
  rating: number;
  title?: string;
  description: string;
  isPublic?: boolean;
  submitted?: string;
  lastUpdated?: string;
  ctaType?: string;
  responseRate?: string;
  doctype?: string;
}

export interface ISharedAccessKey {
  appid: string;
  product: string;
  userId: string;
  expiry: number;
}

export interface IRequestContext {
  correlationId: string;
  requestId: string;
  operation: string;
  apiVersion: string;
  continuation?: string;
  headers?: any;
}

export interface IADUserProfile {
  jobTitle?: string;
  companyName?: string;
  telephoneNumber?: string;
  mobile?: string;
  country?: string;
  orgData?: IADCompanyProfile;
}

export interface IADCompanyProfile {
  displayName?: string;
  countryLetterCode?: string;
  telephoneNumber?: string;
  postalCode?: string;
  state?: string;
  street?: string;
  country?: string;
  city?: string;
}

// Why this is not a shared model with BE
// Represents the result of the creating an new testdrive
export interface ITestDrive {
  code: string;
  message: string;
  instanceType: string;
  instanceId: string;
  instanceState: string;
}

// Test Drive status
export module SolutionInstanceStatus {
  export const Provisioning = 'Provisioning';
  export const Ready = 'Ready';
  export const Deprovisioned = 'Deprovisioned';
  export const Expired = 'Expired';
  export const Error = 'Error';
}

// Auto generated shared/maintained by BE and FE
// Represents the test drive status response from the BE API
export interface ISolutionInstanceStatusResponse {
  id: string;
  appId: string;
  solutionVersion: number;
  location: string;
  provisioningType: string;
  status: string;
  expirationDate?: string;
  outputs: ISolutionInstanceOutput[];
}

// Represents the test drive type and cta action
export interface ISolutionInstanceOutput {
  key: string;
  value: string;
  type: string;
  index: number;
}

export interface IComponentHTMLData {
  html: string;
  appTileExtraData: { [id: string]: IAppDataItem };
}

export enum PricingStates {
  Loading = 1,
  BYOL,
  AlwaysAvailable,
  NotAvailableInThisRegion,
  NoPricingData,
  FreeApp,
  AdditionalPurchasesRequired,
  SolutionTemplate,
  WebApp
}

export interface IStartingPrices {
  prices: { [appId: string]: IStartingPrice };
}

export interface IPrice {
  value: number;
  unit: string;
}

export interface ILocalPrice extends IPrice {
  currency: string;
}

export type IStartingPrice = {
  pricingData: ILocalPrice | PricingStates,
  hasFreeTrial?: boolean,
  pricingBitmask?: { [property: string]: number }
}

export interface IBillingCountry {
  countryCode: string;
  currency: string;
  name: string;
}

export interface ITestDriveAcquistionsResponseOutput {
  key: string;
  value: string;
  type: string;
  index: number;
}

export interface ITestDriveAcquistionsResponse {
    id: string;
    appid: string;
    instanceType: string;
    solutionVersion: number;
    location: string;
    provisioningType: string;
    status: string;
    expirationDate: Date;
    outputs: ITestDriveAcquistionsResponseOutput[];
}
