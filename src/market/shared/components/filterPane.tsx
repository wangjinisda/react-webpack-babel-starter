import * as React from 'react';
import { IDataMap, IDataCollection, IDataValues } from '../utils/dataMapping';
import FilterItem from './filterItem';
import SpzaComponent from './spzaComponent';
import { shouldHideIndustriesAndProducts } from '../../embed/embedHostUtils';
import { ILocContext, ICommonContext } from '../interfaces/context';
import { Constants } from '../utils/constants';

let classNames = require('classnames-minimal');

interface IFilterPaneProps {
    dataMap: IDataMap;
    isEmbedded: boolean;
    embedHost: number;
    getFilterLink: (filter: IDataValues) => string;
    includeOfficeApps: boolean;
    galleryPageMode: Constants.GalleryPageMode;
}

export default class FilterPane extends SpzaComponent<IFilterPaneProps, any> {
    context: ILocContext & ICommonContext;

    buildFilterElement(filters: IDataCollection, filter: string, category: string) {
        let currentFilter = filters[filter];
        let queryValue = currentFilter.UrlKey;

        let isProductFilter = category === 'product';
        let activeParentFilter = (currentFilter.isActive || this.props.isEmbedded) && currentFilter.ShortcutFilters != null;

        // for Office on partners page, for now, we have no children
        // so we should hide the expanded icon
        if (this.props.galleryPageMode === Constants.GalleryPageMode.Partners &&
            currentFilter.BackendKey === 'Office365') {
            activeParentFilter = false;
        }

        return (
            <div className='filterPaneItemRoot'>
                <FilterItem
                    filter={currentFilter}
                    isActive={currentFilter.isActive}
                    category={category}
                    queryValue={queryValue}
                    hideCheckbox={isProductFilter}
                    showExpandedIcon={activeParentFilter}
                    href={this.props.getFilterLink(currentFilter)}
                    onClick={() => { window.scrollTo(0, 0); }}
                    key={filter} />
                {
                    activeParentFilter ?
                        (
                            <div>
                                {
                                    Object.keys(currentFilter.ShortcutFilters).map((key: string, index: number) => {
                                        const childFilter = filters[currentFilter.ShortcutFilters[key]];

                                        // a child filter might be null when no apps/partners with that filter are present
                                        if (childFilter) {
                                            return <FilterItem
                                                filter={childFilter}
                                                isActive={childFilter.isActive}
                                                category={key}
                                                queryValue={'null'}
                                                href={this.props.getFilterLink(childFilter)}
                                                onClick={() => { window.scrollTo(0, 0); }}
                                                key={index} />;
                                        } else {
                                            return null;
                                        }
                                    })
                                }
                            </div>
                        )
                        : null
                }
            </div>
        );
    }

    renderSearchBlock(title: string, filters: IDataCollection, category: string) {
        let groupClass = 'spza_filterGroup ' + category;
        return (
            <div className={groupClass}>
                <div className='c-heading5 spza_filterTitle'>{this.context.loc(title)}</div>
                <div className='spza_filterItems'>
                    {
                        Object.keys(filters)
                            .map((filter) => {
                                if (filters[filter].FilterID) {
                                    return this.buildFilterElement(filters, filter, category);
                                }
                            })
                    }
                </div>
            </div>
        );
    }

    renderProductBlock(title: string, includeOfficeApps: boolean) {
        let shouldRenderFilterHeaders = true;
        let products = this.props.dataMap.products;
        let productGroupings = Object.keys(products)
            .reduce(function (acc, productKey) {
                let product = products[productKey];
                if (product.IsChildFilter) {
                    return acc;
                }
                if (includeOfficeApps && product.BackendKey === 'Office 365') {
                    return acc;
                }

                if (product.UrlKey === 'web-apps' || product.UrlKey === 'cortana-intelligence') {
                    acc.apps.push(product);
                } else if (product.UrlKey !== 'azure') {
                    acc.plugins.push(product);
                }

                return acc;
            }, { apps: [] as IDataValues[], plugins: [] as IDataValues[] });

        // we do not want to render the filter headers i.e. Apps, Add-ins
        // when one of the headers has no children
        // or when we are in the partners gallery page
        if (productGroupings.apps.length === 0 ||
            productGroupings.plugins.length === 0 ||
            this.props.galleryPageMode === Constants.GalleryPageMode.Partners) {
            shouldRenderFilterHeaders = false;
        }

        const filterItemsClass = classNames({
            'spza_filterItems': true,
            'spza_filterItemsNoIndent': !shouldRenderFilterHeaders
        });

        return (
            <div className='spza_filterGroup product'>
                <div className='c-heading5 spza_filterTitle'>{this.context.loc(title)}</div>
                <span> {shouldRenderFilterHeaders ? this.context.loc('Embedded_Apps') : null} </span>
                <div className={filterItemsClass}>
                    {
                        productGroupings.apps.map((app => this.buildFilterElement(products, app.UrlKey, 'product')))
                    }
                </div>
                <span>{shouldRenderFilterHeaders ? this.context.loc('Loc_AddIns') : null}</span>
                <div className={filterItemsClass}>
                    {
                        productGroupings.plugins.map((plugin => this.buildFilterElement(products, plugin.UrlKey, 'product')))
                    }
                </div>
            </div>
        );
    }

    renderImpl() {
        let hideIndustriesAndProducts = this.props.isEmbedded && shouldHideIndustriesAndProducts(this.props.embedHost);

        return (
            <div className='spza_filterContainer'>
                {
                    hideIndustriesAndProducts
                        ? null
                        : this.renderProductBlock('FilterType_Products', this.props.includeOfficeApps)
                }
                {
                    this.renderSearchBlock('FilterType_Categories', this.props.dataMap.categories, 'category')
                }
                {
                    hideIndustriesAndProducts
                        ? null
                        : this.renderSearchBlock('FilterType_Industries', this.props.dataMap.industries, 'industry')
                }
            </div>
        );
    }
}

(FilterPane as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
