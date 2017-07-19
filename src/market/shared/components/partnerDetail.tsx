import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IPartnerDataItem, IUserInfo, ITelemetryData } from './../Models';
import { getTelemetryPartnerData } from '../utils/appUtils';
import { postMessageToHost } from '../../embed/embedMessaging';
import { InternalLink } from './internalLink';
import { constants } from '../../embed/constants';
import { Constants } from '../utils/constants';
import { NpsModule } from '../utils/npsUtils';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext, IOpenTileCallbackContext } from '../interfaces/context';
import { DataMap } from '../utils/dataMapping';
import { urlPush, urlReplace, routes } from '../routerHistory';
import { getWindow } from '../services/window';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import Overview from '../containers/overview';
import { Locations } from './locations';
import { Competencies } from './competencies';
import { CrossListings } from './crossListings';
import { Tab, Tabs } from './tabs';
import * as DetailUtils from '../utils/detailUtils';

export interface IPartnerDetailsProps {
    partner?: IPartnerDataItem;
    userInfo: IUserInfo;
    breadcrumbUrl: string;
    defaultTab: string;
    openContactModal: (partnerId: string, callback?: any) => void;
    openModal: (modalId: number) => void;
    fetchPartnerDetails(targetPartner: IPartnerDataItem): Promise<any>;
}

export class PartnerDetail extends SpzaComponent<IPartnerDetailsProps, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext & IOpenTileCallbackContext;

    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: IPartnerDetailsProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext & IOpenTileCallbackContext) {
        super(props, context);
    }

    openContact() {
        DetailUtils.generateClickPayloadAndLogTelemetry(DetailUtils.OwnerType.Partner, this.props.partner.partnerId,
            Constants.Telemetry.ActionModifier.ContactModal, getTelemetryPartnerData(this.props.partner));

        this.props.openContactModal(this.props.partner.partnerId);
    }

    buildGalleryLink() {
        return (
            <InternalLink href={this.props.breadcrumbUrl}
                role='button'
                className='c-button goBackButton'
                onClick={() => {
                    DetailUtils.generateBreadcrumbPayloadAndLogTelemetry('Partners');
                    urlPush(this.props.breadcrumbUrl, true);
                }}>
                {this.context.loc('Partner_BackButton', 'Partners')}
            </InternalLink>
        );
    }

    buildCompetencyList() {
        let competencies = DetailUtils.getDetailInformation(this.props.partner, 'Competencies');
        let goldList = competencies && competencies.length > 0 ? competencies[0]['Names'] : [];
        let silverList = competencies && competencies.length > 1 ? competencies[1]['Names'] : [];
        let maxCompetencies = 3;

        goldList = goldList.map((e: string) => { return competencies[0]['Type'] + ' ' + e; });
        silverList = silverList.map((e: string) => { return competencies[1]['Type'] + ' ' + e; });
        let list = goldList.concat(silverList);

        let listElement = DetailUtils.getListElements(list, maxCompetencies);

        if (list.length > maxCompetencies) {
            listElement.push(
                <div className='moreData' onClick={() => this.changeTabCallback('Competencies')}>{this.context.loc('App_More')}...</div>
            );
        }

        return listElement;
    }

    buildFilterElements(filterItem: string, filterTileTypes: string) {
        let filterRender: JSX.Element[] = [];
        Object.keys(DataMap[filterItem]).map((value) => {
            if (this.props.partner
                && !DataMap[filterItem][value].ShortcutFilters
                && (this.props.partner[filterItem] & DataMap[filterItem][value].FilterID)) {
                let filter = DataMap[filterItem][value];
                if (!filter) {
                    return null;
                }

                let pathParams: any = {
                    industry: null,
                    category: null,
                    product: null,
                    search: null
                };
                pathParams[filterTileTypes] = filter.UrlKey;

                let newPath = this.context.buildHref(routes.marketplacePartners, null, pathParams);

                filterRender.push(
                    <a className='c-hyperlink filterItem' onClick={() => {
                        DetailUtils.generateLinkPayloadAndLogTelemetry(DetailUtils.OwnerType.Partner, this.props.partner.partnerId, filterItem, newPath, 'Default');
                        urlPush(newPath, true);
                    }}
                        key={filter.FilterID} >
                        {this.context.loc(filter.LocKey, filter.LongTitle)}
                    </a>
                );
            }
        });
        return filterRender;
    }

    showDialog() {
        this.context.ctaCallback(this.props.partner);
    }

    // invoked once, both on client and server, immediately before rendering
    componentWillMount() {
        // Safety check for this.props.partner before trying to reference parts of that object below
        // Also, for powerBI embedded, partner will be null on the initial render and wll end up
        // being passed in during a later update
        if (this.props.partner) {
            // 1. trigger server call to fill in details
            // 2. select an image or video as default

            // well, we got passed an partner without detail information, lets trigger that
            if (!this.props.partner.detailInformation && !this.props.partner.detailLoadFailed) {
                this.props.fetchPartnerDetails(this.props.partner);
            }

            // let nps know
            NpsModule.IncreaseAppDetail();
        }
    }

    // invoked when receiving new props, not on first render
    componentWillReceiveProps(nextProps: IPartnerDetailsProps, nextState: any) {
        if (nextProps.partner && !nextProps.partner.detailInformation && !nextProps.partner.detailLoadFailed) {
            // just like in componentWillMount, we need to check.
            // the scenario is that you land on this component while you were already on this component, but used
            // search to search for a new app.
            this.props.fetchPartnerDetails(nextProps.partner);

            // workaround for a bug that everytime you type in searchbox we will receive new props
            if (this.props.partner && this.props.partner.partnerId && !nextProps.partner.partnerId && (this.props.partner.partnerId !== nextProps.partner.partnerId)) {
                // let nps know
                NpsModule.IncreaseAppDetail();
            }
        }
    }

    // invoked once, only on the client, after initial render
    // If the partner detail page loads in the embeddded app, send a notification to the host
    componentDidMount() {
        if (this.props.partner) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.PageLoad,
                actionModifier: Constants.Telemetry.ActionModifier.End,
                partnerId: this.props.partner.partnerId,
                details: getTelemetryPartnerData(this.props.partner)
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
            document.getElementsByTagName('title')[0].innerHTML = this.context.locParams('detail_pageTitle', [this.props.partner.title]);
        }

        if (!this.props.partner) {
            return;
        }

        postMessageToHost({
            msgType: constants.actionTypes.updateUrl,
            data: {
                applicationId: this.props.partner.partnerId
            }
        });
    }

    getBreadcrumbElement() {
        return (
            <div className='navigationBar' id='maincontent'>
                <ul className='breadcrumb'>
                    {this.buildGalleryLink()}
                    <span className='c-glyph'></span>
                    <header className='appTabButton'>{this.props.partner.title}</header>
                </ul>
            </div>
        );
    }

    getIconElement() {
        let iconUri = DetailUtils.getDetailInformation(this.props.partner, 'LargeIconUri');
        if (!iconUri) {
            return (
                <div className='iconHost'></div>
            );
        }
        return (
            <div className='iconHost'>
                <span className='thumbnailSpacer'></span>
                <img className='appLargeIcon' src={iconUri} />
            </div>
        );
    }

    getCTAElement() {
        return (
            <button name='button' className='requestButton c-button' type='submit' onClick={this.openContact.bind(this)}>
                {this.context.loc('PartnerDetail_ContactPartner', 'CONTACT PARTNER')}
            </button>
        );
    }

    getTitleElement() {
        return (
            <div className='appDetailHeader partnerDetailHeader'>
                <h4 className='c-heading-4 titleHeader'>{this.props.partner.title}</h4>
                <h6 className='c-heading-6 tagline'>{this.props.partner.tagline}</h6>
            </div>
        );
    }

    getAddressElement() {
        let address = DetailUtils.getDetailInformation(this.props.partner, 'HQAddress');

        if (address) {
            let addressRender: JSX.Element[] = [];
            addressRender.push(
                <div>
                    <div className='leftSideItem'>{address.line1}</div>
                    <div className='leftSideItem'>{address.city}, {address.state}</div>
                    <div className='leftSideItem'>{address.postal}</div>
                </div>
            );
            return addressRender;
        } else {
            return null;
        }
    }

    getOtherLocationsElement() {
        let otherLocations = DetailUtils.getDetailInformation(this.props.partner, 'OtherLocations');
        if (otherLocations && otherLocations.length > 1) {
            return (
                <div className='moreData' onClick={() => this.changeTabCallback('Locations')}>
                    {otherLocations.length - 1} {this.context.loc('PartnerDetail_moreLocations', 'other locations')}...
                </div>
            );
        } else {
            return null;
        }
    }

    getWebsiteElement() {
        let website = DetailUtils.getDetailInformation(this.props.partner, 'Website');

        if (website) {
            return (
                <a className='c-hyperlink' href={website} onClick={() => {
                    DetailUtils.generateLinkPayloadAndLogTelemetry(DetailUtils.OwnerType.Partner, this.props.partner.partnerId, 'Website', website, 'Default');
                }}>{website}</a>
            );
        } else {
            return null;
        }
    }

    handleSeeAllCallback() {
        window.scrollTo(0, 0);
        this.changeTabCallback('Apps');
    }

    getTabRouteParams() {
        return {
            partnerId: this.props.partner.partnerId
        };
    }

    changeTabCallback(tabTitle: string) {
        let newPath = this.getTabHref(tabTitle);

        urlReplace(newPath);
    }

    getTabHref(tabTitle: string): string {
        return this.context.buildHref(routes.partnerDetail, this.getTabRouteParams(), { 'tab': tabTitle });
    }

    getChildContext() {
        return {
            openTileCallback: (detailUrl: string) => {
                let detailsPaylod: any = {
                    linkType: 'App',
                    link: detailUrl
                };
                let payload: ITelemetryData = {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Click,
                    actionModifier: Constants.Telemetry.ActionModifier.Tile,
                    details: JSON.stringify(detailsPaylod)
                };
                this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
                this.context.openTileCallback(detailUrl);
            }
        };
    }

    renderImpl() {
        if (this.props.partner) {
            return (
                <div className='spza_detailContainer spza_partnerDetailContainer'>
                    <a href='#maincontent' className='spza_defaultText' tabIndex={1}>{this.context.loc('skipLink_text', 'Skip to main content')}</a>
                    {this.getBreadcrumbElement()}
                    <div className='detailContent'>
                        <div className='metadata'>
                            {this.getIconElement()}
                            {this.getCTAElement()}
                            <div className='metaDetails'>
                                {
                                    this.props.partner.products > 0 ?
                                        <div className='cell'>
                                            <header>{this.context.loc('FilterType_Products')}</header>
                                            {
                                                this.buildFilterElements(Constants.filterMaps.products, Constants.filterTileTypes.product)
                                            }
                                        </div> : null
                                }
                                {
                                    DetailUtils.getDetailArrayItem(this.props.partner, 'Competencies') ?
                                        <div className='cell'>
                                            <header>{this.context.loc('PartnerDetail_CompetencyTab', 'Competencies')}</header>
                                            {this.buildCompetencyList()}
                                        </div> : null
                                }
                                <div className='cell'>
                                    <header>{this.context.loc('PartnerDetail_headquarter', 'Headquarter')}</header>
                                    {
                                        this.getWebsiteElement()
                                    }
                                    {
                                        DetailUtils.getDetailInformationAsDivElement(this.props.partner, 'Phone')
                                    }
                                    {
                                        DetailUtils.getDetailInformationAsDivElement(this.props.partner, 'Email')
                                    }
                                    {
                                        this.getAddressElement()
                                    }
                                    {
                                        this.getOtherLocationsElement()
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='content'>
                            {this.getTitleElement()}
                            {
                                this.props.partner.detailInformation ?
                                    <Tabs defaultTab={this.props.defaultTab}
                                        ownerType={DetailUtils.OwnerType.Partner}
                                        ownerId={this.props.partner.partnerId}
                                        changeTabCallback={this.changeTabCallback.bind(this)}
                                        getTabHref={this.getTabHref.bind(this)}>
                                        <Tab title={this.context.loc('PartnerDetail_OverviewTab', 'Overview')} name='Overview'>
                                            <Overview ownerType={DetailUtils.OwnerType.Partner}
                                                ownerId={this.props.partner.partnerId}
                                                ownerTitle={this.props.partner.title}
                                                shortDescription={this.props.partner.detailInformation['ShortDescription']}
                                                description={this.props.partner.detailInformation['Description']}
                                                images={this.props.partner.detailInformation['Images']}
                                                videos={this.props.partner.detailInformation['DemoVideos']}
                                                documents={this.props.partner.detailInformation.CollateralDocuments}
                                                TileType={AppTile}
                                                crossListings={(this.props.partner.detailInformation.ApplicationsSupported &&
                                                    this.props.partner.detailInformation.ApplicationsSupported.length > 0) ?
                                                    this.props.partner.detailInformation.ApplicationsSupported : null}
                                                handleSeeAllCallback={this.handleSeeAllCallback.bind(this)} />
                                        </Tab>
                                        <Tab title={this.context.loc('PartnerDetail_LocationTab', 'Locations')} name='Locations'>
                                            <Locations locations={this.props.partner.detailInformation['OtherLocations']} />
                                        </Tab>
                                        <Tab title={this.context.loc('PartnerDetail_CompetencyTab', 'Competencies')} name='Competencies'>
                                            <Competencies ownerType={DetailUtils.OwnerType.Partner}
                                                ownerId={this.props.partner.partnerId}
                                                competencies={this.props.partner.detailInformation['Competencies']}
                                                certifications={this.props.partner.detailInformation['Certifications']}
                                                languages={this.props.partner.detailInformation['LanguagesSupported']}
                                                industries={this.props.partner.industries}
                                                categories={this.props.partner.categories}
                                                route={routes.marketplacePartners} />
                                        </Tab>
                                        <Tab title={this.context.loc('PartnerDetail_AppsTab', 'Supported apps')} name='Apps'>
                                            {
                                                (this.props.partner.detailInformation.ApplicationsSupported && this.props.partner.detailInformation.ApplicationsSupported.length > 0) ?
                                                    <CrossListings TileType={AppTile}
                                                        ownerType={DetailUtils.OwnerType.Partner}
                                                        ownerId={this.props.partner.partnerId}
                                                        ownerTitle={this.props.partner.title}
                                                        crossListings={this.props.partner.detailInformation.ApplicationsSupported} /> : null
                                            }
                                        </Tab>
                                    </Tabs> : null
                            }
                        </div>
                    </div>
                </div>
            );
        } else {
            // there is no app
            return <div className='nullAppContainer'>{this.context.loc('APPDETAIL_AppNotFound', 'App not Found')}</div>;
        }
    }
}

(PartnerDetail as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    openTileCallback: React.PropTypes.func
};

(PartnerDetail as any).childContextTypes = {
    openTileCallback: React.PropTypes.func
};

