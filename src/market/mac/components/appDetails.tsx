import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { IAppDataItem, IFirstPartyPricing, ISimpleSKU } from '../Models';
import { ITelemetryData, IPartnerDataItem, PricingStates } from '../../shared/Models';
import { urlPush, urlReplace } from '../../shared/routerHistory';
import { getTelemetryAppData } from '../../shared/utils/appUtils';
import { ProductEnum, ProductIgnoreList } from '../../shared/utils/dataMapping';
import { postMessageToHost } from '../../embed/embedMessaging';
import { InternalLink } from '../../shared/components/internalLink';
import { constants } from '../../embed/constants';
import { Constants } from '../../shared/utils/constants';
import { NpsModule } from '../../shared/utils/npsUtils';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ILocDateStringContext, ICTACallbackContext, IContactCallbackContext, ICommonContext } from '../../shared/interfaces/context';
import { getWindow } from '../../shared/services/window';
import { PartnerTile } from '../../shared/components/partnerTile';
import Overview from '../../shared/containers/overview';
import * as DetailUtils from '../../shared/utils/detailUtils';
import { Tab, Tabs } from '../../shared/components/tabs';
import { VMPricing } from './vmPricing';
import { SimplePlanPricing } from './simplePlanPricing';
import { PlanPricingType } from '../utils/constants';
import { getPriceString } from '../../shared/utils/pricing';
import { DataMap, CategoryIgnoreList, CategoryTargetPropertyList } from '../utils/dataMapping';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { getBillingCountryByCountryCode } from '../utils/pricing';

export interface IAppDetailsProps {
    app?: IAppDataItem; // For PowerBI Embedded - this could be null for the first load
    location: any;
    breadcrumbUrl: string;
    defaultTab: string;
    embedHost: number;
    nationalCloud: string;
    isEmbedded: boolean;
    billingCountryCode: string;
    firstPartyPricing: IFirstPartyPricing;
    openVideoModal: (appId: string, videoUrl: string, videoThumbnail: string) => void;
    openModal: (modalId: number) => void;
    openRatingModal: (app: IAppDataItem, accessKey: string, ctaType: string, callback: any) => void;
    fetchAppDetails(targetApp: IAppDataItem): Promise<any>;
    fetchPricing(appId: string): void;
}

export class AppDetails extends SpzaComponent<IAppDetailsProps, {}> {
    private static pricingTabName: string = 'PlansAndPrice';

    context: IBuildHrefContext & ILocContext & ILocParamsContext & ILocDateStringContext & ICTACallbackContext & IContactCallbackContext & ICommonContext;

    private instrument = SpzaInstrumentService.getProvider();
    private isProductIgnored: boolean = false;
    private selectedSkuId: any = null;

    constructor(props: IAppDetailsProps, context: IBuildHrefContext & ILocContext & ILocParamsContext &
        ILocDateStringContext & ICTACallbackContext & IContactCallbackContext & ICommonContext) {
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
                    {this.context.loc('AppDetail_Breadcrumb_Root')}
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
                    {this.context.loc('AppDetail_Breadcrumb_Root')}
                </InternalLink>
            );
        }
    }

    // this method is here because we are using TS 1.8. With 2.0 we will get non-nullable types and can guarantee detailinformation to be there.
    // therefore, once we move, we should attempt to get rid of these methods such that we get nice typesafety in our render method
    getDetailInformation(id: string) {
        if (this.props.app.detailInformation && this.props.app.detailInformation[id]) {
            return this.props.app.detailInformation[id];
        } else {
            return '';
        }
    }

    buildFilterElements() {
        // if the category is not found in the ignore list, proceed
        // otherwise ignore
        return Object.keys(DataMap.category).filter((key) => CategoryIgnoreList.indexOf(key) < 0).map((categoryValue) => {
            const keys = Object.keys(DataMap.category[categoryValue].subCategoryDataMapping);
            const keysLength = keys.length;

            for (let i = 0; i < keysLength; i++) {
                const subCategoryValue = keys[i];
                const subCategory = DataMap.category[categoryValue].subCategoryDataMapping[subCategoryValue];

                if (this.props.app[subCategory.targetProperty] & subCategory.targetMask) {
                    const category = DataMap.category[categoryValue];

                    let newPath = this.context.buildHref(routes.marketplace,
                        { category: category.urlKey },
                        { subcategories: null, page: '1' });

                    return (
                        // todo: need to figure out how to link on server. Need a Link component
                        <div className='detailsCategories'
                            onClick={() => {
                                DetailUtils.generateLinkPayloadAndLogTelemetry(DetailUtils.OwnerType.App, this.props.app.appid, 'Category', newPath, 'Default');
                                // The embedded app needs to open these links in a new window
                                if (this.props.isEmbedded) {
                                    getWindow().open(newPath);
                                } else {
                                    urlPush(newPath);
                                    window.scrollTo(0, 0);
                                }
                            }}
                            key={subCategory.targetMask} >
                            {this.context.loc(category.locKey, category.title)}
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

    showCTADialog() {
        this.context.ctaCallback(this.props.app, Constants.CTAType.Create, this.selectedSkuId);
    }

    showTestDriveDialog() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
            appName: this.props.app.appid,
            details: getTelemetryAppData(this.props.app, this.props.nationalCloud ? true : false)
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

        this.context.ctaCallback(this.props.app, Constants.CTAType.TestDrive);
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

            // Set the page title
            this.setPageTitle(nextProps.app.title);

            // workaround for a bug that everytime you type in searchbox we will receive new props
            if (this.props.app && this.props.app.appid && !nextProps.app.appid && (this.props.app.appid !== nextProps.app.appid)) {
                // let nps know
                NpsModule.IncreaseAppDetail();
            }
        }

        if (nextProps.app
            && (!nextProps.app.pricingInformation
                || (nextProps.app.pricingInformation
                    && this.props.app.pricingInformation
                    && nextProps.app.pricingInformation.billingRegion !== this.props.app.pricingInformation.billingRegion)
            )
        ) {
            this.props.fetchPricing(nextProps.app.appid);
        }

        // Reset the selectedSku if the app changes
        if (this.props.app && nextProps.app && this.props.app.appid && !nextProps.app.appid && (this.props.app.appid !== nextProps.app.appid)) {
            this.selectedSkuId = null;
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
            // well, we got passed an app without detail information, lets trigger that
            if (!this.props.app.detailInformation && !this.props.app.detailLoadFailed) {
                this.props.fetchAppDetails(this.props.app);
            }

            // let nps know
            NpsModule.IncreaseAppDetail();

            if (!(this.props.app.pricingInformation
                && this.props.app.pricingInformation.billingRegion === this.props.billingCountryCode)) {
                this.props.fetchPricing(this.props.app.appid);
            }

            if (!this.props.app || !this.props.isEmbedded) {
                if (this.props.location && this.props.location.query && this.props.location.query.survey) {
                    let accessKey = (this.props.location.query && this.props.location.query.survey) ? this.props.location.query.survey : null;
                    accessKey = (accessKey === 'user') ? null : accessKey;
                    this.props.openRatingModal(this.props.app, accessKey, this.props.app.actionString, (result: any) => { return; });
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
                            <div className='navigationBar'>
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
        return (
            <div className='iconHost' style={{ backgroundColor: this.props.app.iconBackgroundColor }} >
                <span className='thumbnailSpacer'></span>
                <img className='appLargeIcon' src={iconUri} />
            </div>
        );
    }

    getCTAElement() {
        let startingPrice = this.props.app.startingPrice as any;
        if (startingPrice && startingPrice.pricingData
            && startingPrice.pricingData === PricingStates.NotAvailableInThisRegion) {
            return null;
        }
        return (
            <button name='button' className='requestButton c-button' type='submit' onClick={this.showCTADialog.bind(this)}>
                {this.context.loc(this.props.app.actionString)}
            </button>
        );
    }

    getTestDriveElement() {
        return this.props.app.testDriveURL ? (
            <button name='button' className='requestButton c-button testDrive' type='submit' onClick={this.showTestDriveDialog.bind(this)}>{this.context.loc('Test_Drive')}</button>
        ) : null;
    }

    getTitleElement() {
        return (
            <div className='appDetailHeader'>
                <h4 className='c-heading-4 titleHeader'>{this.props.app.title}</h4>
                <h5 className='c-heading-5 titleSubHeader'>{this.props.app.publisher}</h5>
            </div>
        );
    }

    shouldRenderPlanAndPricing() {
        return this.props.app.planPricingType !== PlanPricingType.None;
    }

    getPlanAndPricingTabTitle() {
        let title = '';

        if (this.props.app.planPricingType === PlanPricingType.SimplePlanPricing) {
            if (this.props.app.pricingInformation && this.props.app.pricingInformation.skus) {
                const length = this.props.app.pricingInformation.skus.length;

                // loop through all skus to see if at least one of them has a price
                for (let i = 0; i < length; i++) {
                    const sku = this.props.app.pricingInformation.skus[i] as ISimpleSKU;

                    // if price is not null, we simply return Plans + Pricing Tab
                    if (sku.price) {
                        title = this.context.loc('Detail_PlansPricingTab');
                        break;
                    }
                }
            }

            // title was not set => no pricing
            if (!title) {
                // none of the skus have pricing data => only show Plans as tab title
                title = this.context.loc('Detail_PlansTab');
            }
        } else {
            // pricing type is VM => then we should have pricing
            title = this.context.loc('Detail_PlansPricingTab');
        }

        return title;
    }

    skuChangeCallback = (sku: any) => {
        if (sku && sku.id) {
            this.selectedSkuId = sku.id;
        }
    }

    renderPricing() {
        const billingCountry = getBillingCountryByCountryCode(this.props.billingCountryCode);
        let pricingComponent: JSX.Element = null;

        switch (this.props.app.planPricingType) {
            case PlanPricingType.VM:
                pricingComponent = (
                    <VMPricing pricing={this.props.app.pricingInformation}
                        billingCountry={billingCountry}
                        firstPartyPricing={this.props.firstPartyPricing}
                        appid={this.props.app.appid}
                        skuChangeCallback={this.skuChangeCallback} />
                );
                break;

            case PlanPricingType.SimplePlanPricing:
                pricingComponent = (
                    <SimplePlanPricing pricing={this.props.app.pricingInformation}
                        billingCountry={billingCountry} />
                );
                break;
        }

        return pricingComponent;
    }

    renderOverview() {
        return (
            <Overview ownerType={DetailUtils.OwnerType.App}
                ownerId={this.props.app.appid}
                ownerTitle={this.props.app.title}
                shortDescription={this.props.app.shortDescription}
                description={this.props.app.detailInformation['Description']}
                images={this.props.app.detailInformation['Images']}
                videos={this.props.app.detailInformation['DemoVideos']}
                documents={this.props.app.detailInformation.CollateralDocuments}
                TileType={PartnerTile}
                crossListings={null}
                handleSeeAllCallback={this.handleSeeAllCallback.bind(this)} />
        );
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

    getStartingPriceElement() {
        if (!this.props.app.startingPrice
            || this.props.app.startingPrice.pricingData === PricingStates.NoPricingData) {
            return null;
        } else if (this.props.app.startingPrice.pricingData === PricingStates.Loading) {
            return null;
        } else if (this.props.app.startingPrice.pricingData === PricingStates.BYOL) {
            return (
                <div className='cell'>
                    <header>{this.context.loc('PricingInformation')}</header>
                    <InternalLink href={this.getTabHref(AppDetails.pricingTabName)} className='c-hyperlink'>
                        {this.context.loc('BYOL_Long')}
                    </InternalLink>
                    <span>{this.context.loc('PlusAzureInfrastructureCost')}</span>
                </div>
            );
        } else if (this.props.app.startingPrice.pricingData === PricingStates.SolutionTemplate) {
            return (
                <div className='cell'>
                    <header>{this.context.loc('PricingInformation')}</header>
                    <InternalLink href={this.getTabHref(AppDetails.pricingTabName)} className='c-hyperlink'>
                        {this.context.loc('CostOfDeployedTemplateComponents')}
                    </InternalLink>
                </div>
            );
        } else if (this.props.app.startingPrice.pricingData === PricingStates.WebApp) {
            return (
                <div className='cell'>
                    <header>{this.context.loc('PricingInformation')}</header>
                    <span>{this.context.loc('Pricing_FreeApp')}</span>
                    <span>{this.context.loc('PlusAzureInfrastructureCost')}</span>
                </div>
            );
        } else if (typeof this.props.app.startingPrice.pricingData === 'object') {
            return (
                <div className='cell'>
                    <header>{this.context.loc('PricingInformation')}</header>
                    <InternalLink href={this.getTabHref(AppDetails.pricingTabName)} className='c-hyperlink'>
                        {this.context.locParams('StartingAtPrice', [getPriceString(
                            this.context,
                            this.props.app.startingPrice.pricingData,
                            this.props.billingCountryCode,
                            this.props.app.startingPrice ? this.props.app.startingPrice.pricingData.currency : 'USD',
                            3)])}
                    </InternalLink>
                    <span>{this.context.loc('PlusAzureInfrastructureCost')}</span>
                </div>
            );
        } else {
            return (
                <div className='cell'>
                    <header>{this.context.loc('MacAppTileText_PricingNotAvailable')}</header>
                </div>
            );
        }
    }

    getCategoriesElement() {
        const length = CategoryTargetPropertyList.length;
        let shouldRenderCategories = false;

        for (let i = 0; i < length; i++) {
            if (this.props.app[CategoryTargetPropertyList[i]] > 0) {
                shouldRenderCategories = true;
                break;
            }
        }

        if (shouldRenderCategories) {
            return (
                <div className='cell'>
                    <header>{this.context.loc('App_Categories')}</header>
                    {this.buildFilterElements()}
                </div>
            );
        } else {
            return null;
        }
    }

    changeTabCallback(tabTitle: string) {
        let newPath = this.getTabHref(tabTitle);

        urlReplace(newPath);
    }

    getTabHref(tabTitle: string): string {
        return this.context.buildHref(routes.appDetails, { appid: this.props.app.appid }, { 'tab': tabTitle });
    }

    setPageTitle(title: string) {
        document.getElementsByTagName('title')[0].innerHTML = this.context.locParams('MACdetail_pageTitle', [title]);
    }

    // Start Mooncake: add mooncake partner Element

    getEmailLinkElement(email: string) {
        const toEmail = `mailto:${email}`;
        return <a className='c-hyperlink' href={toEmail} target='_blank'>{email}</a>;
    }

    getTelLinkElement(tel: string) {
        const callTel = `tel:${tel}`;
        return <a className='c-hyperlink' href={callTel} target='_blank'>{tel}</a>;
    }

    getCompanyNameElement(name: string, website: string) {
        if (name) {
            if (website) {
                return <a className='c-hyperlink' rel='noreferrer' target='_blank'
                          href={website}>{name}</a>;
            } else {
                return <span>{name}</span>;
            }
        } else if (website) {
            return <a className='c-hyperlink' rel='noreferrer' target='_blank'
                      href={website}>{website}</a>;
        } else {
            return null;
        }
    }

    getPartnerElement() {
        let partner = this.props.app.mooncakePartner;
        if (!partner || Object.getOwnPropertyNames(partner).length === 0) {
            return null;
        }

        return (
            <div>
                <div className='cell'>
                    <header>{this.context.loc('App_Partner')}</header>
                    {this.getCompanyNameElement(partner.CompanyName, partner.Website)}
                    {
                        partner.CompanyPhone ? this.getTelLinkElement(partner.CompanyPhone) : null
                    }
                    {
                        partner.CompanyEmail ? this.getEmailLinkElement(partner.CompanyEmail) : null
                    }
                </div>
                {
                    partner.BlogUrl ?
                        <div className='cell'>
                            <header>{this.context.loc('App_Blog')}</header>
                            <a className='c-hyperlink' href={partner.BlogUrl} target='_blank'>{partner.BlogUrl}</a>
                        </div> : null
                }
                {
                    partner.Weibo ?
                        <div className='cell'>
                            <header>{this.context.loc('App_Weibo')}</header>
                            <span>{partner.Weibo}</span>
                        </div> : null
                }
                {
                    partner.ServiceQQ ?
                        <div className='cell'>
                            <header>{this.context.loc('App_QQ')}</header>
                            <span>{partner.ServiceQQ}</span>
                        </div> : null
                }
                {
                    partner.ServiceWeChat ?
                        <div className='cell'>
                            <header>{this.context.loc('App_WeChat')}</header>
                            <span>{partner.ServiceWeChat}</span>
                        </div> : null
                }
                {
                    partner.ServicePhone ?
                        <div className='cell'>
                            <header>{this.context.loc('App_ServicePhone')}</header>
                            {this.getTelLinkElement(partner.ServicePhone)}
                        </div> : null
                }
                {
                    partner.ServiceEmail ?
                        <div className='cell'>
                            <header>{this.context.loc('App_ServiceEmail')}</header>
                            {this.getEmailLinkElement(partner.ServiceEmail)}
                        </div> : null
                }
                {
                    partner.ServiceWorkTime ?
                        <div className='cell'>
                            <header>{this.context.loc('App_WorkTime')}</header>
                            <span>{partner.ServiceWorkTime}</span>
                        </div> : null
                }
            </div>
        );
    }
    // End Mooncake


    renderImpl() {
        if (this.props.app) {
            return (
                <div className='spza_detailContainer spza_partnerDetailContainer' >
                    {this.getBreadcrumbElement()}
                    <div className='detailContent'>
                        <div className='metadata'>
                            {this.getIconElement()}
                            {this.getCTAElement()}
                            {this.getTestDriveElement()}
                            <div className='metaDetails'>
                                {this.getStartingPriceElement()}
                                {this.getCategoriesElement()}
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
                                {/* Start Mooncake: add mooncake partner */}
                                {this.getPartnerElement()}
                                {/* End Mooncake*/}
                            </div>
                        </div>
                        <div className='content'>
                            {this.getTitleElement()}
                            {
                                this.props.app.detailInformation ?
                                    (
                                        this.shouldRenderPlanAndPricing() ?
                                            <Tabs defaultTab={this.props.defaultTab}
                                                ownerType={DetailUtils.OwnerType.App}
                                                ownerId={this.props.app.appid}
                                                changeTabCallback={this.changeTabCallback.bind(this)}
                                                getTabHref={this.getTabHref.bind(this)}>
                                                <Tab title={this.context.loc('PartnerDetail_OverviewTab')} name='Overview'>
                                                    {
                                                        this.renderOverview()
                                                    }
                                                </Tab>
                                                <Tab title={this.getPlanAndPricingTabTitle()} name={AppDetails.pricingTabName}>
                                                    {
                                                        this.renderPricing()
                                                    }
                                                </Tab>
                                            </Tabs> :
                                            this.renderOverview()
                                    ) : null
                            }
                        </div>
                    </div>
                </div >
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
    renderErrorModal: React.PropTypes.func
};

(AppDetails as any).childContextTypes = {
    contactCallback: React.PropTypes.func
};