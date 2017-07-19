import { IRouteConfig } from '../routerHistory';
import { Constants } from '../utils/constants';
import { TileOnDemandLoadingService } from '../services/TileOnDemandLoadingService';
import { ITestDriveAcquistionsResponse } from './../Models';

export interface IBuildHrefFn {
    <T>(route: IRouteConfig<T>, routeArgs: T, newProps: {}, keepAllParams?: boolean): string;
}

export interface IBuildHrefContext {
    buildHref: IBuildHrefFn;
}

export interface IRouteQueryContext {
    query: { [key: string]: string};
}

export interface ILocContext {
    loc: (textid: string, fallback?: string) => string;
}

export interface ILocParamsContext {
    locParams: (textid: string, params: string[], fallback?: string) => string;
}

export interface ILocDateStringContext {
    locDateString: (dateAsString: string) => string;
}

export interface ICTACallbackContext {
    ctaCallback: (app: any, ctaType?: Constants.CTAType, skuId?: string) => void;
}

export interface IContactCallbackContext {
    contactCallback: (partner: any, crossListingAppcontext?: any) => void;
}

export interface IOpenTileCallbackContext {
    openTileCallback: (detailUrl: string) => void;
}

// Add all the context items in this interface which should be present in all the components
// Also this should be added to all the components if we are adding any context item
export interface ICommonContext {
    renderErrorModal: () => void;
    getTileOnDemandLoadingService: () => TileOnDemandLoadingService;
}

export interface ITestDriveContext {
    persistTestDriveState: (testDriveInstance: ITestDriveAcquistionsResponse) => void;
}

export interface ITimerContext {
    timerCallback: () => void;
}