import * as React from 'react';
import Animation from '../../../shared/components/animation';
import { IAppDetailInformation, IPricingInformation, ISKU, IVMSKU, ISimpleSKU, IAppDataItem } from '../../Models';
import { ConsentModal, IConsentModal } from '../../../shared/components/modals/consentModal';
import { publishLead } from '../../../shared/utils/appUtils';
import { Constants } from '../../../shared/utils/constants';
import { getBillingCountryByCountryCode, getThirdPartyStartingPrice, sortVMSKUsByStartingPrice } from '../../utils/pricing';
import { getPriceString } from '../../../shared/utils/pricing';
import { PlanPricingType, MACPrivacyURL } from '../../utils/constants';
import * as DetailUtils from '../../../shared/utils/detailUtils';
import { ILocContext, ILocParamsContext, ICommonContext } from '../../../shared/interfaces/context';
import { getAppConfig } from '../../../shared/services/init/appConfig';
import { DataMap } from '../../utils/dataMapping';
import { getDataMapString } from '../../utils/appUtils';
import { IStartingPrice, PricingStates } from '../../../shared/Models';

export interface ICTAModalProps extends IConsentModal {
    billingCountryCode: string;
    options: any;
    appInfo: IAppDataItem;
    pricingInformation: IPricingInformation;
    fetchPricing(appId: string): void;
}

export class CTAModal extends ConsentModal {
    context: ILocContext & ILocParamsContext & ICommonContext;

    private ctaModalProps: ICTAModalProps;
    private detailInformation: IAppDetailInformation;
    private startingPrice: IStartingPrice;
    private skuList: ISKU[];
    private skuDescription: string;

    constructor() {
        super();
    }

    componentWillMount() {
        // TBD: move the logic to constructor.
        this.ctaModalProps = this.props as ICTAModalProps;
        if (!this.ctaModalProps.appInfo.detailInformation) {
            this.ctaModalProps.fetchAppDetails(this.ctaModalProps.appInfo);
        }

        if (!this.ctaModalProps.pricingInformation) {
            this.ctaModalProps.fetchPricing(this.ctaModalProps.appInfo.appid);
        }

        this.processAppInformation(this.ctaModalProps.appInfo.detailInformation, this.ctaModalProps.appInfo.planPricingType, this.ctaModalProps.pricingInformation);
    }

    componentWillReceiveProps(nextProps: ICTAModalProps, nextState: any) {
        this.ctaModalProps = this.props as ICTAModalProps;
        if (this.ctaModalProps.appInfo.detailInformation !== nextProps.appInfo.detailInformation
            || this.ctaModalProps.pricingInformation !== nextProps.pricingInformation) {
            let detailInformation = nextProps.appInfo.detailInformation as IAppDetailInformation;

            if (detailInformation && nextProps.pricingInformation) {
                this.processAppInformation(detailInformation, nextProps.appInfo.planPricingType, nextProps.pricingInformation);
            }
        }
        this.ctaModalProps = nextProps;
    }

    componentDidMount(): void {
        // Override this method to disable the behavior in the base class.
        // Make sure the CTA modal will display if the app doesn't have licenseTermURL
        // but has SKUs which means the app is not an AAD app.
        return null;
    }

    processAppInformation(detailInformation: IAppDetailInformation, planPricingType: PlanPricingType, pricingInformation: IPricingInformation): void {
        if (!detailInformation) {
            return;
        }

        if (this.props.appInfo
            && !this.props.appInfo.licenseTermsUrl
            && !(pricingInformation && pricingInformation.skus && pricingInformation.skus.length > 0)) {
            // If the app doesn't have licenseTermsUrl and doesn't have SKUs,
            // it means the app is an AAD app.
            // Then just directly redirect to the handoff URL without showing the CTA modal.
            this.handleContinue(!this.isAADApp());
            return;
        }

        this.detailInformation = detailInformation;

        if (pricingInformation) {
            this.skuList = pricingInformation.skus;

            if (this.skuList) {
                if (planPricingType === PlanPricingType.VM) {
                    this.skuList.forEach(sku => {
                        let vmSKU = sku as IVMSKU;
                        vmSKU.startingPrice = getThirdPartyStartingPrice(vmSKU);
                    });

                    sortVMSKUsByStartingPrice(this.skuList as IVMSKU[]);
                } else {
                    this.skuList.sort((a, b) => {
                        let simpleSKUA = a as ISimpleSKU;
                        let simpleSKUB = b as ISimpleSKU;
                        return (simpleSKUA.price && simpleSKUB.price) ? (simpleSKUA.price.value - simpleSKUB.price.value) : 0;
                    });
                }
            }

            if (this.skuList && this.skuList.length) {
                let skuId = this.skuList[0].id;
                if (this.ctaModalProps.options && this.ctaModalProps.options.skuId) {
                    skuId = this.ctaModalProps.options.skuId;
                } else {
                    let highestFreeTrial = this.skuList.reduce((acc: any, v: any) => {
                        if (v.hasFreeTrial) {
                            let price = v.price || v.startingPrice;
                            if (price) {
                                if (!acc) {
                                    return v;
                                } else {
                                    let p = acc.price || acc.startingPrice;
                                    if (p.value < price.value) {
                                        return v;
                                    }
                                }
                            }
                        }
                    }, null);
                    if (highestFreeTrial) {
                        skuId = highestFreeTrial.id;
                    }
                }
                this.handleSKUChange(skuId, planPricingType);
            }
        }

        // Set the App's privacy URL so that the consent text is updated.
        this.setState({ appPrivacyPolicyUrl: this.detailInformation.PrivacyPolicyUrl });
    }

    handleSKUChange(skuID: string, pricingType: PlanPricingType) {
        let currentSKU = this.skuList.filter(item => item.id === skuID)[0];
        if (pricingType === PlanPricingType.VM) {
            let vmSKU = currentSKU as IVMSKU;
            this.skuDescription = vmSKU.summary;
            this.startingPrice = getThirdPartyStartingPrice(vmSKU);
        } else {
            let simpleSKU = currentSKU as ISimpleSKU;
            if (this.ctaModalProps.appInfo.startingPrice) {
                this.startingPrice = this.ctaModalProps.appInfo.startingPrice;
                this.skuDescription = this.ctaModalProps.appInfo.shortDescription;
            } else {
                this.skuDescription = simpleSKU.summary ? simpleSKU.summary : simpleSKU.description;
            }
        }

        this.setState({
            sku: currentSKU
        });
    }

    renderSKUs() {
        if (!this.skuList) {
            return null;
        }

        let context = this.context as any;
        let skuId: string = null;
        if (this.state.sku && this.state.sku.id) {
            skuId = this.state.sku.id;
        } else if (this.ctaModalProps.options && this.ctaModalProps.options.skuId) {
            skuId = this.ctaModalProps.options.skuId;
        }
        return this.ctaModalProps.appInfo.handoffURL ?
            null
            : (
                <div className='plan'>
                    <h2>{context.loc('SoftwarePlan')}</h2>
                    {
                        this.skuList.length === 1
                            ? (
                                <div className='planTitle'>{this.skuList[0].title}</div>
                            )
                            : (
                                <select className='c-select' value={skuId} onChange={(event: any) => {
                                    let currentSKU = this.skuList.filter(item => item.id === event.target.value)[0];

                                    let detailsObject = {
                                        SKUChosen: currentSKU.title
                                    };
                                    DetailUtils.generateFilterClickPayloadAndLogTelemetry(
                                        DetailUtils.OwnerType.App,
                                        this.ctaModalProps.appInfo.appid,
                                        Constants.Telemetry.ActionModifier.ChooseSKU,
                                        detailsObject);

                                    this.handleSKUChange(event.target.value, this.ctaModalProps.appInfo.planPricingType);
                                }}>
                                    {
                                        this.skuList.map((item: any, index: number) => {
                                            return (
                                                <option value={item.id} key={index}>{item.title}</option>
                                            );
                                        })
                                    }
                                </select>
                            )}
                </div>);
    }

    renderConsent() {
        let context = this.context as any;
        return ((this.state.sku && this.state.sku.leadgenEnabled) || this.props.appInfo.leadgenEnabled) ?
            (
                this.ctaModalProps.billingCountryCode !== 'us' ?
                    (<div className='consentContent'>
                        <div className='c-checkbox termCheckbox'>
                            <label className='c-label checkboxLabel'>
                                <input autoFocus type='checkbox' checked={this.state.isChecked} onChange={this.onChange} />
                                <span></span>
                            </label>
                        </div>
                        <div className='termLinks consentTerms' dangerouslySetInnerHTML={{
                            __html: context.locParams('MAC_TRY_Disclaimer_OutsideUS',
                                [this.props.appInfo.licenseTermsUrl, MACPrivacyURL])
                        }}>
                        </div>
                    </div>) :
                    (<div className='consentContent'>
                        <div className='termLinks' dangerouslySetInnerHTML={{
                            __html: context.locParams('MAC_TRY_Disclaimer_InsideUS',
                                [this.props.appInfo.licenseTermsUrl, MACPrivacyURL])
                        }}>
                        </div>
                    </div>)
            )
            : (
                <div className='consentContent'>
                    <div className='termLinks' dangerouslySetInnerHTML={{
                        __html: context.locParams('MAC_TRY_Disclaimer_NoLeadGen',
                            ['<a href=\'' + this.props.appInfo.licenseTermsUrl + '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms2') + '</a>',
                            '<a href=\'' + this.state.appPrivacyPolicyUrl + '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_PrivacyPolicy') + '</a>',
                            '<a href=\'' + MACPrivacyURL + '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms') + '</a>'])
                    }}>
                    </div>
                </div>
            );
    }

    processLeadGenPublishing(): void {
        // If the CTA is for VM, a SKU ID suffix will be appended to the leadgen app id.
        if ((this.state.sku && this.state.sku.leadgenEnabled) || this.props.appInfo.leadgenEnabled) {
            publishLead(this.props.userInfo,
                this.props.accessToken,
                this.props.appInfo ? this.props.appInfo.appid : null,
                null,
                this.props.appInfo ? this.props.appInfo.primaryProduct : null,
                null,
                (this.state.sku && this.state.sku.id) ? this.state.sku.id : null);
        }
    }

    processHandoffURLAndTitle(): string {
        let url = '';

        if (this.props.appInfo.handoffURL) {
            url = this.props.appInfo.handoffURL;
        } else if (this.state.sku) {
            let sku = this.state.sku as ISKU;
            url = sku.handoffURL;
        }

        // Start Mooncake
        let index = url.indexOf('#create');
        if (index >= 0) {
            const existingQueryIndex = url.indexOf('?');
            const separator = (existingQueryIndex > 0 && existingQueryIndex < index) ? '&' : '?';
            url = [url.slice(0, index), separator + 'referrer=azmktplc:' + getAppConfig('correlationId'), url.slice(index)].join('');
        }
        // End Mooncake

        this.handoffTitle = this.props.appInfo.title;

        return url;
    }

    getTelemetryDetailsData() {
        if (!this.props.appInfo) {
            return '';
        }

        const details = {
            title: this.props.appInfo.title,
            publisher: this.props.appInfo.publisher,
            actionString: this.props.appInfo.actionString,
            categories: getDataMapString(DataMap.category, this.props.appInfo, 'title'),
            leadGenEnabled: this.props.appInfo.leadgenEnabled,
            ctaType: 'Continue',
            clickedConsent: this.state.isChecked,
            SKUChosen: this.state.sku ? this.state.sku.title : ''
        };

        return JSON.stringify(details);
    }

    getStartingPriceElement() {
        let result: JSX.Element = null;
        let context = this.context as any;
        let billingCountry = getBillingCountryByCountryCode(this.ctaModalProps.billingCountryCode);

        if (!this.startingPrice) {
            this.startingPrice = this.props.appInfo.startingPrice;
        }

        if (this.startingPrice && this.startingPrice.pricingData) {
            if (this.startingPrice.pricingData === PricingStates.BYOL) {
                result =
                    <span className='startingPrice' dangerouslySetInnerHTML={{
                        __html: this.context.locParams('TwoConsecutiveStrings',
                            [context.loc('BYOL_Long'),
                            '<span class=\'infraCosts\'>' +
                            this.context.loc('PlusAzureInfrastructureCost') + '</span>'])
                    }}>
                    </span>;
            } else if (this.startingPrice.pricingData === PricingStates.SolutionTemplate) {
                result =
                    <span className='startingPrice'>
                        {context.loc('CTA_SolutionTemplatePricing')}
                    </span>;
            } else if (this.startingPrice.pricingData === PricingStates.WebApp) {
                result =
                    <span className='startingPrice' dangerouslySetInnerHTML={{
                        __html: this.context.locParams('TwoConsecutiveStrings',
                            [context.loc('Pricing_FreeApp'),
                            '<span class=\'infraCosts\'>' +
                            this.context.loc('PlusAzureInfrastructureCost') + '</span>'])
                    }}>
                    </span>;
            } else {
                let startingPriceContent: string = null;
                let priceString = getPriceString(
                    this.context,
                    this.startingPrice.pricingData,
                    this.ctaModalProps.billingCountryCode,
                    billingCountry.currency,
                    3);

                if (this.state.sku && this.state.sku.hasFreeTrial) {
                    startingPriceContent = this.context.locParams('Pricing_Free_Trial_CTA', [priceString]);
                } else {
                    startingPriceContent = context.locParams('StartingAtPrice', [priceString]);
                }

                result =
                    <span className='startingPrice'>
                        {startingPriceContent}
                    </span>;
            }
        }

        return result;
    }

    renderImpl() {
        let context = this.context as any;
        let startingPriceContent = this.getStartingPriceElement();

        return this.isAADApp() ? null : (
            <div role='dialog' tabIndex={-1} className='consentModalClass ctaModal'>
                <div className='prompContainer'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    {
                        this.state.showAnimation ?
                            <div>
                                <div className='contentHeader animation'>
                                    {context.locParams('TRY_Redirect', [this.handoffTitle])}
                                </div>
                                <Animation />
                            </div> :
                            <div className='content'>
                                <div className='left'>
                                    {/* Start Mooncake */}
                                    <div className='contentHeader'>{this.shouldSkipSignIn() ? context.loc('CTA_AccessNow') : context.loc('CTA_CreateAzure')}</div>
                                    {/* End Mooncake */}
                                    <div className='trunk'>
                                        <div className='miniIcon'>
                                            {<img className='thumbnail' src={this.props.appInfo.iconURL} />}
                                        </div>
                                        <div className='trunkContent'>
                                            <span className='header'>{this.props.appInfo.title}</span>
                                            <span className='subHeader'>{context.locParams('Tile_By', [this.props.appInfo.publisher])}</span>
                                        </div>
                                        {
                                            this.detailInformation ? (
                                                <div className='detail'>
                                                    {this.renderSKUs()}
                                                    <div className='planContent'>
                                                        {
                                                            startingPriceContent ?
                                                                <div className='row'>
                                                                    <label>{context.loc('Pricing:')}</label>
                                                                    <div>
                                                                        {startingPriceContent}
                                                                    </div>
                                                                </div>
                                                                : null
                                                        }
                                                        {(this.skuDescription || this.props.appInfo.shortDescription) ?
                                                            <div className='row'>
                                                                <label>{context.loc('Details:')}</label>
                                                                <div>
                                                                    {this.skuDescription ?
                                                                        this.skuDescription :
                                                                        this.props.appInfo.shortDescription
                                                                    }
                                                                </div>
                                                            </div> : null
                                                        }
                                                    </div>
                                                </div>
                                            ) : (<Animation />)
                                        }
                                    </div>
                                </div>
                                <div className='right'>
                                    <div className='terms'>
                                        {this.renderConsent()}
                                    </div>
                                    <div className='consentBottomBar'>
                                        <button name='button' className='c-button requestButton' type='submit'
                                            onClick={() => { this.handleContinue(true, this.shouldGenerateLead()); }}>
                                            {context.loc('Dialog_Continue')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                    }
                </div>
            </div>
        );
    }

    shouldGenerateLead(): boolean {
        if ((this.state.sku && this.state.sku.leadgenEnabled) || this.props.appInfo.leadgenEnabled) {
            if (this.ctaModalProps.billingCountryCode === 'us') {
                // If it's in US, it means implicit consent is used, then generate the lead.
                return true;
            } else {
                if (this.state.isChecked) {
                    // If it's outside of US, it means explicit consent is used.
                    // Then only when the consent box is checked, generate the lead.
                    return true;
                }
            }
        }
        return false;
    }

    // Start Mooncake
    shouldSkipSignIn(): boolean {
        return (this.props.appInfo.actionString === Constants.ActionStrings.AccessNow);
    }
    // End Mooncake

    isAADApp(): boolean {
        return this.props.appInfo.appid.indexOf('aad.') === 0;
    }
}

(CTAModal as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};