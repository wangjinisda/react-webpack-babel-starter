import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, ITelemetryData, IPartnerDataItem } from '../Models';
import { ILocParamsContext, ILocContext, IBuildHrefContext, ICommonContext } from '../interfaces/context';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { routes, urlPush, IRouteConfig } from '../routerHistory';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';
import Ribbon from './ribbon';
import { getWindow } from '../services/window';
import { InternalLink } from './internalLink';
// import { getSegueAppsResultsHeader, getSegueAppsResultsSubHeader, getSegueAppsResultsTitle, getViewAppResultsTitle } from 'utils/localization';
import { getSegueAppsResultsHeader, getSegueAppsResultsSubHeader, getSegueAppsResultsTitle, getViewAppResultsTitle } from './../../mac/utils/localization';
// import { IDataValues } from 'utils/dataMapping';
import { IDataValues } from './../../mac/utils/dataMapping';
// import { shouldShowAppPromotion } from 'utils/segue';
import { shouldShowAppPromotion } from './../../mac/utils/segue';
import AppPromotionPane from './appPromotionPane';

export interface ISegueProps {
    galleryPageMode: Constants.GalleryPageMode;
    filteredApps: IAppDataItem[];
    filteredPartners: IPartnerDataItem[];
    isEmbedded: boolean;
    activeFilters: IDataValues[];
    searchText: string;
}

const defaultTopResultTileCount = 5;

export default class Segue extends SpzaComponent<ISegueProps, any> {
    context: ILocParamsContext & ILocContext & IBuildHrefContext & ICommonContext;

    getSegueHeaders(appsCount: number, partnersCount: number, segueMode: Constants.SegueMode) {
        let headers = { header: '', subHeader: '', galleryHeader: '', gallerySubHeader: '', galleryHeaderSegueLink: '', galleryHeaderSegueTitle: '' };
        if (segueMode === Constants.SegueMode.OnlyApps) {
            headers.galleryHeader = this.context.locParams('FilteredGallery_PartnerResults', [partnersCount.toString()]);
            headers.gallerySubHeader = this.context.loc('FilteredGallery_NoPartners', 'No partners found.');
            headers.header = this.context.loc(getSegueAppsResultsHeader());
            headers.subHeader = this.context.loc(getSegueAppsResultsSubHeader());
        }
        if (segueMode === Constants.SegueMode.OnlyPartners) {
            headers.galleryHeader = this.context.locParams(getSegueAppsResultsTitle(), [appsCount.toString()]);
            headers.gallerySubHeader = this.context.loc('FilteredGallery_NoApps', 'No apps found.');
            headers.header = this.context.loc('FilteredGallery_SeguePartnerResultsHeader', 'Top partner results');
            headers.subHeader = this.context.loc('FilteredGallery_SeguePartnerResultsSubHeader', 'We found a few partners that match your criteria');
        }
        if (segueMode === Constants.SegueMode.AppsAndPartners) {
            if (this.props.galleryPageMode === Constants.GalleryPageMode.Apps) {
                headers.galleryHeader = this.context.locParams(getSegueAppsResultsTitle(), [appsCount.toString()]);
                headers.gallerySubHeader = '';
                headers.galleryHeaderSegueLink = this.context.buildHref(routes.marketplacePartners, null, { page: '1' });
                headers.galleryHeaderSegueTitle = this.context.locParams('FilteredGallery_ViewPartnerResults', [partnersCount.toString()]);

            } else {
                headers.galleryHeader = this.context.locParams('FilteredGallery_PartnerResults', [partnersCount.toString()]);
                headers.gallerySubHeader = '';
                headers.galleryHeaderSegueTitle = this.context.locParams(getViewAppResultsTitle(), [appsCount.toString()]);
                headers.galleryHeaderSegueLink = this.context.buildHref(routes.marketplace, null, { page: '1' });
            }
        }
        if (segueMode === Constants.SegueMode.None) {
            this.props.galleryPageMode === Constants.GalleryPageMode.Apps ?
                headers.galleryHeader = this.context.locParams(getSegueAppsResultsTitle(), [appsCount.toString()]) :
                headers.galleryHeader = this.context.locParams('FilteredGallery_PartnerResults', [partnersCount.toString()]);
        }

        return headers;
    }

    // Possible Modes OnlyApps, OnlyPartners, AppsandPartners, None
    // None and AppsandPartners the header component handles to show the links, props are set and passed from setSegueHeader
    // OnlyApps, OnlyPartners the tiles and headers are shown from getSegueTiles
    getSegueMode(appsCount: number, partnersCount: number) {
        let segueMode = Constants.SegueMode.None;

        if (appsCount > 0 && partnersCount > 0) {
            segueMode = Constants.SegueMode.AppsAndPartners;
        } else if (this.props.galleryPageMode === Constants.GalleryPageMode.Apps && appsCount === 0 && partnersCount > 0) {
            segueMode = Constants.SegueMode.OnlyPartners;
        } else if (this.props.galleryPageMode === Constants.GalleryPageMode.Partners && partnersCount === 0 && appsCount > 0) {
            segueMode = Constants.SegueMode.OnlyApps;
        }

        let detailsObject = {
            segueMode: Constants.SegueModeString[segueMode],
            appResults: appsCount,
            partnerResults: partnersCount
        };

        let seguePayLoad: ITelemetryData = {
            page: 'none', // RENDER can't call 'window' because it also runs on the server getWindow().location.href,
            action: Constants.Telemetry.Action.SegueMode,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: JSON.stringify(detailsObject)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', seguePayLoad);

        return segueMode;
    }

    buildNavigateUrl<T>(route: IRouteConfig<T>) {
        return this.context.buildHref(route, null, { page: '1' });
    }

    segueClickHandler(mode: Constants.SegueMode) {
        const partnersCount = this.props.filteredPartners && this.props.filteredPartners.length || 0;
        const appsCount = this.props.filteredApps && this.props.filteredApps.length || 0;

        let detailsObject = {
            appResults: appsCount,
            partnerResults: partnersCount
        };

        let seguePayLoad: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Segue,
            details: JSON.stringify(detailsObject)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', seguePayLoad);

        // Just update the component keeping the same query params
        let path = '';
        if (mode === Constants.SegueMode.OnlyApps) {
            path = this.context.buildHref(routes.marketplace, null, { page: '1' });
        } else if (mode === Constants.SegueMode.OnlyPartners) {
            path = this.context.buildHref(routes.marketplacePartners, null, { page: '1' });
        }

        urlPush(path, true);
    }

    // TODO: shouldn't show in embeddded
    renderImpl() {
        // Should Embedded have its own implementation that renders null? probably
        if (this.props.isEmbedded) {
            return null;
        }

        let appsCount = this.props.filteredApps.length;
        let partnersCount = this.props.filteredPartners.length;

        let mode = this.getSegueMode(appsCount, partnersCount);
        let headers = this.getSegueHeaders(appsCount, partnersCount, mode);

        // TODO: we really shouldn't be doing this on every render
        let detailsObject = {
            segueMode: Constants.SegueModeString[mode],
            appResults: appsCount,
            partnerResults: partnersCount
        };

        let currWindow = getWindow();
        let seguePayLoad: ITelemetryData = {
            page: currWindow ? currWindow.location.href : 'Gallery',
            action: Constants.Telemetry.Action.SegueMode,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: JSON.stringify(detailsObject)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', seguePayLoad);

        return (
            <div className='spza_galleryHeader'>
                <div className='header'>
                    <div className='headerName'>{headers.galleryHeader || ''}
                        {
                            (headers.galleryHeaderSegueTitle && headers.galleryHeaderSegueLink) ?
                                <InternalLink className='segueHeaderLink' href={headers.galleryHeaderSegueLink} accEnabled={1}>
                                    {headers.galleryHeaderSegueTitle}
                                </InternalLink> : null
                        }
                    </div>
                    {
                        headers.gallerySubHeader
                            ? <div className='segueSubHeader'>
                                {headers.gallerySubHeader}
                            </div> : null
                    }
                </div>
                {shouldShowAppPromotion() && this.props.galleryPageMode === Constants.GalleryPageMode.Apps ?
                    <AppPromotionPane activeFilters={this.props.activeFilters} searchText={this.props.searchText} /> : null}
                {
                    mode === Constants.SegueMode.OnlyApps || mode === Constants.SegueMode.OnlyPartners ? (
                        <div className='spza_tileGroups'>
                            <div className='spza_controls'></div>
                            {
                                <Ribbon title={headers.header} onClick={() => this.segueClickHandler(mode)}
                                    seeMoreText={this.context.loc('Link_SeeAll')} subHeader={headers.subHeader} >
                                    {
                                        mode === Constants.SegueMode.OnlyApps ?
                                            this.props.filteredApps.slice(0, defaultTopResultTileCount).map((a: IAppDataItem, index: number) => {
                                                return <AppTile {...a}
                                                    key={index}
                                                    customCSSClass={'tile' + index}
                                                    tileIndex={index} />;
                                            }) :
                                            this.props.filteredPartners.slice(0, defaultTopResultTileCount).map((p: IPartnerDataItem, index: number) => {
                                                return <PartnerTile {...p}
                                                    key={index}
                                                    customCSSClass={'tile' + index}
                                                    tileIndex={index} />;
                                            })
                                    }
                                </Ribbon>
                            }
                        </div>
                    ) : null
                }
            </div>
        );
    }
}

(Segue as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
