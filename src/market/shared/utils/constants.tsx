/* This file should contain all the app constants which we use in the SPZA project */

export module Constants {
    // This is the terms URL which you see in the consent modal in the CTA pages.
    export const MicrosoftTermsURL = 'http://go.microsoft.com/fwlink/?LinkID=808038';
    export const MicrosoftPrivacyStatementURL = 'https://privacy.microsoft.com/en-us/privacystatement/';
    export const FeaturedAppsId = '99';
    export const ClientHttpRequestRetryCount = process.env.clientHttpRequestRetryCount || 2;

    export const mooncakeNationalCloud = 'mooncake';
    export const fairfaxNationalCloud = 'fairfax';
    export const blackforestNationalCloud = 'blackforest';
    export const EmailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    export const crossListingRibbonItemCount = 5;
    export const memCacheExpiry = 1200000;
    // Waiting for the real link from PMs
    export const testDriveDocumentationLink = 'https://go.microsoft.com/fwlink/?linkid=845086';
    export const DelayLoadImageUrlPrefix = '/images/1x1.gif?';

    export const refreshAccessTokenInterval = 1000 * 60 * 45; // 45 minutes in ms

    export const primaryHashSecret = 'c%g+@=9L$PTgsBTp+K6CnR5kn&ujF_&A';
    export const secondaryHashSecret = '8QmM?6BW;Nw~H*vH_r<qL[4`;S%{~ZBX';
    export const primaryEncryptionSecret = 'c%g+@=9L$PTgsBTp+K6CnR5kn&ujF_&A';
    export const secondaryEncryptionSecret = '8QmM?6BW;Nw~H*vH_r<qL[4`;S%{~ZBX';

    export module Cookies {
        export const AppSourceCookie = 'appsource';
        export const AppSourceLeadCookie = 'appsourcelead';
        export const LocaleCookie = 'spzaLocale';
    }

    export const UrlParamCacheKeyWhiteList: string[] = [
        'page',
        'product',
        'category',
        'industry',
        'subcategories',
        'tab',
        'filters'
    ];

    export const RawDataCacheKeyPrefix = 'RawData|';

    export module Headers {
        export const RequestId = 'x-ms-requestid';
        export const CorrelationId = 'x-ms-correlationid';
        export const UserAgent = 'x-ms-useragent';
        // Please do not remove the extra space as the end
        export const Bearer = 'Bearer ';
        export const AccessKey = 'accesskey';
        export const Authorization = 'authorization';
        export const Referer = 'referer';
        export const InternalAuthorizationHeader = 'x-ms-authorization';
        export const Cookie = 'cookie';
    }

    export module OperationNames {
        export const Server = 'Server';
        export const PreRequest = 'Potential AAD Callback Request';
        export const MainRequest = 'Request Received';
        export const Embed = 'Embed';
        export const Signin = 'Signin';
        export const Signout = 'Logout';
        export const AADCallback = 'AAD Callback Request';
        export const LeadGen = 'LeadGeneration';
        export const SaveLeadGenSettings = 'SaveLeadGenSettings';
        export const SolutionsTestDriveAcquisition = 'Solutions Test Drive Acquisition';
        export const SolutionsInstanceStatus = 'Solutions Instance Status';
        export const SolutionsInstanceAction = 'Solutions Instance Action';
        export const AmpTestDriveAcquisition = 'AmpTestDriveAcquisition';
        export const AmpSolutionsInstanceStatus = 'AmpSolutionsInstanceStatusProcessor';
        export const AmpSolutionsInstanceAction = 'AmpSolutionsInstanceAction';
        export const Acquisition = 'Acquisition';
    }

    export module HttpMessage {
        export const InvalidQueryParams = 'Invalid query parameters';
        export const OneOrMoreErrors = 'One or more errors occured';
        export const Forbidden = 'Forbidden';
        export const NotFound = 'Not Found';
        export const InternalServerError = 'Internal Server Error';
        export const BadRequest = 'BadRequest';
    }

    export module ControllerOperations {
        export const ValidateQueryParams = 'Validation of query parameters';
        export const ValidatePayload = 'Validation of payload';
        export const GenerateLead = 'Generation of lead';
        export const SaveLeadSettings = 'Saving lead settings';
        export const AuthoriseRequest = 'Authorization of request';
    }

    export module QueryStrings {
        export const CorrelationId = 'correlationId';
        export const ApplicationId = 'appId';
        export const PartnerId = 'partnerId';
        export const Product = 'product';
        export const PlanId = 'planId';
        export const DemoId = 'demoId';
        export const LabId = 'labId';
        export const PublisherId = 'publisherId';
        export const DemoSessionId = 'demoSessionId';
        export const flightCodes = 'flightCodes';
        export const billingRegion = 'billingRegion';
        export const modalAppId = 'modalAppId';
        export const modalPartnerId = 'modalPartnerId';
        export const signInModalType = 'signInModalType';
        export const productId = 'productId';
    }

    // These constants are the CTA resource keys
    export module ActionStrings {
        export const Get = 'CTA_Get';
        export const Try = 'CTA_Try';
        export const RequestTrial = 'CTA_ContactMe';
        export const Contact = 'Contact';
        export const TestDrive = 'CTA_TestDrive';
        export const AccessNow = 'CTA_AccessNow'; // Start Mooncake
    }

    // There are 3 different type of sigin modals. Based on this enum value, we show corresponding modal.
    // const is removed here because const enums do not produce a lookup object when compiled. We are referencing this object in aad.js file. 
    // It will give an error when we reference SignInType except as part of a member reference.
    export enum SignInType {
        OldSignInModal, // This is added to support old legacy modal
        SignInWith_MSA_AAD,
        SignInWith_AAD,
        SwitchTo_AAD,
        Authorized // This will be set when you are signed in with a proper authentication which that app supports
    }

    // These action codes are for lead gen api which has to be added in the request headers.
    export module ActionCodes {
        export const RequestTrial = 'PLT';
        export const TryGet = 'INS';
        export const Contact = 'CTT';
        export const CrossListingContact = 'DNC';
        export const TestDrive = 'StartTestDrive';
    }

    export const TestDriveOfferIdVersion = '0.1';

    export const enum ModalType {
        NoModalShow,
        SignIn,
        SignOut,
        CTA,
        Contact,
        Image,
        Video,
        NPS,
        Rating,
        Error,
        Drive,
        Iframe,
        Disclaimer
    }

    export const enum CTAType {
        Create = 1,
        TestDrive = 2
    }

    export module filterTileTypes {
        export const search = 'search';
        export const product = 'product';
        export const industry = 'industry';
        export const category = 'category';
    }

    export module filterMaps {
        export const products = 'products';
        export const industries = 'industries';
        export const categories = 'categories';
    }

    export module Telemetry {
        export module Action {
            // Primary Actions
            export const Click = 'Click';
            export const Search = 'Search';
            export const PageLoad = 'Page Load';
            export const NetworkCall = 'Network Call';
            export const FilterClick = 'Filter Click';
            export const NotifyResult = 'Notify Result';
            export const SegueMode = 'Segue Mode';
            export const ImageLoad = 'Image Load';
            export const RefreshToken = 'Refresh Token';
            export const ErrorModal = 'Error Modal';
            export const MyOrgApps = 'My Org Apps';

            // Secondary Actions
            export const SpzaUserId = 'spzaUserId';
            export const UserSettings = 'User Settings';
            export const UserTenantInfo = 'User Tenant Info';
            export const PerfEvents = 'Perf Telemetry Events';
            export const NPS = 'NPS';
            export const FieldHub = 'FieldHub';
            export const CrossListingInfo = 'Cross Listing Info';
        }

        export module ActionModifier {
            export const Start = 'Start';
            export const End = 'End';
            export const Error = 'Error';
            export const Info = 'Info';
            export const RRSubmit = 'R&R';
            export const Link = 'Link';
            export const Tab = 'Tab';
            export const Debug = 'Debug';
            export const Declined = 'Declined';
            export const ConsentModal = 'Consent Modal';
            export const CTAModal = 'CTA Modal';
            export const ContactModal = 'Contact Modal';
            export const LoginModal = 'Login Modal';
            export const Signup = 'Signup';
            export const CrossListingContact = 'Cross Listing Contact';
            export const SubmitLeadGen = 'Submit Lead Gen';
            export const Segue = 'Segue';
            export const SearchSuggestions = 'Search Suggestions';
            export const SpzaUserIdNew = 'New User';
            export const SpzaUserIdReturn = 'Returning User';
            export const Tile = 'Tile';
            export const CookieData = 'CookieData';
            export const BillingCountry = 'Billing Country';
            export const ChooseSKU = 'Choose SKU';
            export const DownloadCSV = 'Download CSV';
            export const VMFilter = 'VM Filter';
            export const TestDrive = 'Test Drive';
            export const AzureTestDrive = 'Azure Test Drive';
            export const NavigatingToTestDrive = 'Navigating to test drive';
            export const TestDriveDismissed = 'Test Drive Dismissed';
            export const FilterPane = 'Filter Pane';
            export const FilterTag = 'Filter Tag';
            export const Feedback = 'feedback';
            export const FeedbackModal = 'feedbackModal';
            export const Breadcrumb = 'Breadcrumb';
            export const Results = 'Results';
            export const FirstPartyAppPromotion = 'First Party App Promotion';
        }
    }

    export const apiServicePrefix = 'api/v2.0';
    export const appsourceApiVersion = '2017-04-19';
    export const dbSchemaVersion = '2017-04-19';
    export const userCollectionSchemaVersion = '2016-10-14';
    export const acquisitionCollectionSchemaVersion = '2017-04-27';
    export const TestDrivePath = 'JwtTokenDemoSession';

    export const enum GalleryPageMode {
        Partners,
        Apps
    }

    export const enum SegueMode {
        None,
        OnlyApps,
        OnlyPartners,
        AppsAndPartners
    }

    export const SegueModeString = [
        'None',
        'Apps',
        'Partners',
        'Apps and Partners'
    ];

    export const enum CompetencyBadge {
        Gold,
        Silver,
        BadgeNotFound
    }

    export const FeaturedAppsOrder = [
        '99',
        '64',
        '128',
        '1024',
        '256',
        '1',
        '8',
        '512',
        '4',
        '32',
        '16'
    ];

    export module TestDriveType {
        export const Showcase = 'Showcase';
        export const AzureTestDriveService = 'AzureTestDriveService';
        export const SolutionsTestDrive = 'SolutionsTestDrive';
    }

    export module TestDriveOutputType {
        export const HandOffUrl = 'handoffurl';
        export const MetadataMarkdown = 'metadatamarkdown';
    }

    export module EmailCategories {
        export const ContactSI = 'Contact SI';
        export const ContactSICrossListing = 'Contact SI (Cross listing)';
        export const CorrelationIdArgKey = 'correlationId';
        export const UserIdArgKey = 'userId';
    }

    export module ReservedCorrelationIds {
        export const EmptyId = '00000000-0000-0000-0000-000000000000';
        export const RepoCacheRefresh = '00000000-0000-0000-0000-000000000001';
        export const SignInEmptyId = '00000000-0000-0000-0000-000000000002';
        // error id used if no correlation id is available
        export const ErrorId = '00000000-0000-0000-0000-111111111111';
    }

    export module ReservedOperationNames {
        export const RepoCacheRefresh = 'RepoCacheRefresh';
    }

    export module TestDriveResponse {
        export const DemoSessionId = 'demoSessionId';
        export const Status = 'status';
        export const OutputItemList = 'outputItemList';
        export const HandOffUrl = 'HandOffUrl';
        export const StringKey = 'String';
        export const AppUri = 'app Uri';
        export const TestDrive = 'TestDrive';
        export const SessionSource = 'sessionSource';
        export const StoppedTime = 'stoppedTime';
        export const MarketPlaceMetadataMarkdownKey = '_marketPlaceMetadataMarkdown';
    }

    export module DocTypes {
        export const App = 'App';
        export const Partner = 'Partner';
        export const Pricing = 'Pricing';
        export const SolutionManifest = 'SolutionManifest';
    };

    export const enum TestDriveState {
        Hot,
        Cold,
        Error,
        Unknown
    }

    // These values for auth type are given by Office Store team 
    export const enum AuthType {
        MSA = 1,
        AAD = 2
    }

    /**
    * All resource types
    * @export
    * @enum {number}
    */
    export enum ResourceTypes {
        'AllApps',
        'FeaturedApps',
        'FlightCodedAndLiveApps',
        'AllPartners',
        'FeaturedPartners',
        'AppAndPartnerMappings',
        'User',
        'Pricing',
        'SolutionMetadata',
        'SolutionRuntime',
        'Acquisition'
    };

    export const Office365Mapping = {
        'SharePoint_Online': ['SharePoint Online'],
        'Access_Online': ['Access Online'],
        'Excel_Online': ['Excel Online'],
        'OneNote_Online': ['OneNote Online'],
        'Project_Online': ['Project Online'],
        'PowerPoint_Online': ['PowerPoint Online'],
        'Word_Online': ['Word Online'],
        'App_Details_Requirements_Products_Office365': ['Office 365'],
        'App_Details_Requirements_Products_ExcelIOS': ['Excel for iPad'],
        'App_Details_Requirements_Products_WordIOS': ['Word for iPad'],
        'App_Details_Requirements_Products_OutlookOnWeb': ['ProductOnTheWeb', 'Outlook'],
        'App_Details_Requirements_Products_PowerPointIOS': ['PowerPoint for iPad'],
        'App_Details_Requirements_Products_OneNoteWindows10': ['OneNote for Windows 10'],
        'App_Details_Requirements_Products_PowerBI': ['Power BI'],
        'OfficeProductForAndroid_Outlook': ['Outlook for Android'],
        'OfficeProductForIOS_Outlook': ['Outlook for iOS'],
        'Excel_2016_Mac': ['Excel 2016 for Mac'],
        'PowerPoint_2016_Mac': ['PowerPoint 2016 for Mac'],
        'Outlook_2016_Mac': ['Outlook 2016 for Mac'],
        'Word_2016_Mac': ['Word 2016 for Mac'],
        'OfficeProductOrLater_SharePoint_2013': ['ProductVersionOrLater', 'SharePoint 2013'],
        'OfficeProductOrLater_SharePoint_2016': ['ProductVersionOrLater', 'SharePoint 2016'],
        'Access_2016_SP1': ['ProductVersionOrLater', 'Access 2016 SP1'],
        'Excel_2016_SP1': ['ProductVersionOrLater', 'Excel 2016 SP1'],
        'OneNote_2016_SP1': ['ProductVersionOrLater', 'OneNote 2016 SP1'],
        'Outlook_2016_SP1': ['ProductVersionOrLater', 'Outlook 2016 SP1'],
        'Project_2016_SP1': ['ProductVersionOrLater', 'Project 2016 SP1'],
        'PowerPoint_2016_SP1': ['ProductVersionOrLater', 'PowerPoint 2016 SP1'],
        'Word_2016_SP1': ['ProductVersionOrLater', 'Word 2016 SP1'],
        'Access_2013_SP1': ['ProductVersionOrLater', 'Access 2013 SP1'],
        'Excel_2013_SP1': ['ProductVersionOrLater', 'Excel 2013 SP1'],
        'OneNote_2013_SP1': ['ProductVersionOrLater', 'OneNote 2013 SP1'],
        'Outlook_2013_SP1': ['ProductVersionOrLater', 'Outlook 2013 SP1'],
        'Project_2013_SP1': ['ProductVersionOrLater', 'Project 2013 SP1'],
        'PowerPoint_2013_SP1': ['ProductVersionOrLater', 'PowerPoint 2013 SP1'],
        'Word_2013_SP1': ['ProductVersionOrLater', 'Word 2013 SP1'],
        'Access_2016': ['ProductVersionOrLater', 'Access 2016'],
        'Excel_2016': ['ProductVersionOrLater', 'Excel 2016'],
        'OneNote_2016': ['ProductVersionOrLater', 'OneNote 2016'],
        'Outlook_2016': ['ProductVersionOrLater', 'Outlook 2016'],
        'Project_2016': ['ProductVersionOrLater', 'Project 2016'],
        'PowerPoint_2016': ['ProductVersionOrLater', 'PowerPoint 2016'],
        'Word_2016': ['ProductVersionOrLater', 'Word 2016'],
        'Access_2013': ['ProductVersionOrLater', 'Access 2013'],
        'Excel_2013': ['ProductVersionOrLater', 'Excel 2013'],
        'OneNote_2013': ['ProductVersionOrLater', 'OneNote 2013'],
        'Outlook_2013': ['ProductVersionOrLater', 'Outlook 2013'],
        'Project_2013': ['ProductVersionOrLater', 'Project 2013'],
        'PowerPoint_2013': ['ProductVersionOrLater', 'PowerPoint 2013'],
        'Word_2013': ['ProductVersionOrLater', 'Word 2013']
    };

    export const AcquisitionCtaContactIgnored = 'CTA_Contact';
}
