import { IUserDataState } from '../../State';
import { ProductEnum } from '../utils/dataMapping';
import { IReviewPayload, IAppDataItem, ITestDriveAcquistionsResponse } from '../Models';
import { IFirstPartyPricing, IPricingInformation } from '../../mac/Models';

// simple actions that change state in our app

export interface ActionType<TPayload> extends String { }

export type Action<TPayload> = {
    type: ActionType<TPayload>,
    payload: TPayload
}

interface ActionCreator<P> {
    (payload: P): Action<P>;
}

export function actionCreator<TPayload>(type: ActionType<TPayload>): ActionCreator<TPayload> {
    return (payload) => ({
        type,
        payload
    });
}

export function isType<TPayload>(
    action: Action<any>,
    type: ActionType<TPayload>
): action is Action<TPayload> {
    return action.type === type;
}

export const DehydrateServerStateAction: ActionType<{ shouldDehydrateListData: boolean }> = 'DehydrateServerStateAction';
export const createDehydrateServerStateAction = actionCreator(DehydrateServerStateAction);

export const RehydrateClientStateAction: ActionType<void> = 'RehydrateClientStateAction';
export const createRehydrateClientStateAction = actionCreator(RehydrateClientStateAction);

export const SearchboxInputChangedAction: ActionType<{ searchString: string }> = 'SearchboxInputChangedAction';
export const createSearchboxInputChangedAction = actionCreator(SearchboxInputChangedAction);

export const RegisterTileExtraData: ActionType<{ appDatas: IAppDataItem[] }> = 'RegisterTileExtraData';
export const createRegisterTileExtraData = actionCreator(RegisterTileExtraData);

export const LiveSearchboxFilterAction: ActionType<{ searchText: string }> = 'BasicSearchboxChangedAction';
export const createLiveSearchboxFilterAction = actionCreator(LiveSearchboxFilterAction);

export const ModalAction: ActionType<{ showModal: boolean, modalId?: number, appId?: string, options?: any }> = 'ModalAction';
export const createModalAction = actionCreator(ModalAction);

export const VideoModalAction: ActionType<{ showModal: boolean, videoUrl: string, videoThumbnail: string }> = 'VideoModalAction';
export const createVideoModalAction = actionCreator(VideoModalAction);

export const DriveModalAction: ActionType<{ showModal: boolean, driveUrl: string }> = 'DriveModalAction';
export const createDriveModalAction = actionCreator(DriveModalAction);

export const IFieldHubModalAction: ActionType<{ showModal: boolean, url: string }> = 'IFieldHubModalAction';
export const createIFieldHubModalAction = actionCreator(IFieldHubModalAction);

export const IDisclaimerModalAction: ActionType<{ showModal: boolean, title: string, description: string }> = 'IDisclaimerModalAction';
export const createIDisclaimerModalAction = actionCreator(IDisclaimerModalAction);

export const RatingAction: ActionType<IReviewPayload> = 'RatingAction';
export const createRatingAction = actionCreator(RatingAction);

export const BreadcrumbAction: ActionType<{ breadcrumbUrl: string }> = 'BreadcrumbAction';
export const createBreadcrumbAction = actionCreator(BreadcrumbAction);

export const SetCurrentViewAction: ActionType<{ currentView: string }> = 'SetCurrentView';
export const createSetCurrentViewAction = actionCreator(SetCurrentViewAction);

export const SearchResultsReceivedAction: ActionType<{ appSearchResults: any[], partnerSearchResults: any[], searchid: number }> = 'SearchResultsReceivedAction';
export const createSearchResultsReceivedAction = actionCreator(SearchResultsReceivedAction);

export const AppDataReceivedAction: ActionType<{ appData: any[], isEmbedded: boolean }> = 'AppDataReceivedAction';
export const createAppDataReceivedAction = actionCreator(AppDataReceivedAction);

export const TileDataReceivedAction: ActionType<{ apps: any, partners: any }> = 'TileDataReceivedAction';
export const createTileDataReceivedAction = actionCreator(TileDataReceivedAction);

export const ExtraDataReceivedAction: ActionType<IAppDataItem[]> = 'ExtraDataReceivedAction';
export const createExtraDataReceivedAction = actionCreator(ExtraDataReceivedAction);

// Actions for SI Partners - Start
export const PartnerDataReceivedAction: ActionType<{ partnerData: any[], isEmbedded: boolean }> = 'PartnerDataReceivedAction';
export const createPartnerDataReceivedAction = actionCreator(PartnerDataReceivedAction);

export const CuratedPartnerDataReceivedAction: ActionType<{ curatedData: any[] }> = 'CuratedPartnerDataReceivedAction';
export const createCuratedPartnerDataReceivedAction = actionCreator(CuratedPartnerDataReceivedAction);

export const PartnerDetailsReceivedAction: ActionType<{ partnerDetails: any }> = 'PartnerDetailsReceivedAction';
export const createPartnerDetailsReceivedAction = actionCreator(PartnerDetailsReceivedAction);

export const ContactAction: ActionType<{ partnerId: string, callback?: any, modalId?: number, showModal: boolean, crossListingAppContext?: IAppDataItem }> = 'ContactAction';
export const createContactAction = actionCreator(ContactAction);
// Actions for SI Partners - End

export const PowerBIDataReceivedAction: ActionType<{ appData: any[] }> = 'PowerBIDataReceivedAction';
export const createPowerBIDataReceivedAction = actionCreator(PowerBIDataReceivedAction);

export const PartnerAppDataReceivedAction: ActionType<{ appData: any[], embedHost: ProductEnum }> = 'PartnerAppDataReceivedAction';
export const createPartnerAppDataReceivedAction = actionCreator(PartnerAppDataReceivedAction);

export const AppDetailsReceivedAction: ActionType<{ appDetails: any }> = 'AppDetailsReceivedAction';
export const createAppDetailsReceivedAction = actionCreator(AppDetailsReceivedAction);

export const BillingRegionReadFromCookieAction: ActionType<{ billingRegion: string }> = 'BillingRegionReadFromCookieAction';
export const createBillingRegionReadFromCookieAction = actionCreator(BillingRegionReadFromCookieAction);

export const AppDetailPricingReceivedAction: ActionType<{ appid: string, pricing: IPricingInformation }> = 'AppDetailPricingReceivedAction';
export const createAppDetailPricingReceivedAction = actionCreator(AppDetailPricingReceivedAction);

export const SearchDataReceivedAction: ActionType<{ appIdData: any[], partnerIdData: any[], performedQuery: string }> = 'SearchDataReceivedAction';
export const createSearchDataReceivedAction = actionCreator(SearchDataReceivedAction);

export const CuratedDataReceivedAction: ActionType<{ curatedData: any[] }> = 'CuratedDataReceivedAction';
export const createCuratedDataReceivedAction = actionCreator(CuratedDataReceivedAction);

export const UserSignInAction: ActionType<IUserDataState> = 'UserSignInAction';
export const createUserSignInAction = actionCreator(UserSignInAction);

export const EmbedUserSignInAction: ActionType<IUserDataState> = 'EmbedUserSignInAction';
export const createEmbedUserSignInAction = actionCreator(EmbedUserSignInAction);

export const NpsAction: ActionType<IUserDataState> = 'NpsAction';
export const createNpsAction = actionCreator(NpsAction);

export const UserReviewUpdateAction: ActionType<boolean> = 'UserReviewUpdateAction';
export const createUserReviewUpdatedAction = actionCreator(UserReviewUpdateAction);

export const EmbeddedAppSettingAction: ActionType<{ isEmbedded: boolean }> = 'EmbeddedAppSettingAction';
export const createEmbeddedAppSettingAction = actionCreator(EmbeddedAppSettingAction);

export const NationalCloudSettingAction: ActionType<{ nationalCloud: string }> = 'NationalCloudSettingAction';
export const createNationalCloudSettingAction = actionCreator(NationalCloudSettingAction);

export const EmbeddedHostAction: ActionType<{ embedHost: number }> = 'EmbeddedHostAction';
export const createEmbeddedHostAction = actionCreator(EmbeddedHostAction);

export const LocStringsReceivedAction: ActionType<{ localizedstrings: any, locale: string }> = 'LocStringsReceivedAction';
export const createLocStringsReceivedAction = actionCreator(LocStringsReceivedAction);

export const FlightCodesReceivedAction: ActionType<{ flightCodes: string }> = 'FlightCodesReceivedAction';
export const createFlightCodesReceivedAction = actionCreator(FlightCodesReceivedAction);

export const SearchConfigReceivedAction: ActionType<{ partnerSearchUrl: string, searchUrl: string, searchAPIKey: string }> = 'SearchConfigReceivedAction';
export const createSearchConfigReceivedAction = actionCreator(SearchConfigReceivedAction);

export const CorrelationIdReceivedAction: ActionType<{ correlationId: string }> = 'CorrelationIdReceivedAction';
export const createCorrelationIdAction = actionCreator(CorrelationIdReceivedAction);

export const TelemetryLoggedAction: ActionType<void> = 'TelemetryLoggedAction';
export const createAppViewTelemetryLoggedAction = actionCreator(TelemetryLoggedAction);

export const AppPricingDataReceivedAction: ActionType<{ pricingData: any, countryCode: string }> = 'AppPricingAction';
export const createAppPricingDataReceivedAction = actionCreator(AppPricingDataReceivedAction);

export const AppPricingDataRequestedAction: ActionType<void> = 'AppPricingRequestedAction';
export const createAppPricingDataRequestedAction = actionCreator(AppPricingDataRequestedAction);

export const FirstPartyPricingDataReceivedAction: ActionType<IFirstPartyPricing> = 'FirstPartyPricing';
export const createFirstPartyPricingDataReceivedAction = actionCreator(FirstPartyPricingDataReceivedAction);

export const IncludeOfficeAppsReceivedAction: ActionType<{ includeOfficeApps: string }> = 'IncludeOfficeAppsReceivedAction';
export const createIncludeOfficeAppsReceivedAction = actionCreator(IncludeOfficeAppsReceivedAction);

export const AccessTokenReceivedAction: ActionType<{ spza: string, graph: string, testDrive: string }> = 'AccessTokenReceivedAction';
export const createAccessTokenReceivedAction = actionCreator(AccessTokenReceivedAction);

export const TestDriveInitializedAction: ActionType<ITestDriveAcquistionsResponse> = 'TestDriveInitializedAction';
export const createTestDriveInitializedAction = actionCreator(TestDriveInitializedAction);
