import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, PricingStates } from './../Models';
import { DataMap, ProductEnum, ProductIgnoreList } from '../utils/dataMapping';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext } from '../interfaces/context';
import { routes } from '../routerHistory';
import { BaseTile } from './baseTile';
import { Constants } from './../utils/constants';
import { isOfficeNonSaasApp } from './../utils/appUtils';
import { getPriceString } from '../utils/pricing';
import { generateTileClickPayloadAndLogTelemetry } from '../utils/detailUtils';
import { getComponentXYOffset } from '../utils/reactUtils';

export interface IAppTileProps extends IAppDataItem {
    customCSSClass?: string;
    billingCountryCode: string;
    tileIndex: number;
}

export class AppTile extends SpzaComponent<IAppTileProps, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext;

    constructor(props: IAppTileProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext) {
        super(props, context);
    }

    componentWillMount() {
        let tileOnDemandLoadingService = this.context.getTileOnDemandLoadingService();
        tileOnDemandLoadingService.registerTileToLoad(this.props as IAppDataItem);
    }

    getApp(e: Event) {
        e.stopPropagation();

        const offset = getComponentXYOffset(this.refs['appTile' + this.props.appid]);
        const actionModifier = this.props.testDriveType ?
            Constants.Telemetry.ActionModifier.TestDrive :
            Constants.Telemetry.ActionModifier.CTAModal;

        const details = {
            id: this.props.appid,
            index: this.props.tileIndex,
            xOffset: offset.x,
            yOffset: offset.y
        };

        generateTileClickPayloadAndLogTelemetry(actionModifier, details);

        this.context.ctaCallback(this.props, this.props.testDriveType ? Constants.CTAType.TestDrive : Constants.CTAType.Create);
    }

    shouldComponentUpdate(nextProps: IAppTileProps, nextState: any) {
        return this.props.appid !== nextProps.appid ||
            this.props.shortDescription !== nextProps.shortDescription ||
            this.props.startingPrice !== nextProps.startingPrice ||
            this.props.iconURL !== nextProps.iconURL;
    }

    renderStartingPrice() {
        const startingPrice = this.props.startingPrice;

        if (startingPrice && startingPrice.pricingData &&
            startingPrice.pricingData !== PricingStates.NoPricingData &&
            startingPrice.pricingData !== PricingStates.NotAvailableInThisRegion) {
            if (startingPrice.pricingData === PricingStates.FreeApp) {
                return <div className='pricingText'>{this.context.loc('Pricing_Free')}</div>;
            }

            if (startingPrice.pricingData === PricingStates.AdditionalPurchasesRequired) {
                return <div className='additionalPurchaseText'>{this.context.loc('AdditionalPurchaseMayBeRequired')}</div>;
            }

            if (typeof startingPrice.pricingData === 'object') {
                return (
                    <div>
                        <p className='pricingText'>
                            {getPriceString(this.context,
                                startingPrice.pricingData,
                                this.props.billingCountryCode,
                                startingPrice.pricingData.currency,
                                3)}
                        </p>
                    </div>
                );
            }
        }

        return null;
    }

    renderBuiltForItem() {
        let builtFor = this.props.builtFor;

        if (this.props.primaryProduct && ProductEnum[this.props.primaryProduct] &&
            isOfficeNonSaasApp(ProductEnum[this.props.primaryProduct], this.props.products)) {
            // For office apps, we need to construct the string in this format : Word|Excel|PowerPoint|Project
            builtFor = '';

            for (let key in DataMap.products) {
                if (isOfficeNonSaasApp(key) && (this.props.products & DataMap.products[key].FilterID)) {
                    builtFor = builtFor ? (builtFor + ' | ' + DataMap.products[key].Title) : DataMap.products[key].Title;
                }
            }
        }

        return builtFor;
    }

    renderImpl() {
        let productString = ProductEnum[this.props.primaryProduct];
        let productData = DataMap.products[productString];
        let product = productData ? productData.UrlKey : productString;
        let isProductIgnored = ProductIgnoreList[productString];
        let appDetailUrl = this.context.buildHref(routes.appDetails, { productId: product, appid: this.props.appid }, { 'tab': 'Overview' });

        let middleContent =
            <div className='middleSection'>
                <div className='providerSection'>
                    <p className='c-subheading-6 provider'>{this.context.locParams('Tile_By', [this.props.publisher])}</p>
                    <p className='c-subheading-6 product' hidden={isProductIgnored}>{this.renderBuiltForItem()}</p>
                </div>
                <p className='c-paragraph-4 description'>{this.props.shortDescription}</p>
                <div className='startingPrice'>{this.renderStartingPrice()}</div>
            </div>;

        let ctaText = '';
        if (this.props.testDriveType) {
            ctaText = this.context.loc('TestDrive_Dialog', 'Test drive');
        } else if (this.props.startingPrice && this.props.startingPrice.pricingData !== PricingStates.NotAvailableInThisRegion) {
            ctaText = this.context.loc(this.props.actionString);
        }
        let ctaContent =
            <div className='tileFooter'>
                {
                    ctaText ?
                        <button className='c-button getButton' type='button'
                            onClick={this.getApp.bind(this)}>{ctaText}</button> : null
                }
            </div>;

        return (
            <BaseTile id={this.props.appid}
                iconURL={this.props.iconURL}
                iconBackgroundColor={this.props.iconBackgroundColor}
                title={this.props.title}
                middleContent={middleContent}
                ctaContent={ctaContent}
                detailUrl={appDetailUrl}
                customCSSClass={this.props.customCSSClass}
                tileIndex={this.props.tileIndex}
                ref={'appTile' + this.props.appid} />
        );
    }
}

(AppTile as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    getTileOnDemandLoadingService: React.PropTypes.func
};