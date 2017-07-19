import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { Promise } from 'es6-promise';
let SimpleSelect = require('react-selectize').SimpleSelect;
let classNames = require('classnames-minimal');
import {
  ISearchItem,
  ISearchResult,
  IAppSearchResult,
  IPartnerSearchResult,
  ITelemetryData
} from './../Models';

import { urlPush, IRouteConfig, IPartnerDetailsParams } from '../routerHistory';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICommonContext } from '../interfaces/context';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
// import { renderAppSearchResultDescription, shouldShowPartnerSearchAll, getPlaceholderText, getDetailPath } from 'utils/search';
import { renderAppSearchResultDescription, shouldShowPartnerSearchAll, getPlaceholderText, getDetailPath } from './../../mac/utils/search';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');

interface IShowAllItem<T> extends ISearchItem {
  route: IRouteConfig<T>;
}

interface ISearchResultGrouped {
  groupId: string;
  value: ISearchItem;
}

interface ISearchGroup {
  groupId: string;
  title?: string;
  hint?: string;
}

export interface ISearchComponent {
  appSearchResults: IAppSearchResult[];
  partnerSearchResults: IPartnerSearchResult[];
  searchID: number;
  searchText: string;
  currentView: string;
  includeOfficeApps: boolean;
  onPrePerformSearch(searchtext: string): void;
  onPerformSearch(searchtext: string, searchID: number, includeOfficeApps: boolean): Promise<any>;
}

export default class SearchComponent extends SpzaComponent<ISearchComponent, any> {
  context: IBuildHrefContext & ILocParamsContext & ILocContext & ICommonContext;

  private selectNode: any = null;
  private isOpen: boolean = false;
  private hasValues: boolean = false;
  private timeoutID: number = -1;
  private instrument = SpzaInstrumentService.getProvider();

  constructor(props: ISearchComponent, context: any) {
    super(props, context);
  }

  buildSearchAllHref<T>(item: IShowAllItem<T>, searchText: string): string {
    let route = item && item.route ? item.route : routes.marketplace;
    return this.context.buildHref(route, null, {
      industry: null,
      category: null,
      product: null,
      search: searchText,
      page: '1'
    });
  }

  buildDetailHref(filter: ISearchResult): string {
    // search is giving us back product as title, not number, so it must match exactly
    if (filter.type === 'PartnerSearchResult') {
      return this.context.buildHref<IPartnerDetailsParams>(routes.partnerDetail, { partnerId: filter.id }, {});
    } else {
      return getDetailPath(this.context, filter);
    }
  }

  renderImpl() {
    let self = this;
    let context = this.context as any;

    let searchResultsCustom: ISearchItem[] = [];
    // search component needs to know how to render all kinds of search results

    let addSearchResults = (apps: IAppSearchResult[],
      partners: IPartnerSearchResult[],
      currentView: string) => {
      let primaryResults: ISearchResult[] = apps;
      let secondaryResults: ISearchResult[] = partners;
      let primaryShowAll: any[] = [];
      let secondaryShowAll: any[] = [];
      let output = {
        results: [] as any[],
        groups: [{
          groupId: 'SearchShowAll'
        }] as ISearchGroup[]
      };

      let showAllApps = [{
        type: 'SearchShowAll',
        text: context.locParams('SB_SearchAllApps', [this.props.searchText], 'Search all apps for ' + this.props.searchText),
        route: routes.marketplace
      }];
      let showAllPartners = shouldShowPartnerSearchAll() ? [{
        type: 'SearchShowAll',
        text: context.locParams('SB_SearchAllPartners', [this.props.searchText], 'Search all partners for ' + this.props.searchText),
        route: routes.marketplacePartners
      }] : [];
      let partnerGroup = {
        groupId: 'PartnerSearchResult',
        title: this.context.loc('SB_Partners', 'Partners')
      };
      let appGroup = {
        groupId: 'AppSearchResult',
        title: this.context.loc('SB_Apps', 'Apps')
      };

      if (currentView === 'partnerGallery') {
        primaryResults = partners;
        secondaryResults = apps;
        primaryShowAll = showAllPartners;
        secondaryShowAll = showAllApps;
        if (partners.length > 0) {
          output.groups.push(partnerGroup);
        }
        if (apps.length > 0) {
          output.groups.push(appGroup);
        }
      } else {
        primaryResults = apps;
        secondaryResults = partners;
        primaryShowAll = showAllApps;
        secondaryShowAll = showAllPartners;
        if (apps.length > 0) {
          output.groups.push(appGroup);
        }
        if (partners.length > 0) {
          output.groups.push(partnerGroup);
        }
      }
      output.results = output.results.concat(primaryShowAll).concat(secondaryShowAll);
      output.results = output.results.concat(primaryResults);
      output.results = output.results.concat(secondaryResults.slice(0, 7 - primaryResults.length));

      return output;
    };

    let results = addSearchResults(this.props.appSearchResults, this.props.partnerSearchResults, this.props.currentView);
    searchResultsCustom = searchResultsCustom.concat(results.results);
    let searchResultGroupsCustom = results.groups;
    if (searchResultGroupsCustom.length > 1) {
      searchResultGroupsCustom[1].hint = this.context.loc('SB_SearchSuggestions', 'Search suggestions');
    }
    self.hasValues = searchResultsCustom.length > 0;

    // we now have a perfectly ordered list of searchitems. The component requires this in a particular
    // format to get the grouping to work
    let searchResultsGroupedItemsCustom: ISearchResultGrouped[] = searchResultsCustom.map(function (item: ISearchItem) {
      return {
        groupId: item.type,
        value: item
      };
    });

    // we are not using the filtering abilities of this component
    const filterOptions = (options: any, search: string) => {
      return options;
    };

    // when the user types, we want to rerender
    const onSearchChange = (search: string) => {
      // the component also calls onSearchChange when the drop down closes
      // we do not want to clear out the searchtext in that case
      // since search fires first, we need a timeout

      // second reason we need a timeout is to throttle when we kick off searches
      // as to not slow down typing too much

      if (self.timeoutID > -1) {
        window.clearTimeout(self.timeoutID);
        self.timeoutID = -1;
      }

      // in order to directly reflect this typing (without delay)
      // but if the user is not typing (closing the dropdown), let's use the timeout
      if (search.length > 0) {
        self.props.onPrePerformSearch(search);
      }

      self.timeoutID = window.setTimeout(() => {
        // we are calling highlightFirstSelectableOption to make sure keyboarding works
        if (self.isOpen) {
          self.props.onPerformSearch(search, self.props.searchID, this.props.includeOfficeApps).then((v: any) => {
            self.selectNode.highlightFirstSelectableOption();
          });
        }

        self.timeoutID = -1;
      }, search.length === 0 || navigator.userAgent.indexOf('Trident') === -1 ? 30 : 1500);  // ~immediately perform is search text was removed, otherwise wait a good amount of time
    };

    // let's remember when the drop down is open or closed
    const onOpenChange = (open: boolean) => {
      self.isOpen = open;
      if (self.timeoutID > -1 && !open) {
        window.clearTimeout(self.timeoutID);
        self.timeoutID = -1;
      }
      if (!open) {
        let payload: ITelemetryData = {
          page: getWindow().location.href,
          action: Constants.Telemetry.Action.Search,
          actionModifier: Constants.Telemetry.ActionModifier.Info,
          details: JSON.stringify({
            searchTerm: this.props.searchText,
            source: 'global'
          })
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
      }
    };

    const onClickSearchIcon = () => {
      urlPush(self.buildSearchAllHref(
        searchResultsCustom.length > 0 ? searchResultsCustom[1] as IShowAllItem<any> : null,
        this.props.searchText
      ));
    };

    // (selectedValue){}  invoked when the user selects an option (by click on enter)
    const onValueChange = (groupedItem: ISearchResultGrouped) => {
      if (groupedItem !== undefined && groupedItem.value !== undefined) {
        let item = groupedItem.value;
        let action = 'Closed';
        let actionDetails = '';

        if (item.type === 'AppSearchResult') {
          action = 'App Suggestion';
          actionDetails = (this.props.appSearchResults.indexOf(item as IAppSearchResult) + 1).toString();
        } else if (item.type === 'PartnerSearchResult') {
          action = 'Partner Suggestion';
          actionDetails = (this.props.partnerSearchResults.indexOf(item as IPartnerSearchResult) + 1).toString();
        } else if (item.type === 'SearchShowAll') {
          if (item.text === context.locParams('SB_SearchAllApps', [this.props.searchText], 'Search all apps for ' + this.props.searchText)) {
            action = 'Search All Apps';
          } else if (item.text === context.locParams('SB_SearchAllPartners', [this.props.searchText], 'Search all partners for ' + this.props.searchText)) {
            action = 'Search All Partners';
          }
        }

        // props is lost after the url push, so construct payload before that
        let payload: ITelemetryData = {
          page: getWindow().location.href,
          action: Constants.Telemetry.Action.Click,
          actionModifier: Constants.Telemetry.ActionModifier.SearchSuggestions,
          details: JSON.stringify({
            searchTerm: this.props.searchText,
            action: action,
            actionDetails: actionDetails,
            numAppSuggestions: this.props.appSearchResults.length,
            numPartnerSuggestions: this.props.partnerSearchResults.length,
            source: 'global'
          })
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);

        // Telemetry logging for search
        if (item.type === 'SearchShowAll') {
          urlPush(self.buildSearchAllHref(item as IShowAllItem<any>, this.props.searchText));
        } else if (item.type === 'AppSearchResult' || item.type === 'PartnerSearchResult') {
          urlPush(self.buildDetailHref(item as IAppSearchResult));
        }
      }
    };

    const renderOption = (groupedItem: ISearchResultGrouped) => {
      let item = groupedItem.value;
      if (item.type === 'AppSearchResult') {
        let result = item as IAppSearchResult;
        let divImage = { backgroundImage: 'url(' + result.logo + ')' };
        return (
          <div className='simple-option searchResult Item App'>
            <div className='Icon' style={divImage}></div>
            <div>
              <header>{result.text}</header>
              {
                renderAppSearchResultDescription(result, context)
              }
            </div>
          </div>
        );
      } else if (item.type === 'PartnerSearchResult') {
        let result = item as IAppSearchResult;
        let divImage = { backgroundImage: 'url(' + result.logo + ')' };
        return (
          <div className='simple-option searchResult Item App'>
            <div className='Icon' style={divImage}></div>
            <div>
              <header>{result.text}</header>
              <div className='Description'>{context.locParams('Tile_For', [result.product])}</div>
            </div>
          </div>
        );
      } else if (item.type === 'SearchShowAll') {
        return (
          <div className='simple-option searchShowAll'>{item.text}</div>
        );
      }
    };

    const renderValue = (item: ISearchItem) => {
      return (
        <div className='simple-value'>
          <span>{item.text}</span>
        </div>
      );
    };

    const renderGroupTitle = (index: number, group: ISearchGroup) => {
      if (group.groupId === 'SearchShowAll') {
        return (
          <div className='searchShowAllGroup' />
        );
      } else {
        const classes = classNames({
          'searchResultGroup': true,
          'searchResultFirstGroup': group.hint
        });
        return (
          <div className={classes}>
            <span className='searchResultTitle'>{group.title}</span>
            {group.hint ? <span className='searchResultHint'>{group.hint}</span> : null}
          </div>
        );
      }

    };

    const renderNoResultsFound = (value: any, search: string) => {
      return (
        <div className='no-results-found'>
          nothing found
        </div>
      );
    };

    const renderCustomToggleButton = (open: boolean, flipped: boolean) => {
      return (
        <button className='c-glyph' onClick={onClickSearchIcon}>
          <span className='x-screen-reader'>Search</span>
        </button>
      );
    };

    // introduces some extra knowledge for our css
    const classes = classNames({
      'spza-c-search': true,
      'spza-c-search-hasvalues': self.hasValues,
      'spza-c-search-hasinput': this.props.searchText.length > 0
    });

    return (
      <SimpleSelect
        className={classes}
        placeholder={getPlaceholderText(context)}
        renderToggleButton={renderCustomToggleButton}
        groups={searchResultGroupsCustom}
        value={null}
        options={searchResultsGroupedItemsCustom}
        ref={(n: any) => { self.selectNode = n; } }
        transitionEnter={true}
        transitionLeave={true}
        search={this.props.searchText}

        // disable client side filtering
        // filterOptions :: [Item] -> String -> [Item]
        filterOptions={filterOptions}

        // onSearchChange :: String -> (a -> Void) -> Void
        onSearchChange={onSearchChange}

        onOpenChange={onOpenChange}

        // template for the options in the listbox
        renderOption={renderOption}

        // template for the value in the input area
        renderValue={renderValue}

        // template for a group.
        // (index, group){return React.DOM.div(null)} returns a custom way for rendering the group title
        renderGroupTitle={renderGroupTitle}

        // render-no-results-found :: Item -> String -> ReactElement
        renderNoResultsFound={renderNoResultsFound}

        onValueChange={onValueChange}
        />
    );
  }
}

(SearchComponent as any).contextTypes = {
  locale: React.PropTypes.string,
  loc: React.PropTypes.func,
  locParams: React.PropTypes.func,
  buildHref: React.PropTypes.func,
  renderErrorModal: React.PropTypes.func
};
