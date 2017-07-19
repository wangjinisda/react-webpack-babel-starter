import * as React from 'react';
import { IDataMap, CategoryIgnoreList, IDataCollection } from '../utils/dataMapping';
import FilterItem from '../../shared/components/filterItem';
import SpzaComponent from '../../shared/components/spzaComponent';
import { ILocContext, ICommonContext, IBuildHrefContext } from '../../shared/interfaces/context';
import { globalFilterIdentifier } from '../utils/filterHelpers';

export interface IFilterPaneProps {
    dataMap: IDataMap;
    isEmbedded: boolean;
    embedHost: number;
    getFilterLink: (filter: any) => string;
    includeOfficeApps: boolean;
    galleryPageMode: any;
}

export default class FilterPane extends SpzaComponent<IFilterPaneProps, any> {
    context: ILocContext & ICommonContext & IBuildHrefContext;

    renderFilter(filter: any, category: string, clickable: boolean) {
        return (
            <div className={'filterPaneItemRoot ' + (clickable ? '' : 'filterPaneItemRootWithMargin')} key={category}>
                <FilterItem
                    filter={filter}
                    isActive={filter.isActive}
                    category={category}
                    queryValue={'null'}
                    showExpandedIcon={filter.isActive}
                    hideCheckbox={true}
                    href={clickable ? this.props.getFilterLink(filter) : null}
                    onClick={() => { window.scrollTo(0, 0); }}
                    className={!clickable ? 'spza_filterItemNonClickable' : null}
                    key={filter.title} />
                {
                    filter.isActive || !clickable ?
                        (
                            <div className='childFilterGroup'>
                                {
                                    Object.keys(filter.subCategoryDataMapping).map((key: string, index: number) => {
                                        let childFilter = filter.subCategoryDataMapping[key];
                                        if (clickable || childFilter.count > 0) {
                                            return <FilterItem
                                                filter={childFilter}
                                                isActive={childFilter.isActive}
                                                category={key}
                                                queryValue={'null'}
                                                href={this.props.getFilterLink(childFilter)}
                                                onClick={() => { window.scrollTo(0, 0); }}
                                                key={childFilter.title} />;
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
    };

    renderGlobalFilter(filterCollection: IDataCollection) {
        let keys = Object.keys(filterCollection);

        return keys.filter((key) => CategoryIgnoreList.indexOf(key) < 0).map((key) => {
            let filter = filterCollection[key];
            if (filter.count > 0) {
                return this.renderFilter(filter, key, false);
            } else {
                return null;
            }
        });
    }

    renderImpl() {
        let categoryKeys = Object.keys(this.props.dataMap.category);
        let filterKeys = Object.keys(this.props.dataMap).filter((key: string) => {
            return key.indexOf(globalFilterIdentifier) === 0;
        });
        return (
            <div className='spza_filterContainer'>
                <div className='spza_filterGroup'>
                    <div className='c-heading-5 f-lean mac_filterTitle'>{this.context.loc('ProductCategory')}</div>
                    <div className='spza_filterItems'>
                        {
                            categoryKeys.filter((key) => CategoryIgnoreList.indexOf(key) < 0).map((key) => {
                                let filter = this.props.dataMap.category[key];
                                return this.renderFilter(filter, key, true);
                            })
                        }
                    </div>
                </div>
                <div className='spza_filterGroup'>
                    <div className='c-heading-5 f-lean mac_filterTitle'>{this.context.loc('Filter_Refine')}</div>
                    <div className='spza_filterItems'>
                        {
                            filterKeys.map((key) => {
                                let filter = this.props.dataMap[key];
                                return this.renderGlobalFilter(filter);
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

(FilterPane as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    buildHref: React.PropTypes.func
};
