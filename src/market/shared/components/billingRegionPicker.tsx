import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { IBuildHrefContext, ILocContext, ICommonContext } from '../../shared/interfaces/context';
// import { billingCountries } from 'utils/pricing';
import { billingCountries } from './../../mac/utils/pricing';
// import { urlBack, routes } from 'routerHistory';
let { urlBack, routes } = require('./../../mac/routerHistory');
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../../shared/Models';
import { getWindow } from '../../shared/services/window';
import { Constants } from '../../shared/utils/constants';
import Animation from '../../shared/components/animation';

export class BillingRegionPicker extends SpzaComponent<any, any> {
    context: IBuildHrefContext & ILocContext & ICommonContext;

    constructor(props: any, context: IBuildHrefContext & ILocContext & ICommonContext) {
        super(props, context);

        this.state = {
            loading: false
        };
    }

    renderColumns(index: number) {
        let chunkSize = Math.ceil(billingCountries.length / 4);
        let start = index * chunkSize;
        return billingCountries.slice(start, start + chunkSize).map((value: any, key: number) => {
            return (
                <li key={key}>
                    <p className='c-hyperlink regionLink'
                        onClick={() => {
                            const homeURL = this.context.buildHref(routes.home,
                                null,
                                {
                                    category: null,
                                    industry: null,
                                    product: null,
                                    search: null
                                });

                            const payload: ITelemetryData = {
                                page: getWindow().location.href,
                                action: Constants.Telemetry.Action.Click,
                                actionModifier: Constants.Telemetry.ActionModifier.BillingCountry,
                                details: JSON.stringify({ 'country': value.name })
                            };
                            SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);

                            this.setState({
                                loading: true
                            });

                            this.props.setBillingCountry(value.countryCode)
                                .then(() => {
                                    urlBack(homeURL);
                                })
                                .catch((err: any) => {
                                    urlBack(homeURL);
                                });
                        }}>{value.name}</p>
                </li>
            );
        });
    }

    renderAllRegions() {
        let regions: JSX.Element[] = [];

        for (let i = 0; i < 4; ++i) {
            regions.push(
                <div className='column' key={i}>{this.renderColumns(i)}</div>
            );
        }

        return regions;
    }

    renderImpl() {
        return (
            <div className='spza_regions billingRegionPicker'>
                <h3 className='c-heading-3 regionTitle'>{this.context.loc('SelectBillingRegion')}</h3>
                {
                    this.state.loading ?
                        <div className='c-animation'>
                            <Animation isCircular={true} />
                        </div> :
                        <div className='details'>{this.renderAllRegions()}</div>
                }
            </div>
        );
    }
}

(BillingRegionPicker as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};