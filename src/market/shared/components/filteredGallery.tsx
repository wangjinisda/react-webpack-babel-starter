
import { IAppDataItem, ITelemetryData, IPartnerDataItem } from '../Models';
import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { ILocContext, ILocParamsContext, IBuildHrefContext, ICommonContext } from '../interfaces/context';
import PaginationControl from './paginationControl';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';
import { getWindow } from '../services/window';
import { shouldShowPowerAppsNoContent, getPowerAppsTitle } from '../../embed/embedHostUtils';
// import { getFilteredAppPageTitle } from 'utils/localization';
import { getFilteredAppPageTitle } from './../../mac/utils/localization';
import { ProductEnum } from '../utils/dataMapping';
import { urlPush, routes } from '../../shared/routerHistory';
import Animation from './animation';

export interface IFilteredGalleryProps {
    galleryPage: number;
    pageSize: number;
    filteredApps: IAppDataItem[];
    filteredPartners: IPartnerDataItem[];
    ensureAppData: () => Promise<any>;
    ensurePartnerData: () => Promise<any>;
    showPrivateApps: boolean;
    isEmbedded: boolean;
    partnerAppDataLoaded: boolean;
    embedHost: number;
    galleryPageMode: Constants.GalleryPageMode;
}

interface SegueHeaders {
    header: string;
    subHeader: string;
    galleryHeader: string;
    gallerySubHeader: string;
    galleryHeaderSegueTitle: string;
    galleryHeaderSegueLink: string;
}

const defaultPageSize = 60;

export default class FilteredGallery extends SpzaComponent<IFilteredGalleryProps, any> {
    context: ILocParamsContext & ILocContext & IBuildHrefContext & ICommonContext;
    filteredApps: IAppDataItem[] = [];
    filteredPartners: IPartnerDataItem[] = [];
    galleryPage: number = 0;
    maxPages: number = 0;
    segueMode: Constants.SegueMode;
    segueHeaders: SegueHeaders = null;

    constructor(props: IFilteredGalleryProps, context: ILocParamsContext & ILocContext & ICommonContext) {
        super(props, context);
    }

    componentWillMount() {
        this.props.ensureAppData();
        this.props.ensurePartnerData();
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        this.props.galleryPageMode === Constants.GalleryPageMode.Apps ?
            document.getElementsByTagName('title')[0].innerHTML = getFilteredAppPageTitle(this.context) :
            document.getElementsByTagName('title')[0].innerHTML = this.context.loc('filteredPartner_pageTitle', 'Partner results – Microsoft AppSource');
    }

    setPageSize() {
        this.filteredApps = [];
        this.filteredPartners = [];

        this.galleryPage = this.props.galleryPage ? this.props.galleryPage : 1;
        // todo: validate rendering second page of tiles and validate props being passed into pagination control
        let pageSize = this.props.pageSize ? this.props.pageSize : defaultPageSize;
        let startIndex = (this.galleryPage - 1) * pageSize;
        let endIndex = startIndex + pageSize;
        if (this.props.galleryPageMode === Constants.GalleryPageMode.Apps) {
            this.setMaxPages(this.props.filteredApps.length, pageSize);
            this.filteredApps = this.props.filteredApps.slice(startIndex, endIndex);
        } else {
            this.setMaxPages(this.props.filteredPartners.length, pageSize);
            this.filteredPartners = this.props.filteredPartners.slice(startIndex, endIndex);
        }
    }

    setMaxPages(itemCount: number, pageSize: number) {
        this.maxPages = Math.ceil(itemCount / pageSize);
        if (this.galleryPage > this.maxPages) {
            this.galleryPage = this.maxPages;
        }
    }

    getTiles() {
        return (
            <div className='spza_filteredTileContainer'>
                {
                    this.props.galleryPageMode === Constants.GalleryPageMode.Apps
                        ? this.filteredApps.map((app: any, index: number) => {
                            return <AppTile {...app} key={app.appid} tileIndex={index} />;
                        })
                        : this.filteredPartners.map((partner: any, index: number) => {
                            return <PartnerTile {...partner} key={partner.partnerId} tileIndex={index} />;
                        })
                }
            </div>
        );
    }

    logNoContentTelemetry(link: string, linkType: string) {
        const details = {
            linkType: linkType,
            link: link,
            tab: 'Default'
        };
        const payload: ITelemetryData = {
            page: 'In App Gallery(' + this.props.embedHost + ')',
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Link,
            details: JSON.stringify(details)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    getNoContentUI() {
        if (this.props.embedHost === ProductEnum['power-bi']) {
            return (
                <div className='noOrgContent'>
                    <div>{this.context.loc('Embedded_No_MyOrg_Content_PowerBI')}</div>
                    <div className='powerAppsCreate'
                        dangerouslySetInnerHTML={{
                            __html: this.context.locParams('Embedded_PowerBI_Create_Link',
                                ['<a href="https://powerbi.microsoft.com/en-us/documentation/powerbi-service-organizational-content-pack-tutorial-create-and-publish/" target="_blank">'
                                    + this.context.loc('Embedded_PowerBI_Create_Link_Learn_Link_Text')
                                    + '</a>'])
                        }}
                        onClick={() => {
                            this.logNoContentTelemetry('https://powerbi.microsoft.com/en-us/documentation/powerbi-service-organizational-content-pack-tutorial-create-and-publish/',
                                'pbi_CreateContentPacks');
                        }}>
                    </div>
                </div>
            );
        } else {
            let publicGalleryUri = this.context.buildHref(routes.marketplace, null, {
                showPrivateApps: 'false',
                page: '1'
            });

            return (
                <div className='noOrgContent'>
                    <div>{this.context.loc('Embedded_No_MyOrg_Content')}</div>
                    <div className='actions'>
                        <div className='action createApps' onClick={() => {
                            urlPush(publicGalleryUri);
                        }}>
                            <div className='title'>{this.context.loc('Embedded_No_MyOrg_Content_Action1_Title')}</div>
                            <img src='/images/createApps.png' />
                            <div className='bottom c-glyph'>{this.context.loc('Embedded_No_MyOrg_Content_Action1_Bottom')}</div>
                        </div>
                        <a className='action powerApps' href='https://web.powerapps.com/' rel='noreferrer' target='_blank'
                            onClick={() => {
                                this.logNoContentTelemetry('https://web.powerapps.com/', 'powerApps_Create');
                            }}>
                            <div className='title'>{this.context.loc('Embedded_No_MyOrg_Content_Action2_Title')}</div>
                            <img src='/images/powerApps.png' />
                            <div className='bottom c-glyph'>{getPowerAppsTitle()}</div>
                        </a>
                    </div>
                </div>
            );
        }
    }

    renderImpl() {
        this.setPageSize();

        if (this.props.isEmbedded
            && shouldShowPowerAppsNoContent(this.props.embedHost)
            && this.props.showPrivateApps
            && this.filteredApps.length === 0) {
            let context = this.context;

            if (this.props.partnerAppDataLoaded) {
                return (
                    <div className='filteredGalleryContainer'>
                        {this.getNoContentUI()}
                    </div>
                );
            } else {
                return (
                    <div className='filteredGalleryContainer'>
                        <div className='loader'>
                            <Animation />
                            <div className='text'>{context.loc('Loading')}</div>
                        </div>
                    </div>
                );
            }
        }

        if (this.props.isEmbedded && this.filteredApps.length === 0) {
            return (
                <div className='filteredGalleryContainer'>
                    <div className='spza_filteredTileContainer'>{this.context.loc('APPS_NoResultsFound', 'No results found')}</div>
                </div>
            );
        }

        if ((this.filteredPartners.length === 0 && this.props.galleryPageMode === Constants.GalleryPageMode.Partners)
            || (this.filteredApps.length === 0 && this.props.galleryPageMode === Constants.GalleryPageMode.Apps)) {
            return null;
        }

        // DOES SPZA_CONTROLS DIV NEED TO BE HERE?
        return (
            <div className='filteredGalleryContainer'>
                {
                    this.getTiles()
                }
                <PaginationControl galleryPage={this.galleryPage} maxPages={this.maxPages} galleryPageMode={this.props.galleryPageMode} />
            </div>
        );
    }
}

(FilteredGallery as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
