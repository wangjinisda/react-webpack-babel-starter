import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { IAppDataItem } from '../Models';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext } from '../../shared/interfaces/context';
// import { routes } from 'routerHistory';
let { routes } = require('./../../mac/routerHistory');
import { BaseTile } from '../../shared/components/baseTile';
import { getPriceString } from '../../shared/utils/pricing';
import { Constants } from '../../shared/utils/constants';
import { PricingStates } from '../../shared/Models';
import { generateTileClickPayloadAndLogTelemetry } from '../../shared/utils/detailUtils';
import { getComponentXYOffset } from '../../shared/utils/reactUtils';

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

    getShortDescription() {
        // Start Mooncake : fix Chinese short description display overtext issue 
        // Use 55 for description cut off length for Chinese or mixed characters
        if (!this.props.shortDescription) {
            return this.props.shortDescription;
        }

        let regexp = new RegExp('[\\u4e00-\\u9fa5]+', 'gi');
        let description = this.props.shortDescription;
        let cutLength = 110;
        if (regexp.test(description)) {
            let chineseCutLength = cutLength / 2;
            return (description.length > chineseCutLength)
                ? description.substr(0, chineseCutLength - 2) + '...'
                : description;
        }

        return (description.length > cutLength)
            ? description.substr(0, cutLength - 3) + '...'
            : description;
        // End Mooncake
    }

    getStartingPrice() {
        if (this.props.startingPrice && this.props.startingPrice.pricingData &&
            this.props.startingPrice.pricingData !== PricingStates.NoPricingData) {
            if (this.props.startingPrice.pricingData === PricingStates.BYOL) {
                return <div className='pricingText'>{this.context.loc('BYOL_Long')}</div>;
            }

            if (this.props.startingPrice.pricingData === PricingStates.SolutionTemplate) {
                return <div className='pricingText'>{this.context.loc('PriceVaries')}</div>;
            }

            if (this.props.startingPrice.pricingData === PricingStates.WebApp) {
                return (
                    <div>
                        <p className='pricingText'>
                            {this.context.loc('Pricing_FreeApp')}
                        </p>
                        <p className='startingAtText'>
                            {this.context.loc('PlusAzureInfrastructureCost')}
                        </p>
                    </div>
                );
            }

            if (typeof this.props.startingPrice.pricingData === 'object') {
                return (
                    <div>
                        <p className='startingAtText'>
                            {this.context.loc('Mac_SoftwarePlansStartAt')}
                        </p>
                        <p className='pricingText'>
                            {getPriceString(this.context,
                                this.props.startingPrice.pricingData,
                                this.props.billingCountryCode,
                                this.props.startingPrice.pricingData.currency,
                                3)}
                        </p>
                    </div>
                );
            }

            return (
                <div className='notAvailable'>
                    <div className='globe'>
                        <img className='globeThumbnail' src='/images/Globe_BlackIcon_200px.png'></img>
                    </div>
                    <p className='notAvailableText'>
                        {this.context.loc('MacAppTileText_PricingNotAvailable')}
                    </p>
                </div>
            );
        }

        return null;
    }

    renderImpl() {
        const appDetailUrl = this.context.buildHref(routes.appDetails, { appid: this.props.appid }, { 'tab': 'Overview' });

        // TODO: add image sprite

        let middleContent =
            <div className='middleSection'>
                <div className='providerSection'>
                    <p className='c-subheading-6 provider'>{this.context.locParams('Tile_By', [this.props.publisher])}</p>
                </div>
                <p className='c-paragraph-4 description'>{this.getShortDescription()}</p>
                <div className='startingPrice'>{this.getStartingPrice()}</div>
            </div>;

        let ctaText = '';
        if (this.props.testDriveType) {
            ctaText = this.context.loc('Test_Drive');
        } else if (this.props.startingPrice && this.props.startingPrice.hasFreeTrial) {
            ctaText = this.context.loc('Pricing_Free_Trial_Tile');
        } else if (this.props.startingPrice && this.props.startingPrice.pricingData !== PricingStates.NotAvailableInThisRegion) {
            ctaText = this.context.loc(this.props.actionString);
        }
        let ctaContent = this.props.startingPrice ?
            <div className='tileFooter'>
                {
                    !ctaText
                        ? <p className='disabledButton'>{this.context.loc('MacAppTileButton_PricingNotAvailable')}</p>
                        : <button className='c-button getButton' type='button'
                            onClick={this.getApp.bind(this)}>{ctaText}</button>
                }
            </div>
            : null;

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