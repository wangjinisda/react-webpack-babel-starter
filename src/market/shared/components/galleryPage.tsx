import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { Constants } from '../utils/constants';
import { IAppDataItem, IPartnerDataItem } from '../Models';
import { IBuildHrefContext, ILocContext, ICommonContext } from '../interfaces/context';
// import { IDataMap, IDataValues } from 'utils/dataMapping';
import { IDataMap, IDataValues } from './../../mac/utils/dataMapping';
import { performFilter } from '../utils/filterModule';
// import { getFilterLink, shouldShowCuratedData, shouldPerformGalleryPageCounting } from 'utils/filterHelpers';
import { getFilterLink, shouldShowCuratedData, shouldPerformGalleryPageCounting } from './../../mac/utils/filterHelpers';
import { NpsModule } from '../utils/npsUtils';
// import FilterPane from 'components/filterPane';
import FilterPane from './../../mac/components/filterPane';
import Segue from './segue';
import FilteredGallery from './filteredGallery';
import GalleryHeader from './galleryHeader';
// import CuratedAppGallery from 'containers/curatedAppGallery';
import CuratedAppGallery from './../../mac/containers/curatedAppGallery';
import CuratedPartnerGallery from '../containers/curatedPartnerGallery';
import * as embedHostUtils from '../../embed/embedHostUtils';
// import { getAppGalleryPageTitle } from 'utils/localization';
import { getAppGalleryPageTitle } from './../../mac/utils/localization';
import { ITelemetryData } from '../../shared/Models';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';

let classNames = require('classnames-minimal');

export interface IGalleryProps {
    isEmbedded: boolean;
    embedHost: number;
    showPrivateApps: boolean;
    allApps: IAppDataItem[];
    partnerAppDataLoaded: boolean;
    appSubsetData: IAppDataItem[];
    appDataMap: IDataMap;
    allPartners: IPartnerDataItem[];
    partnerSubsetData: IPartnerDataItem[];
    partnerDataMap: IDataMap;
    subsetSearchQuery: string;
    ensureAppData: () => Promise<any>;
    ensurePartnerData: () => Promise<any>;
    ensureCuratedData: () => Promise<any>;
    ensureCuratedPartnerData: () => Promise<any>;
    embedSearchBoxHandler: (searchString: string) => void;
    galleryPage: number;
    pageSize: number;
    galleryPageMode: Constants.GalleryPageMode;
    query: { [key: string]: string };
    params: { [key: string]: string };
    includeOfficeApps: boolean;
}

export class Gallery extends SpzaComponent<IGalleryProps, any> {
    context: IBuildHrefContext & ILocContext & ICommonContext;
    filterLinkCallback: (filter: IDataValues) => string;

    constructor() {
        super();

        this.filterLinkCallback = (filter: any) => getFilterLink(this.context, filter, this.props.galleryPageMode, false);
    }

    componentWillMount() {
        this.props.ensureAppData();
        // TODO : Check why this was needed in the gallery ever?
        this.props.ensureCuratedData();
        this.props.ensurePartnerData();
        this.props.ensureCuratedPartnerData();
    }

    componentDidMount() {
        NpsModule.checkForNPS();
        this.props.galleryPageMode === Constants.GalleryPageMode.Apps ?
            document.getElementsByTagName('title')[0].innerHTML = getAppGalleryPageTitle(this.context) :
            document.getElementsByTagName('title')[0].innerHTML = this.context.loc('partnerGallery_pageTitle', 'All partners – Microsoft AppSource');
    }

    renderImpl() {
        let isSearchMode = this.props.subsetSearchQuery && this.props.subsetSearchQuery.length > 0;
        let apps = isSearchMode ? this.props.appSubsetData : this.props.allApps;
        let partners = isSearchMode ? this.props.partnerSubsetData : this.props.allPartners;

        let dataMap = this.props.galleryPageMode === Constants.GalleryPageMode.Apps
            ? this.props.appDataMap : this.props.partnerDataMap;

        let filteredAppResult = performFilter(this.props.params, this.props.query, apps, this.props.appDataMap, shouldPerformGalleryPageCounting());
        let filteredApps = filteredAppResult.items;
        let filteredPartnerResult = performFilter(this.props.params, this.props.query, partners, this.props.partnerDataMap, false);
        let filteredPartners = filteredPartnerResult.items;
        let activeFilters = this.props.galleryPageMode === Constants.GalleryPageMode.Apps
            ? filteredAppResult.activeFilters : filteredPartnerResult.activeFilters;

        // This filters out or shows 'My Organization' apps for PowerBI
        if (this.props.showPrivateApps !== undefined) {
            filteredApps = filteredApps.filter((a: IAppDataItem) => {
                return !!a.privateApp === this.props.showPrivateApps;
            });
        }

        if (this.props.isEmbedded) {
            let publicAppsCount = filteredApps.length;
            let privateAppsCount = filteredAppResult.items ? filteredAppResult.items.length - publicAppsCount : 0;

            if (this.props.showPrivateApps) {
                privateAppsCount = filteredApps.length;
                publicAppsCount = filteredAppResult.items.length - privateAppsCount;
            }

            let action = '';
            let actionModifier = '';
            let details: any = null;

            if (isSearchMode) {
                action = Constants.Telemetry.Action.Search;
                actionModifier = Constants.Telemetry.ActionModifier.Results;
                details = {
                    results: 'Public and Private Apps',
                    publicAppResults: publicAppsCount,
                    privateAppResults: privateAppsCount
                };
            } else {
                action = Constants.Telemetry.Action.MyOrgApps;
                actionModifier = Constants.Telemetry.ActionModifier.Info;
                details = {
                    privateGalleryApps: privateAppsCount
                };
            }

            const payload: ITelemetryData = {
                page: 'In App Gallery(' + this.props.embedHost + ')',
                action: action,
                actionModifier: actionModifier,
                details: JSON.stringify(details)
            };
            SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
        }

        let renderSearchPage = this.props.subsetSearchQuery && this.props.subsetSearchQuery.length > 0;
        let showCurated = !renderSearchPage && shouldShowCuratedData(activeFilters) && (!this.props.showPrivateApps)
            && (!this.props.isEmbedded || embedHostUtils.shouldShowCuratedData(this.props.embedHost));

        // for Office on partners gallery page, we do not want to show curated data
        if (showCurated &&
            this.props.galleryPageMode === Constants.GalleryPageMode.Partners &&
            activeFilters.length &&
            // activeFilters[0].BackendKey === 'Office365') {
            activeFilters[0].backendKey === 'Office365') {
            showCurated = false;
        }

        let hideFilterPane = this.props.isEmbedded
            && (embedHostUtils.shouldHideFilterPane(this.props.embedHost) || this.props.showPrivateApps);

        const embedHideFilterPane = classNames({
            'spza_content': true,
            'spza_content_hideFilterPane': hideFilterPane
        });

        const curatedGalleryClassName = classNames({
            'curatedGalleryWrapper': activeFilters.length === 0 && !this.props.subsetSearchQuery
        });

        return (
            <div className='spza_galleryContainer'>
                <a href='#maincontent' className='spza_defaultText' tabIndex={1}>{this.context.loc('skipLink_text', 'Skip to main content')}</a>
                <div id='maincontent' className={embedHideFilterPane}>
                    <div className='paneAndGalleryWrapper'>
                        {hideFilterPane ? null :
                            <FilterPane dataMap={dataMap}
                                getFilterLink={this.filterLinkCallback}
                                embedHost={this.props.embedHost}
                                isEmbedded={this.props.isEmbedded}
                                includeOfficeApps={this.props.includeOfficeApps}
                                galleryPageMode={this.props.galleryPageMode} />
                        }
                        <div className='gallery'>
                            <GalleryHeader
                                activeFilters={activeFilters}
                                searchText={this.props.subsetSearchQuery}
                                getFilterLink={this.filterLinkCallback}
                                isEmbedded={this.props.isEmbedded}
                                embedSearchHandler={this.props.embedSearchBoxHandler} />
                            {showCurated && !renderSearchPage
                                ? <div className={curatedGalleryClassName}>
                                    {
                                        (this.props.galleryPageMode === Constants.GalleryPageMode.Apps ?
                                            <CuratedAppGallery dataMap={dataMap} category={this.props.params['category'] || this.props.query['product']} /> :
                                            <CuratedPartnerGallery category={this.props.query['product']}/>)
                                    }
                                </div>
                                : <div className='gallery'>
                                    <Segue
                                        galleryPageMode={this.props.galleryPageMode}
                                        filteredApps={filteredApps}
                                        filteredPartners={filteredPartners}
                                        isEmbedded={this.props.isEmbedded}
                                        activeFilters={activeFilters}
                                        searchText={this.props.subsetSearchQuery} />
                                    <FilteredGallery
                                        galleryPage={this.props.galleryPage}
                                        pageSize={this.props.pageSize}
                                        ensureAppData={this.props.ensureAppData}
                                        ensurePartnerData={this.props.ensurePartnerData}
                                        filteredApps={filteredApps}
                                        filteredPartners={filteredPartners}
                                        showPrivateApps={this.props.showPrivateApps}
                                        isEmbedded={this.props.isEmbedded}
                                        embedHost={this.props.embedHost}
                                        partnerAppDataLoaded={this.props.partnerAppDataLoaded}
                                        galleryPageMode={this.props.galleryPageMode} />
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(Gallery as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
