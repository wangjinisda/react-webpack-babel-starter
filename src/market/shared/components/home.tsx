import * as React from 'react';
import SpzaComponent from './spzaComponent';
import BasicSearch from './basicSearch';
import Ribbon from './ribbon';
import FilterItem from './filterItem';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';
import { ICuratedSection, IAppDataItem, IPartnerDataItem, ITelemetryData } from './../Models';
import { ProductEnum, DataMap, IDataValues } from '../utils/dataMapping';
import { IBuildHrefContext, ICommonContext, ILocContext } from '../interfaces/context';
import { urlReplace, routes, IRouteConfig } from '../routerHistory';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { performFilter } from '../utils/filterModule';
import { NpsModule } from '../utils/npsUtils';

export interface IHomeProps {
    featuredApps: ICuratedSection<IAppDataItem>;
    changeHandler: (searchText: string, searchID: number) => void;
    searchID: number;
    appSearchResults: IAppDataItem[];
    partnerSearchResults: IPartnerDataItem[];
    searchQuery: string;
    allApps: IAppDataItem[];
    allPartners: IPartnerDataItem[];
    ensureAppData: () => void;
    ensureCuratedData: () => void;
    ensurePartnerData: () => void;
    urlQuery: any;
    includeOfficeApps: boolean;
}

export interface IHomeState {
    resultSearchID: number;         // the searchid that we are looking for
}

export class Home extends SpzaComponent<IHomeProps, IHomeState> {
    context: IBuildHrefContext & ICommonContext & ILocContext;
    private timeoutID: number = -1;
    private instrument = SpzaInstrumentService.getProvider();
    private activeProducts: number = 0;

    constructor(props: IHomeProps, context: any) {
        super(props, context);
        this.state = {
            resultSearchID: 0
        };
    }

    buildNavigateUrl<T>(route: IRouteConfig<T>, search?: string) {
        return this.context.buildHref(route, null, {
            category: this.props.urlQuery.category ? this.props.urlQuery.category : null,
            industry: this.props.urlQuery.industry ? this.props.urlQuery.industry : null,
            product: this.props.urlQuery.product ? this.props.urlQuery.product : null,
            search: search ? search : null
        });
    }

    componentWillMount() {
        this.props.ensureAppData();
        this.props.ensureCuratedData();
        this.props.ensurePartnerData();
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        NpsModule.checkForNPS();
        if (document.getElementsByTagName('title')[0]) {
            document.getElementsByTagName('title')[0].innerHTML = this.context.loc('home_pageTitle', 'Microsoft AppSource – destination for business apps');
        }
    }

    renderFilter(filter: IDataValues, category: string, productGroup: boolean) {
        let filterValue = (filter.isActive ? '!' : ';') + filter.ShortcutUrlKey;

        return <FilterItem
            filter={filter}
            isActive={filter.isActive}
            category={category}
            queryValue={filter.ShortcutUrlKey}
            href={this.context.buildHref(routes.home, null, { [category]: filterValue })}
            iconClassName={productGroup ? 'icon-' + ProductEnum[filter.FilterID] + '-20' : null}
            resultCount={(filter as any).count}
            key={filter.UrlKey} />;
    }

    filterGroupRendering(filters: IDataValues[], category: string, title: string, productGroup: boolean) {
        let document: JSX.Element[] = [];
        document.push(
            <h6 className='c-heading-6 groupHeader' key={category + 'header'}>{title}</h6>
        );
        filters.forEach(filter => {
            document.push(this.renderFilter(filter, category, productGroup));
        });
        return document;
    }

    productFilterGroupRendering(products: IDataValues[], category: string, title: string, productGroup: boolean) {
        let document: JSX.Element[] = [];
        document.push(
            <h6 className='c-heading-6 groupHeader' key={category + 'header'}>{title}</h6>
        );
        products.forEach(product => {
            let showFilter = true;
            if (product.BackendKey === 'Office365' && !this.props.includeOfficeApps) {
                showFilter = false;
            }
            if (product.BackendKey === 'Office 365' && this.props.includeOfficeApps) {
                showFilter = false;
            }

            if (showFilter) {
                document.push(this.renderFilter(product, category, productGroup));
            }
        });
        return document;
    }

    updateGalleryURL(products: IDataValues[], galleryURL: string) {
        this.activeProducts = 0;

        if (this.props.urlQuery['product'] && products) {
            const length = products.length;

            for (let i = 0; i < length; i++) {
                if (this.props.urlQuery['product'].indexOf(products[i].ShortcutUrlKey) >= 0) {
                    this.activeProducts++;

                    // in case of Azure (Cloud Solutions), we want to treat it as 2 products being selected
                    if (products[i].UrlKey === 'azure') {
                        this.activeProducts++;
                    }

                    if (this.activeProducts === 1) {
                        const urlKey = products[i].UrlKey;

                        galleryURL = this.context.buildHref(routes.marketplace, null, {
                            product: urlKey
                        });
                    } else if (this.activeProducts > 1) {
                        galleryURL = this.context.buildHref(routes.marketplace, null, {
                            product: null
                        });

                        break;
                    }
                }
            }
        }

        return galleryURL;
    }

    renderImpl() {
        let context = this.context as any;

        // home page needs both curated data and app data to exist, if it doesn't let's render a progress bar
        if (!this.props.featuredApps || !this.props.featuredApps.items || !this.props.allApps || !this.props.allPartners) {
            return null;
        }

        let self = this;

        console.log('rendering with searchid: ' + this.props.searchID);

        let products = Object.keys(DataMap.products).map((k) => DataMap.products[k]).filter((f) => f.DisplayOnHome);
        let categories = Object.keys(DataMap.categories).map((k) => DataMap.categories[k]).filter((f) => f.DisplayOnHome);
        let industries = Object.keys(DataMap.industries).map((k) => DataMap.industries[k]).filter((f) => f.DisplayOnHome);

        let galleryUrl = this.updateGalleryURL(products, this.buildNavigateUrl(routes.marketplace, this.props.searchQuery));
        const seeAllUrl = this.buildNavigateUrl(routes.marketplace);
        const seeAllPartnersUrl = this.buildNavigateUrl(routes.marketplacePartners);
        const partnerGalleryUrl = this.buildNavigateUrl(routes.marketplacePartners, this.props.searchQuery);

        let showTopResults = false;
        let dataSource: IAppDataItem[] = [];
        let partnerDataSource: IPartnerDataItem[] = [];

        // if we are not searching (no search results), but we do have a filter selected, let's use the
        // all apps data
        if (this.props.searchQuery === undefined || this.props.searchQuery.length === 0) {
            if (this.props.urlQuery['product'] || this.props.urlQuery['industry'] || this.props.urlQuery['category']) {
                showTopResults = true;
                dataSource = this.props.allApps;
                partnerDataSource = this.props.allPartners;
            }
        } else if (this.props.searchQuery.length > 2) {
            // only do something if we have more than 2 characters
            dataSource = this.props.appSearchResults;
            partnerDataSource = this.props.partnerSearchResults;
            showTopResults = true;
        }

        const onSearchChange = (search: string) => {
            console.log('search changed to :' + search);
            // the component also calls onSearchChange when the drop down closes
            // we do not want to clear out the searchtext in that case
            // since search fires first, we need a timeout

            // second reason we need a timeout is to throttle when we kick off searches
            // as to not slow down typing too much

            if (self.timeoutID > -1) {
                window.clearTimeout(self.timeoutID);
                self.timeoutID = -1;
            }

            self.timeoutID = window.setTimeout(() => {
                // we are only going to change our results when the search returns
                // this is going to cause a rerender, with the same values
                this.setState({
                    resultSearchID: this.props.searchID + 1
                });

                let data = {
                    searchTerm: search,
                    source: 'homepage'
                };
                let payload: ITelemetryData = {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Search,
                    actionModifier: Constants.Telemetry.ActionModifier.Info,
                    details: JSON.stringify(data)
                };
                this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);

                // make sure the search is reflected in the browser window
                // this is going to cause a rerender as well, still same values until it causes to comeback with a new searchid
                urlReplace(this.buildNavigateUrl(routes.home, search));
                self.timeoutID = -1;
            }, 300);
        };

        let appRibbonData = {
            title: context.loc('CuratedType_FeaturedApps'),
            seeMoreUrl: seeAllUrl,
            seeMoreText: context.loc('Link_AllApps'),
            isSeeMoreButton: true,
            subHeader: ''
        };
        let ribbonApps = this.props.featuredApps.items;

        let appResults = performFilter(null, this.props.urlQuery, dataSource, DataMap, true, true);
        let partnerResults = performFilter(null, this.props.urlQuery, partnerDataSource, DataMap, true, false);

        if (showTopResults) {
            let count = appResults.items.length;
            appRibbonData.title = context.loc('FilteredGallery_SegueAppResultsHeader');
            appRibbonData.seeMoreUrl = count > 0 ? galleryUrl : seeAllUrl;
            appRibbonData.seeMoreText = this.activeProducts > 1 ?
                context.loc('Link_GoToGallery') :
                context.locParams('Link_SeeAll_WithCount', [count]);
            appRibbonData.isSeeMoreButton = false;
            appRibbonData.subHeader = count === 0 ? context.loc('FilteredGallery_NoApps') : '';
            ribbonApps = count > 6 ? appResults.items.slice(0, 6) : appResults.items;
        }

        let partnerRibbonData = {
            title: context.loc('FilteredGallery_SeguePartnerResultsHeader'),
            seeMoreUrl: seeAllPartnersUrl,
            seeMoreText: context.loc('Link_AllPartners'),
            isSeeMoreButton: false,
            subHeader: ''
        };
        let ribbonPartners: IPartnerDataItem[] = [];

        if (showTopResults) {
            let count = partnerResults.items.length;
            partnerRibbonData.seeMoreUrl = count > 0 ? partnerGalleryUrl : seeAllPartnersUrl;
            partnerRibbonData.seeMoreText = context.locParams('Link_SeeAll_WithCount', [count]);
            partnerRibbonData.subHeader = count === 0 ? context.loc('FilteredGallery_NoPartners') : '';
            ribbonPartners = count > 6 ? partnerResults.items.slice(0, 6) : partnerResults.items;
        }

        return (
            <div className='spza_homePage'>
                <a href='#maincontent' className='spza_defaultText' tabIndex={1}>{context.loc('skipLink_text', 'Skip to main content')}</a>
                <div id='maincontent' className='section homeTop'>
                    <div className='landingBackground'></div>
                    <h3 className='c-heading-3 landingHeader'>{context.loc('Home_Subtitle')}</h3>
                    <p className='c-subheading-3 landingSubHeader'>{context.loc('Home_Subtitle2')}</p>
                    <div className='wizard'>
                        <BasicSearch changeHandler={onSearchChange} defaultValue={this.props.searchQuery} isEmbedded={false} host={'home'}/>
                        <div className='homeFilters'>
                            <div className='homeGroups'>
                                <div className='homeGroup'>
                                    {this.filterGroupRendering(categories, 'category', context.loc('Home_RefineCat'), false)}
                                </div>
                                <div className='homeGroup'>
                                    {this.filterGroupRendering(industries, 'industry', context.loc('Home_RefineIndustry'), false)}
                                </div>
                                <div className='homeGroup'>
                                    {this.productFilterGroupRendering(products, 'product', context.loc('Home_RefineProduct'), true)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='section homeResult'>
                    {
                        <Ribbon {...appRibbonData}>
                            {ribbonApps.map((a: any, index: number) => <AppTile {...a} key={a.appid} tileIndex={index} />)}
                        </Ribbon>
                    }
                    {
                        showTopResults ?
                            <Ribbon {...partnerRibbonData}>
                                {ribbonPartners.map((a: any, index: number) => <PartnerTile {...a} key={a.partnerId} tileIndex={index} />)}
                            </Ribbon> : null
                    }
                </div>
                <div className='section homeMarketing'>
                    <div className='marketList'>
                        <div className='marketContent'>
                            <div className='marketCard'>
                                <div className='cardContent'>
                                    <div className='icon-marketSearch staticImg' />
                                    <h3 className='c-heading-3 marketHeader'>{context.loc('Home_Marketing1Header')}</h3>
                                    <p className='c-paragraph-3 marketParagraph'>{context.loc('Home_Marketing1Content')}</p>
                                </div>
                            </div>
                            <div className='marketCard'>
                                <div className='cardContent'>
                                    <div className='icon-lightbulb staticImg' />
                                    <h3 className='c-heading-3 marketHeader'>{context.loc('Home_Marketing2Header')}</h3>
                                    <p className='c-paragraph-3 marketParagraph'>{context.loc('Home_Marketing2Content')}</p>
                                </div>
                            </div>
                            <div className='marketCard'>
                                <div className='cardContent'>
                                    <div className='icon-people staticImg' />
                                    <h3 className='c-heading-3 marketHeader'>{context.loc('Home_Marketing3Header')}</h3>
                                    <p className='c-paragraph-3 marketParagraph'>{context.loc('Home_Marketing3Content')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(Home as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
