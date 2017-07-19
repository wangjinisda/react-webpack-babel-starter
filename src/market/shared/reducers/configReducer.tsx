import {
    Action,
    isType,
    NationalCloudSettingAction,
    EmbeddedAppSettingAction,
    EmbeddedHostAction,
    LocStringsReceivedAction,
    FlightCodesReceivedAction,
    SearchConfigReceivedAction,
    CorrelationIdReceivedAction,
    BreadcrumbAction,
    TelemetryLoggedAction,
    SetCurrentViewAction,
    AppPricingDataRequestedAction,
    AppPricingDataReceivedAction,
    IncludeOfficeAppsReceivedAction,
    BillingRegionReadFromCookieAction
} from './../actions/actions';
import {
    IConfigState,
    initialConfigState,
    copyState
} from './../../State';

export default function configReducer(state: IConfigState = initialConfigState, action: Action<any>): IConfigState {
    let newState = copyState(state);
    if (isType(action, NationalCloudSettingAction)) {
        newState.nationalCloud = action.payload.nationalCloud;
    } else if (isType(action, EmbeddedAppSettingAction)) {
        newState.isEmbedded = action.payload.isEmbedded;
    } else if (isType(action, LocStringsReceivedAction)) {
        newState.locStrings = action.payload.localizedstrings;
        newState.locale = action.payload.locale;
    } else if (isType(action, EmbeddedHostAction)) {
        newState.embedHost = action.payload.embedHost;
    } else if (isType(action, FlightCodesReceivedAction)) {
        newState.flightCodes = action.payload.flightCodes;
    } else if (isType(action, SearchConfigReceivedAction)) {
        newState.searchAPIKey = action.payload.searchAPIKey;
        newState.searchUrl = action.payload.searchUrl;
        newState.partnerSearchUrl = action.payload.partnerSearchUrl;
    } else if (isType(action, CorrelationIdReceivedAction)) {
        newState.correlationId = action.payload.correlationId;
    } else if (isType(action, BreadcrumbAction)) {
        newState.breadcrumbUrl = action.payload.breadcrumbUrl;
    } else if (isType(action, TelemetryLoggedAction)) {
        newState.appViewTelemetryLoggedCount = state.appViewTelemetryLoggedCount + 1;
    } else if (isType(action, SetCurrentViewAction)) {
        newState.currentView = action.payload.currentView;
    } else if (isType(action, AppPricingDataRequestedAction)) {
        newState.pricingDataLoaded = false;
    } else if (isType(action, AppPricingDataReceivedAction)) {
        newState.billingCountryCode = action.payload.countryCode;
        newState.pricingDataLoaded = true;
    } else if (isType(action, IncludeOfficeAppsReceivedAction)) {
        newState.includeOfficeApps = true;
    } else if (isType(action, BillingRegionReadFromCookieAction)) {
        newState.billingCountryCode = action.payload.billingRegion;
    } else {
        return state;
    }

    return newState;
}
