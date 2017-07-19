import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { IPricingInformation, ISimpleSKU } from '../Models';
import { IBillingCountry } from '../../shared/Models';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext } from '../../shared/interfaces/context';
import { renderNotAvailablePriceUI } from '../utils/pricing';
import { getPriceString } from '../../shared/utils/pricing';

export interface ISimplePlanPricingProps {
    pricing: IPricingInformation;
    billingCountry: IBillingCountry;
}

export class SimplePlanPricing extends SpzaComponent<ISimplePlanPricingProps, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext;

    private pricing: IPricingInformation;

    constructor(props: ISimplePlanPricingProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext) {
        super(props, context);

        this.pricing = this.props.pricing;
    };

    componentWillReceiveProps(nextProps: ISimplePlanPricingProps, nextState: any) {
        if (this.props.pricing !== nextProps.pricing) {
            this.pricing = nextProps.pricing;
        }
    }

    renderImpl() {
        if (!this.pricing) {
            return (<div>{this.context.loc('Loading')}</div>);
        }

        let skus = this.pricing.skus as ISimpleSKU[];
        let showPriceColumn = false;
        for (let i = 0, len = skus.length; i < len; i++) {
            if (skus[i].price) {
                showPriceColumn = true;
                break;
            }
        }

        return (
            skus.length === 0 ?
                renderNotAvailablePriceUI(this.context)
                : <div className='pricing simplePlanPricing'>
                    <div className='c-table f-divided'>
                        <table>
                            <thead>
                                <tr>
                                    <th className='f-sortable' colSpan= {1} aria-sort='none'>{this.context.loc('SoftwarePlan')}</th>
                                    <th className='f-sortable' colSpan= {1} aria-sort='none'>{this.context.loc('Description')}</th>
                                    {
                                        showPriceColumn ?
                                            <th className='f-sortable' colSpan= {1} aria-sort='none'>{this.context.loc('Price')}</th>
                                            : null
                                    }
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    skus.map(sku => {
                                        return (
                                            <tr className='pricingListItem'>
                                                <td className='title'>{sku.title}</td>
                                                <td className='description' dangerouslySetInnerHTML={{ __html: sku.description }}></td>
                                                {
                                                    showPriceColumn ?
                                                        <td className='price'>{getPriceString(this.context, sku.price, this.props.billingCountry.countryCode,
                                                            this.props.billingCountry.currency, 3)}</td>
                                                        : null
                                                }
                                            </tr>
                                        );
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
        );
    }
}

(SimplePlanPricing as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};