import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, ITelemetryData, IPartnerDataItem, PricingStates, IStartingPrice } from './../Models';
import { urlPush, urlReplace, routes } from '../routerHistory';
import { getTelemetryAppData, isMSASupported } from '../utils/appUtils';
import { DataMap, ProductEnum, ProductIgnoreList } from '../utils/dataMapping';
import { postMessageToHost } from '../../embed/embedMessaging';
import { InternalLink } from './internalLink';
import { constants } from '../../embed/constants';
import { Constants } from '../utils/constants';
import { NpsModule } from '../utils/npsUtils';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import {
    IBuildHrefContext, ILocContext, ILocParamsContext, ILocDateStringContext, ICTACallbackContext,
    IContactCallbackContext, ICommonContext, IOpenTileCallbackContext
} from '../interfaces/context';
import { getWindow } from '../services/window';
import { PartnerTile } from './partnerTile';
import { RatingsControl } from './ratingsControl';
import Overview from '../containers/overview';
import { CrossListings } from './crossListings';
import * as DetailUtils from '../utils/detailUtils';
import { Tab, Tabs } from './tabs';
import { getPriceString } from '../utils/pricing';
import { TelemetryImage } from './telemetryImage';

export interface IAppDetailsProps {
    app?: IAppDataItem; // For PowerBI Embedded - this could be null for the first load
    startingPrice?: IStartingPrice;
    location: any;
    breadcrumbUrl: string;
    defaultTab: string;
    embedHost: number;
    nationalCloud: string;
    isEmbedded: boolean;
    billingCountryCode: string;
    openRatingModal: (app: IAppDataItem, accessKey: string, ctaType: string, callback: any) => void;
    fetchAppDetails(targetApp: IAppDataItem): Promise<any>;
}

export class AppDetails extends SpzaComponent<IAppDetailsProps, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ILocDateStringContext & ICTACallbackContext & IContactCallbackContext & ICommonContext & IOpenTileCallbackContext;

    private instrument = SpzaInstrumentService.getProvider();
    private isProductIgnored: boolean = false;

    constructor(props: IAppDetailsProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICommonContext &
        ILocDateStringContext & ICTACallbackContext & IContactCallbackContext & IOpenTileCallbackContext) {
        super(props, context);
        this.setConditionals(props);
    }

    buildGalleryLink() {
        if (this.props.isEmbedded) {
            return (
                // todo: need to figure out how to link on server. Need a Link component
                <InternalLink href={this.props.breadcrumbUrl}
                    role='button'
                    className='embedBreadcrumbButton'
                    additionalCommand={() => {
                        DetailUtils.generateBreadcrumbPayloadAndLogTelemetry('Apps');
                    }}>
                    <span className='c-glyph'></span>
                    {this.context.loc('Embedded_Apps')}
                </InternalLink>
            );
        } else {
            return (
                <InternalLink href={this.props.breadcrumbUrl}
                    role='button'
                    className='c-button goBackButton'
                    additionalCommand={() => {
                        DetailUtils.generateBreadcrumbPayloadAndLogTelemetry('Apps');
                    }}>
                    {this.context.loc('Embedded_Apps')}
                </InternalLink>
            );
        }
    }

    buildFilterElements(filterItem: string, filterTileTypes: string) {
        return Object.keys(DataMap[filterItem]).map((value) => {
            if (this.props.app
                && !DataMap[filterItem][value].ShortcutFilters
                && (this.props.app[filterItem] & DataMap[filterItem][value].FilterID)) {
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
                pathParams[filterTileTypes] = filter.ShortcutUrlKey;

                let newPath = this.context.buildHref(routes.marketplace, null, pathParams);

                if (this.props.nationalCloud) {
                    return (
                        <div key={filter.FilterID} >
                            {this.context.loc(filter.LocKey, filter.LongTitle)}
                        </div>);

                } else {
                    return (
                        // todo: need to figure out how to link on server. Need a Link component
                        <div className='detailsCategories'
                            onClick={() => {
                                DetailUtils.generateLinkPayloadAndLogTelemetry(DetailUtils.OwnerType.App, this.props.app.appid, filterItem, newPath, 'Default');
                                // The embedded app needs to open these links in a new window
                                if (this.props.isEmbedded) {
                                    getWindow().open(newPath);
                                } else {
                                    urlPush(newPath);
                                    window.scrollTo(0, 0);
                                }
                            }}
                            key={filter.FilterID}
                            tabIndex={0}>
                            {this.context.loc(filter.LocKey, filter.LongTitle)}
                        </div>
                    );
                }
            }
        });
    }

    // calculates the value for some of our helper booleans
    setConditionals(currentProps: IAppDetailsProps) {
        this.isProductIgnored = currentProps.app && currentProps.app.primaryProduct ? ProductIgnoreList[ProductEnum[currentProps.app.primaryProduct]] : false;
    }

    showDialog(ctaType: number) {
        this.context.ctaCallback(this.props.app, ctaType);
    }

    // invoked once, both on client and server, immediately before rendering
    componentWillMount() {
        // Safety check for this.props.app before trying to reference parts of that object below
        // Also, for powerBI embedded, app will be null on the initial render and wll end up
        // being passed in during a later update
        if (this.props.app) {
            // 1. trigger server call to fill in details
            // 2. select an image or video as default

            // well, we got passed an app without detail information, lets trigger that
            if (!this.props.app.detailInformation && !this.props.app.detailLoadFailed) {
                this.props.fetchAppDetails(this.props.app);
            }

            // let nps know
            NpsModule.IncreaseAppDetail();
        }
    }

    // invoked when receiving new props, not on first render
    componentWillReceiveProps(nextProps: IAppDetailsProps, nextState: any) {
        // each time that properties change, we need to recalculate our conditionals
        this.setConditionals(nextProps);

        if (nextProps.app && !nextProps.app.detailInformation && !nextProps.app.detailLoadFailed) {
            // just like in componentWillMount, we need to check.
            // the scenario is that you land on this component while you were already on this component, but used
            // search to search for a new app.
            this.props.fetchAppDetails(nextProps.app);

            // Set page title
            this.setPageTitle(nextProps.app.title);

            // workaround for a bug that everytime you type in searchbox we will receive new props
            if (this.props.app && this.props.app.appid && !nextProps.app.appid && (this.props.app.appid !== nextProps.app.appid)) {
                // let nps know
                NpsModule.IncreaseAppDetail();
            }
        }

        if (nextProps.billingCountryCode && nextProps.billingCountryCode !== this.props.billingCountryCode) {
            this.props.fetchAppDetails(nextProps.app);
        }
    }

    // invoked once, only on the client, after initial render
    // If the app detail page loads in the embeddded app, send a notification to the host
    componentDidMount() {
        if (this.props.app) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.PageLoad,
                actionModifier: Constants.Telemetry.ActionModifier.End,
                appName: this.props.app.appid,
                details: getTelemetryAppData(this.props.app, this.props.nationalCloud ? true : false)
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
            this.setPageTitle(this.props.app.title);
        }

        if (!this.props.app || !this.props.isEmbedded) {
            if (this.props.location && this.props.location.query && this.props.location.query.survey) {
                let accessKey = (this.props.location.query && this.props.location.query.survey) ? this.props.location.query.survey : null;
                accessKey = (accessKey === 'user') ? null : accessKey;
                let ctaType: string = null;
                if (this.props.location.query.ctatype) {
                    ctaType = this.props.location.query.ctatype;
                }
                this.props.openRatingModal(this.props.app, accessKey, ctaType, (result: any) => { return; });
            };
            return;
        };

        postMessageToHost({
            msgType: constants.actionTypes.updateUrl,
            data: {
                applicationId: this.props.app.appid,
                category: this.props.app.privateApp ? 'private' : 'public'
            }
        });
    }

    getOfficeWorksWithList(property: string) {
        let list = DetailUtils.getDetailArrayItem(this.props.app, property);

        if (list && list.length > 0) {
            return list.map((item: any, index: number) => {
                const value = Constants.Office365Mapping[item];

                // value will be of the form
                // [actualName]
                // [localizationResource, param1, ...] or
                if (value) {
                    if (value.length === 1) {
                        return (<span key={value[0]}>{value[0]}</span>);
                    } else {
                        const localizedValue = this.context.locParams(value[0], [value[1]]);
                        return (<span key={localizedValue}>{localizedValue}</span>);
                    }
                } else {
                    return (<span key={item}>{item}</span>);
                }


            });
        } else {
            return null;
        }
    }

    getBreadcrumbElement() {
        return (
            <div>
                {
                    this.props.isEmbedded ? (
                        <div className='embedDetailPageHeaderBar'>
                            {this.buildGalleryLink()}
                        </div>
                    ) : (
                            <div className='navigationBar' id='maincontent'>
                                <ul className='breadcrumb'>
                                    {this.buildGalleryLink()}
                                    <span className='c-glyph'></span>
                                    <header className='appTabButton'>{this.props.app.title}</header>
                                </ul>
                            </div>
                        )
                }
            </div>
        );
    }

    getIconElement() {
        let iconUri = DetailUtils.getDetailInformation(this.props.app, 'LargeIconUri');
        if (!iconUri) {
            return (
                <div className='iconHost'></div>
            );
        }

        let iconBackgroundColor = DetailUtils.getDetailInformation(this.props.app, 'IconBackgroundColor');
        if (!iconBackgroundColor) {
            iconBackgroundColor = this.props.app.iconBackgroundColor;
        }

        return (
            <div className='iconHost' style={{ backgroundColor: iconBackgroundColor }} >
                <span className='thumbnailSpacer'></span>
                <TelemetryImage src={iconUri} className='appLargeIcon' />
            </div>
        );
    }

    getCTAElement() {
        return (
            <button name='button' className='requestButton c-button' type='submit' onClick={() => this.showDialog(Constants.CTAType.Create)}>
                {this.context.loc(this.props.app.actionString)}
            </button>
        );
    }

     getTestDriveButton() {
        if (this.props.app.testDriveType) {
            let duration = 0;
            let locKey = '';
            if (this.props.app.detailInformation && this.props.app.detailInformation.TestDriveDetails && this.props.app.detailInformation.TestDriveDetails.duration) {
                let time = this.props.app.detailInformation.TestDriveDetails.duration.split(':');
                if (time && time.length > 0) {
                    duration = parseInt(time[0], 10);
                }
            }
            locKey = duration && duration === 1 ? 'AppDetails_TestDriveDurationHour' : 'AppDetails_TestDriveDurationHours';
            return (
                <div>
                    <button name='button' className='requestButton c-button' type='submit' onClick={() => this.showDialog(Constants.CTAType.TestDrive)}>
                        {this.context.loc('TestDrive_Dialog', 'Test drive').toLowerCase().toUpperCase()}
                    </button>
                    {
                        this.getDetailHyperlinkElement(Constants.testDriveDocumentationLink,
                            'testDriveLink', this.context.loc('TestDrive_Help'))
                    }
                    {
                        this.props.app.testDriveType !== Constants.TestDriveType.Showcase && duration && locKey ?
                            this.getDetailCellElement(this.context.locParams(locKey, [duration.toString()]),
                                this.context.loc('AppDetails_TestDriveDurationTitle')) : null
                    }
                </div>
            );
        }
    }

    getTitleElement() {
        return (
            <div className='appDetailHeader'>
                <h4 className='c-heading-4 titleHeader'>{this.props.app.title}</h4>
                <h5 className='c-heading-5 titleSubHeader'>{this.props.app.publisher}</h5>
            </div>
        );
    }

    renderRatings() {
        let avgRating = DetailUtils.getDetailInformation(this.props.app, 'AverageRating');
        let ratingsCount = DetailUtils.getDetailInformation(this.props.app, 'NumberOfRatings');

        // We show ratings only when the apps have more than 5 ratings
        if (ratingsCount >= 5) {
            return (
                <div className='cell'>
                    <div className='detailsRating'>
                        <RatingsControl avgRating={avgRating} />
                    </div>
                    <div className='ratingsCount'> ({ratingsCount})</div>
                </div>
            );
        } else {
            return null;
        }
    }

    handleSeeAllCallback() {
        window.scrollTo(0, 0);
        this.changeTabCallback('Partners');
    }

    getChildContext() {
        return {
            contactCallback: (partner: IPartnerDataItem) => {
                let detailsPaylod: any = {
                    appId: this.props.app.appid
                };
                let payload: ITelemetryData = {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Click,
                    actionModifier: Constants.Telemetry.ActionModifier.CrossListingContact,
                    partnerUrl: partner.friendlyURL,
                    details: JSON.stringify(detailsPaylod)
                };
                this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
                this.context.contactCallback(partner, this.props.app);
            },
            openTileCallback: (detailUrl: string) => {
                let detailsPaylod: any = {
                    linkType: 'Partners',
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

    getDetailCellElement(information: any, headerContent: string) {
        if (information) {
            return <div className='cell'>
                <header>{headerContent}</header>
                <span>{information}</span>
            </div>;
        } else {
            return null;
        }
    }

    getDetailHyperlinkElement(information: any, id: string, locString: string) {
        if (information) {
            return <a className='c-hyperlink' rel='noreferrer' target='_blank'
                href={information}
                onClick={() => {
                    DetailUtils.generateLinkPayloadAndLogTelemetry(DetailUtils.OwnerType.App, this.props.app.appid,
                        id, information, 'Default');
                }}>
                {locString}
            </a>;
        } else {
            return null;
        }
    }

    changeTabCallback(tabTitle: string) {
        let newPath = this.getTabHref(tabTitle);

        urlReplace(newPath);
    }

    getTabHref(tabTitle: string) {
        let productString = ProductEnum[this.props.app.primaryProduct];
        let productData = DataMap.products[productString];
        let product = productData ? productData.UrlKey : productString;

        return this.context.buildHref(routes.appDetails, { productId: product, appid: this.props.app.appid }, { 'tab': tabTitle });
    }

    setPageTitle(title: string) {
        document.getElementsByTagName('title')[0].innerHTML = this.context.locParams('detail_pageTitle', [title]);
    }

    getStartingPriceElement() {
        const startingPrice = this.props.startingPrice;

        if (startingPrice && startingPrice.pricingData) {
            if (startingPrice.pricingData !== PricingStates.NoPricingData &&
                startingPrice.pricingData !== PricingStates.NotAvailableInThisRegion &&
                startingPrice.pricingData !== PricingStates.AlwaysAvailable &&
                startingPrice.pricingData !== PricingStates.Loading) {
                return (
                    <div className='cell'>
                        <header>{this.context.loc('Pricing')}</header>
                        <div className='pricingText'>
                            {
                                startingPrice.pricingData === PricingStates.FreeApp ?
                                    this.context.loc('Pricing_Free') :
                                    startingPrice.pricingData === PricingStates.AdditionalPurchasesRequired ?
                                        this.context.loc('AdditionalPurchaseMayBeRequired') :
                                        typeof startingPrice.pricingData === 'object' ?
                                            <div>
                                                {getPriceString(
                                                    this.context,
                                                    startingPrice.pricingData,
                                                    this.props.billingCountryCode,
                                                    startingPrice.pricingData.currency,
                                                    3)}
                                            </div> : null
                            }
                        </div>
                        {
                            typeof startingPrice.pricingData === 'object' ?
                                < span > {this.context.loc('SiteLicenseAlsoAvailable')}</span> : null
                        }
                    </div>
                );
            }
        }

        return null;
    }

    renderImpl() {
        if (this.props.app) {
            return (
                <div className='spza_detailContainer spza_partnerDetailContainer' >
                    <a href='#maincontent' className='spza_defaultText' tabIndex={1}>{this.context.loc('skipLink_text', 'Skip to main content')}</a>
                    {this.getBreadcrumbElement()}
                    <div className='detailContent'>
                        <div className='metadata'>
                            {this.getIconElement()}
                            {this.getCTAElement()}
                            {this.getTestDriveButton()}
                            <div className='metaDetails'>
                                {
                                    DetailUtils.getDetailInformation(this.props.app, 'AverageRating') ? this.renderRatings() : null
                                }
                                {
                                    this.getStartingPriceElement()
                                }
                                {
                                    !this.isProductIgnored && this.props.app.products > 0 ?
                                        <div className='cell'>
                                            <header>{this.context.loc('FilterType_Products')}</header>
                                            {this.buildFilterElements(Constants.filterMaps.products, Constants.filterTileTypes.product)}
                                        </div> : null
                                }
                                {
                                    this.getDetailCellElement(this.props.app.publisher,
                                        this.context.loc('App_Publisher'))
                                }
                                <div className='cell'>
                                    <header>{this.context.loc('Accounts_Supported')}</header>
                                    <span>{this.context.loc('SignInModal_AccountType2')}</span>
                                    {
                                        isMSASupported(this.props.app.products) ?
                                            <span>{this.context.loc('Microsoft_Account')}</span> : null
                                    }
                                </div>
                                {
                                    this.getDetailCellElement(DetailUtils.getDetailInformation(this.props.app, 'AppVersion'),
                                        this.context.loc('App_Version'))
                                }
                                {
                                    this.getDetailCellElement(this.context.locDateString(DetailUtils.getDetailInformation(this.props.app, 'ReleaseDate')),
                                        this.context.loc('App_Updated'))
                                }
                                {
                                    this.props.app.categories > 0 ?
                                        <div className='cell'>
                                            <header>{this.context.loc('App_Categories')}</header>
                                            {this.buildFilterElements(Constants.filterMaps.categories, Constants.filterTileTypes.category)}
                                        </div> : null
                                }
                                {
                                    DetailUtils.getDetailArrayItem(this.props.app, 'WorksWith') ?
                                        <div className='cell productsSupported'>
                                            <header>{this.context.loc('App_WorksWith')}</header>
                                            {
                                                this.getOfficeWorksWithList('WorksWith')
                                            }
                                        </div> : null
                                }
                                {
                                    DetailUtils.getDetailInformation(this.props.app, 'SupportLink') || DetailUtils.getDetailInformation(this.props.app, 'HelpLink') ?
                                        <div className='cell'>
                                            <header>{this.context.loc('App_Support')}</header>
                                            {
                                                this.getDetailHyperlinkElement(DetailUtils.getDetailInformation(this.props.app, 'SupportLink'),
                                                    'SupportLink', this.context.loc('App_Support'))
                                            }
                                            {
                                                this.getDetailHyperlinkElement(DetailUtils.getDetailInformation(this.props.app, 'HelpLink'),
                                                    'HelpLink', this.context.loc('App_Help'))
                                            }
                                        </div> : null
                                }
                                {
                                    DetailUtils.getDetailInformation(this.props.app, 'PrivacyPolicyUrl') || this.props.app.licenseTermsUrl ?
                                        <div className='cell'>
                                            <header>{this.context.loc('App_Legal')}</header>
                                            {
                                                this.getDetailHyperlinkElement(this.props.app.licenseTermsUrl,
                                                    'LicenseAgreement', this.context.loc('App_LicenseAgreement'))
                                            }
                                            {
                                                this.getDetailHyperlinkElement(DetailUtils.getDetailInformation(this.props.app, 'PrivacyPolicyUrl'),
                                                    'PrivacyPolicyUrl', this.context.loc('App_PrivacyPolicy'))
                                            }

                                        </div> : null
                                }
                            </div>
                        </div>
                        <div className='content'>
                            {this.getTitleElement()}
                            {
                                this.props.app.detailInformation ?
                                    ((!this.props.isEmbedded &&
                                        this.props.app.detailInformation.CertifiedPartners &&
                                        this.props.app.detailInformation.CertifiedPartners.length > 0) ?
                                        <Tabs defaultTab={this.props.defaultTab}
                                            ownerType={DetailUtils.OwnerType.App}
                                            ownerId={this.props.app.appid}
                                            changeTabCallback={this.changeTabCallback.bind(this)}
                                            getTabHref={this.getTabHref.bind(this)}>
                                            <Tab title={this.context.loc('PartnerDetail_OverviewTab', 'Overview')} name='Overview'>
                                                <Overview ownerType={DetailUtils.OwnerType.App}
                                                    ownerId={this.props.app.appid}
                                                    ownerTitle={this.props.app.title}
                                                    shortDescription={this.props.app.shortDescription}
                                                    description={this.props.app.detailInformation['Description']}
                                                    images={this.props.app.detailInformation['Images']}
                                                    videos={this.props.app.detailInformation['DemoVideos']}
                                                    documents={this.props.app.detailInformation.CollateralDocuments}
                                                    capabilities={DetailUtils.getDetailArrayItem(this.props.app, 'Capabilities')}
                                                    TileType={PartnerTile}
                                                    crossListings={this.props.app.detailInformation.CertifiedPartners}
                                                    handleSeeAllCallback={this.handleSeeAllCallback.bind(this)} />
                                            </Tab>
                                            <Tab title={this.context.loc('AppDetail_PartnerTab', 'Partners')} name='Partners'>
                                                <CrossListings TileType={PartnerTile}
                                                    ownerType={DetailUtils.OwnerType.App}
                                                    ownerId={this.props.app.appid}
                                                    ownerTitle={this.props.app.title}
                                                    crossListings={this.props.app.detailInformation.CertifiedPartners} />
                                            </Tab>
                                        </Tabs> :
                                        <Overview ownerType={DetailUtils.OwnerType.App}
                                            ownerId={this.props.app.appid}
                                            ownerTitle={this.props.app.title}
                                            shortDescription={this.props.app.shortDescription}
                                            description={this.props.app.detailInformation['Description']}
                                            images={this.props.app.detailInformation['Images']}
                                            videos={this.props.app.detailInformation['DemoVideos']}
                                            documents={this.props.app.detailInformation.CollateralDocuments}
                                            capabilities={DetailUtils.getDetailArrayItem(this.props.app, 'Capabilities')}
                                            TileType={PartnerTile}
                                            crossListings={null}
                                            handleSeeAllCallback={null} />) : null
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

(AppDetails as any).contextTypes = {
    loc: React.PropTypes.func,
    locDateString: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    contactCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    openTileCallback: React.PropTypes.func
};

(AppDetails as any).childContextTypes = {
    contactCallback: React.PropTypes.func,
    openTileCallback: React.PropTypes.func
};

