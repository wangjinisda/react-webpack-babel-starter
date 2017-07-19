import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { Constants } from '../utils/constants';
import { IBuildHrefContext, ILocContext, ICommonContext } from '../interfaces/context';
import { urlPush, routes } from '../routerHistory';
import { handleFilterToggle } from './filterItem';
// import { IDataValues } from 'utils/dataMapping';
import { IDataValues } from './../../mac/utils/dataMapping';
import { InternalLink } from './internalLink';
// import { getFilterType, l1CategoryIdentifier } from 'utils/filterHelpers'; 
import { getFilterType, l1CategoryIdentifier } from './../../mac/utils/filterHelpers';

export interface IFilterTile {
    filterType: string;
    filterValue: string;
    filterTileName: any;
    onClick: (event: any) => void;
}

export interface IGalleryHeaderProps {
    activeFilters: IDataValues[];
    searchText: string;
    getFilterLink: (filter: IDataValues) => string;
    isEmbedded: boolean;
    embedSearchHandler: (searchString: string) => void;
}

export default class GalleryHeader extends SpzaComponent<IGalleryHeaderProps, any> {
    context: IBuildHrefContext & ILocContext & ICommonContext;

    removeSearchFilter() {
        if (this.props.isEmbedded) {
            this.props.embedSearchHandler('');
        } else {
            let newPath = this.context.buildHref(routes.marketplace, null, {
                search: null,
                page: null
            });

            urlPush(newPath);
        }
    }

    getResetFilter(headerFilters: IFilterTile[]) {
        const marketplaceHref = this.context.buildHref(routes.marketplace, { category: null }, routes.marketplace.initialParamsValue);
        const shouldNotRenderResetFilter = headerFilters.length === 1 &&
            headerFilters[0].filterType === l1CategoryIdentifier;

        if (shouldNotRenderResetFilter) {
            return null;
        } else {
            return (
                <InternalLink href={marketplaceHref} className='c-hyperlink resetButton'>
                    {this.context.loc('Reset_filters')}
                </InternalLink>
            );
        }
    }

    renderImpl() {
        let headerFilters: IFilterTile[] = [];
        if (this.props.searchText) {
            headerFilters.push({
                filterType: Constants.filterTileTypes.search,
                filterValue: '',
                filterTileName: this.props.searchText,
                onClick: this.removeSearchFilter.bind(this)
            });
        }

        this.props.activeFilters.forEach((filter: any) => {
            if (filter.UrlKey !== 'azure') {
                const filterType = getFilterType(filter);

                headerFilters.push({
                    filterType: filterType,
                    filterValue: filter.UrlKey || (filter as any).urlKey,
                    filterTileName: this.context.loc(filter.LocKey || (filter as any).locKey,
                        filter.Title || (filter as any).title),
                    onClick: handleFilterToggle(
                        filterType,
                        filter.UrlKey || (filter as any).urlKey,
                        true,
                        this.props.getFilterLink(filter),
                        Constants.Telemetry.ActionModifier.FilterTag,
                        () => { window.scrollTo(0, 0); }
                    )
                });
            }
        });

        // sort function to put the subcategories after the category
        function sortFunction(a: IFilterTile, b: IFilterTile) {
            if (a.filterType === 'subcategories') {
                return 1;
            } else {
                return -1;
            }
        };

        headerFilters.sort(sortFunction);

        if (this.props.isEmbedded) {
            return null;
        }

        // TODO: the close icon should be using a sprite instead of an img
        if (headerFilters && headerFilters.length > 0) {
            return (
                <div className='galleryHeader'>
                    {this.getResetFilter(headerFilters)}
                    <div className='galleryHeader_tileFilters'>
                        {headerFilters.map((filter, key) => {
                            return (
                                <button className='c-button tileFilter' key={key} onClick={filter.onClick}>
                                    <div className='headerFilter'>
                                        {filter.filterTileName}
                                        <img className='filterCloseIcon' src='/images/closeWhite.png' />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}

(GalleryHeader as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
