import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IDataValues, ProductBitmaskEnum } from '../utils/dataMapping';
import { ICommonContext, ILocContext, ILocParamsContext } from '../interfaces/context';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../Models';
import { getWindow } from '../services/window';
import { Constants } from '../utils/constants';

// exported for testing
export interface IPromotedProduct {
    name: string;
    bitmask?: number;
    storeLink: string;
    keywords: string[];
}

const promotedProducts: IPromotedProduct[] = [
    {
        name: 'Microsoft Word 2016',
        bitmask: ProductBitmaskEnum.Word,
        storeLink: 'http://aka.ms/officestoreword',
        keywords: ['Word']
    },
    {
        name: 'Microsoft Excel 2016',
        bitmask: ProductBitmaskEnum.Excel,
        storeLink: 'http://aka.ms/officestoreexcel',
        keywords: ['Excel']
    },
    {
        name: 'Microsoft PowerPoint 2016',
        bitmask: ProductBitmaskEnum.PowerPoint,
        storeLink: 'http://aka.ms/officestorepowerpoint',
        keywords: ['PowerPoint', 'Power Point']
    },
    {
        name: 'Microsoft Office 365 (Home/Personal)',
        bitmask: ProductBitmaskEnum.OneNote,
        storeLink: 'http://aka.ms/officestore365personal',
        keywords: ['OneNote']
    },
    {
        name: 'Microsoft Visio 2013',
        storeLink: 'https://aka.ms/officestorevisio',
        keywords: ['Visio']
    },
    {
        name: 'Microsoft Publisher 2016',
        storeLink: 'http://aka.ms/officestorepublisher',
        keywords: ['Publisher']
    },
    {
        name: 'Microsoft Skype for Business',
        storeLink: 'http://aka.ms/officestoreskypeforbusiness',
        keywords: ['Skype', 'Skype for business']
    },
    {
        name: 'Microsoft Office 365 (Business)',
        storeLink: 'http://aka.ms/officestore365business',
        keywords: ['Office 365']
    },
    {
        name: 'Microsoft Access 2013',
        storeLink: 'http://aka.ms/officestoreaccess',
        keywords: ['Access']
    },
    {
        name: 'Microsoft Project',
        bitmask: ProductBitmaskEnum.Project,
        storeLink: 'http://aka.ms/officestoreproject',
        keywords: ['Project']
    },
    {
        name: 'Microsoft Outlook 2016',
        bitmask: ProductBitmaskEnum.Outlook,
        storeLink: 'http://aka.ms/officestoreoutlook',
        keywords: ['Outlook']
    },
    {
        name: 'Microsoft SharePoint',
        bitmask: ProductBitmaskEnum.SharePoint,
        storeLink: 'http://aka.ms/officestoresharepoint',
        keywords: ['SharePoint']
    },
    {
        name: 'Microsoft Dynamics NAV',
        bitmask: ProductBitmaskEnum['Dynamics NAV'],
        storeLink: 'http://aka.ms/appsourcenav',
        keywords: ['Dynamics NAV']
    },
    {
        name: 'Microsoft Power BI',
        bitmask: ProductBitmaskEnum['Power BI'],
        storeLink: 'http://aka.ms/appsourcepbi',
        keywords: ['Power BI', 'PowerBI']
    },
    {
        name: 'Dynamics 365 for Sales',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Sales'],
        storeLink: 'http://aka.ms/appsourced365sales',
        keywords: ['Dynamics 365 for Sales']
    },
    {
        name: 'Dynamics 365 for Field Service',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Field Services'],
        storeLink: 'http://aka.ms/appsrcd365fieldservice',
        keywords: ['Dynamics 365 for Field Service']
    },
    {
        name: 'Dynamics 365 for Project Service Automation',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Project Services Automation'],
        storeLink: 'http://aka.ms/appsrcd365psa',
        keywords: ['Project Service Automation']
    },
    {
        name: 'Dynamics 365 for Customer Service',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Customer Services'],
        storeLink: 'http://aka.ms/appsrcd365cs',
        keywords: ['Dynamics 365 for Customer Service']
    },
    {
        name: 'Dynamics 365 for Operations',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Operations'],
        storeLink: 'http://aka.ms/appsrcd365operations',
        keywords: ['Dynamics 365 for Operations']
    },
    {
        name: 'Dynamics 365 for Financials',
        bitmask: ProductBitmaskEnum['Dynamics 365 for Financials'],
        storeLink: 'http://aka.ms/appsrcd365financials',
        keywords: ['Dynamics 365 for Financials']
    },
    {
        name: 'Cortana Intelligence Suite',
        bitmask: ProductBitmaskEnum['Azure for Cortana Intelligence'],
        storeLink: 'http://aka.ms/appsrccortana',
        keywords: ['Cortana Intelligence']
    }
];

export interface IAppPromotionPaneProps {
    activeFilters: IDataValues[] | any;
    searchText: string;
}

export default class AppPromotionPane extends SpzaComponent<IAppPromotionPaneProps, any> {
    context: ICommonContext & ILocContext & ILocParamsContext;

    getSelectedProduct(): IPromotedProduct {
        // Only when there is one action we show a promotion.
        if (this.props.searchText && this.props.activeFilters && this.props.activeFilters.length > 0) {
            return undefined;
        }

        if (this.props.searchText) {
            let searchText = this.props.searchText.toLowerCase();
            let productsFromSearchText = promotedProducts.filter(
                p => p.keywords.filter(k => searchText.indexOf(k.toLowerCase()) >= 0).length > 0);

            // Products filtered from search text gets higher priority than pre-defined filters.
            if (productsFromSearchText.length > 0) {
                return productsFromSearchText[0];
            }
        }

        // Filters containing shortcut filters are essentially categories. So they are not considered when displaying app promotion.
        if (this.props.activeFilters && this.props.activeFilters.filter(((f: any) => !f.ShortcutFilters)).length === 1) {
            let productsFromFilters = promotedProducts.filter(
                p => this.props.activeFilters.filter((f: any) => f.FilterID === p.bitmask).length > 0);

            // Only when there is a single filter then we display a promotion.
            // If there are multiple filters, we don't display anything at all.
            if (productsFromFilters.length === 1) {
                return productsFromFilters[0];
            }
        }

        return undefined;
    }

    handleClick(storeLink: string, event: any) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.FirstPartyAppPromotion,
            details: JSON.stringify({
                linkType: Constants.Telemetry.ActionModifier.FirstPartyAppPromotion,
                link: storeLink ? storeLink : event && event.target && event.target.href
            })
        };

        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    getSelectedProductLink(storeLink: string) {
        return <a href={storeLink} className='c-hyperlink' target='_blank' onClick={this.handleClick.bind(this, storeLink)}>{this.context.loc('AppPromotionPane_SeeYourOptions')}</a>;
    }

    renderImpl() {
        let selectedProduct = this.getSelectedProduct();
        if (selectedProduct) {
            return <div className='appPromotionPane'>
                <p className='c-subheading-5'>{this.context.locParams('AppPromotionPane_Content', [selectedProduct.name, ' '])}{this.getSelectedProductLink(selectedProduct.storeLink)}</p>
            </div>;
        }

        return null;
    }
}

(AppPromotionPane as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func
};