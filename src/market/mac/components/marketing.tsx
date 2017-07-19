import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { ICommonContext, ILocContext } from '../../shared/interfaces/context';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from '../../shared/Models';
import { getWindow } from '../../shared/services/window';
import { Constants } from '../../shared/utils/constants';

export class Marketing extends SpzaComponent<any, any> {
    context: ICommonContext & ILocContext;

    constructor(props: any, context: any) {
        super(props, context);
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        document.getElementsByTagName('title')[0].innerHTML = this.context.loc('mac_marketing_pageTitle', 'Sell – Microsoft Azure Marketplace');
    }

    renderImpl() {
        return (
            <div className='context-partners-page'>
                <a href='#maincontent' className='spza_defaultText' tabIndex={1}>Skip to main content</a>
                <section id='maincontent' className='c-hero f-medium f-x-center f-y-center context-software theme-dark-top'>
                    <div>
                        <div>
                            <h1 className='c-heading'>Grow your cloud business with Azure Marketplace</h1>
                            <p className='c-subheading'>
                                Reach more customers for your cloud solutions
                            </p>
                            <p className='c-paragraph'>
                                Azure Marketplace is a powerful channel to market and sell your cloud solutions certified to run on Azure.
                                Showcase virtual machine images and solution templates and get access to our top Azure customers worldwide.
                            </p>
                            <div>
                                <a className='c-call-to-action c-glyph' href='#getStarted'>GET STARTED</a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className='section one'>
                    <div data-grid='container stack-2 pad-12x'>
                        <div data-grid='col-12'>
                            <h1 className='c-heading-3'>Premier destination for cloud solutions optimized to run on Azure</h1>
                        </div>

                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Drive more leads</h1>
                            <p className='c-paragraph-3'>
                                Generate leads by giving customers and prospects the ability to spin up live instances of your applications running on Azure in just minutes.
                            </p>
                        </div>
                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Promote your solutions to enterprise</h1>
                            <p className='c-paragraph-3'>
                                Gain access to Microsoft enterprise sellers using the Azure Marketplace as a selling tool.
                              Participate in our co-marketing oppotunities to reach new customers and markets worldwide.
                            </p>
                        </div>
                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Grow revenue</h1>
                            <p className='c-paragraph-3'>
                                Leverage rich commerce capabilities and get insights into how your business is performing on Azure Marketplace.
                            </p>
                        </div>
                    </div>
                </section>

                <section className='section two'>
                    <div data-grid='container stack-2 pad-12x'>
                        <div id='getStarted' data-grid='col-12'>
                            <h1 className='c-heading-3'>Get started</h1>
                        </div>

                        <div data-grid='col-1' />

                        <div data-grid='col-4'>
                            <img src='/images/provide-access-img.png' alt='bussiness-app' />
                            <h1 className='c-heading-4'>Publish your solution</h1>
                            <p className='c-paragraph-3'>
                                Microsoft Azure Certified lets your customers know you have a world-class cloud solution.
                                If you are an independent software vendor (ISV) and want to sell your Azure optimized solution on the Azure Marketplace,
                                learn more on the next steps to get your application certified and listed on Azure Marketplace.
                            </p>
                            <p className='c-paragraph-3'><a className='c-hyperlink' target='_blank'
                                href='https://aka.ms/sellerguide' id='app-btn'>
                                <i className='right-tringle'></i>  Seller Guide</a></p>
                        </div>

                        <div data-grid='col-1' />

                        <div data-grid='col-4'>
                            <img src='/images/buss-app-img.png' alt='provide-access' />
                            <h1 className='c-heading-4'>Get more leads with Azure test drive</h1>
                            <p className='c-paragraph-3'>
                                Test drives are ready to go environments of pre-configured virtual machines that allow a customer to evaluate partner solutions.
                                Test drives are a great way to give customers a superfast path to experience your products
                                running in a live cloud environment while also providing sales teams a handy demo tool.
                            </p>
                            <p className='c-paragraph-3'><a className='c-hyperlink' target='_blank'
                                href='https://azuremarketplace.azureedge.net/documents/azure-marketplace-test-drive-program.pdf' id='app-btn'>
                                <i className='right-tringle'></i>  Get test drive program overview (PDF)</a></p>
                        </div>

                        <div data-grid='col-1' />

                    </div>
                </section>

                <section className='section three theme-dark'>
                    <div data-grid='container pad-12x'>
                        <div data-grid='col-3'></div>
                        <div data-grid='col-6'>
                            <h1 className='c-heading-3'>Apply to get your solution pre-approved</h1>
                            <p className='c-paragraph-3'>
                                The Azure Marketplace team will validate that your solution meets the guidelines - then we'll reach out to you with next steps.
                            </p>
                            <a href='https://azure.microsoft.com/en-us/marketplace/programs/certified/apply/' target='_blank'
                                className='c-call-to-action c-glyph partnerSubmitButton'>SUBMIT YOUR APP</a>
                        </div>
                        <div data-grid='col-3'></div>
                    </div>
                </section>
            </div>
        );
    }
}

(Marketing as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
