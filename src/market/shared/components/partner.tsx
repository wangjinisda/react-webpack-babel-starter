import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IBuildHrefContext, ICommonContext, ILocContext } from '../interfaces/context';
import { urlPush, routes } from '../routerHistory';
import { Constants } from '../utils/constants';
import { ITelemetryData } from './../Models';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';

export default class Partners extends SpzaComponent<any, any> {
    context: IBuildHrefContext & ICommonContext & ILocContext;

    constructor(props: any, context: any) {
        super(props, context);
    }

    navigateToForm(newPath: string) {
        urlPush(newPath, true);
    }

    navigateToAppform() {
        let currentUri = 'https://' + window.location.hostname + '/partners';
        this.navigateToForm(this.context.buildHref(routes.listApps, null, { breadcrumbUrl: encodeURIComponent(currentUri) }));
    }

    navigateToPartnersform() {
        let currentUri = 'https://' + window.location.hostname + '/partners';
        this.navigateToForm(this.context.buildHref(routes.listPartners, null, { breadcrumbUrl: encodeURIComponent(currentUri) }));
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        document.getElementsByTagName('title')[0].innerHTML = this.context.loc('marketing_pageTitle', 'List on AppSource – Microsoft AppSource');
    }

    renderImpl() {
        return (
            <div className='context-partners-page'>
                <a href='#maincontent' className='spza_defaultText' tabIndex={1}>Skip to main content</a>
                <section id='maincontent' className='c-hero f-medium f-x-center f-y-center context-software theme-dark'>
                    <picture>
                        <img src='/images/hero-banner-500.png' alt=''/>
                    </picture>

                    <div>
                        <div>
                            <h1 className='c-heading'>Build your business faster</h1>
                            <p className='c-subheading'>
                                Reach more customers for your business apps
                            </p>
                            <p className='c-paragraph'>
                                AppSource is the premier destination to market and distribute your apps, content packs,
                                and add-ins—all backed by a brand that billions of customers already know and trust.
                                Showcase your apps that work with Dynamics, Office, Power BI, Azure, and more.
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
                            <h1 className='c-heading-3'>The premier destination for top apps</h1>
                        </div>

                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Drive more leads</h1>
                            <p className='c-paragraph-3'>
                                Increase reach, discoverability, and usage of your apps.The Microsoft salesforce and other selling resources help
                                your apps stand out.
                            </p>
                        </div>
                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Focus on your idea, not the infrastructure</h1>
                            <p className='c-paragraph-3'>
                                Scale from few to many users seamlessly using a cloud platform that grows
                                with you—and infrastructure built to support app consumption.
                            </p>
                        </div>
                        <div data-grid='col-4'>
                            <h1 className='c-heading-4'>Optimize your apps</h1>
                            <p className='c-paragraph-3'>
                                Leverage the full Microsoft cloud platform to easily add capabilities and business value to your apps—from innovative,
                                intelligent features to enhanced security and performance.
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
                            <img src='/images/buss-app-img.png' alt='bussiness-app' />
                            <h1 className='c-heading-4'>Build your business apps – let business users try it</h1>
                            <p className='c-paragraph-3'>
                                Develop your line of business app, whether it’s for a specific industry,
                                 process, or department like HR, finance, marketing or operations.
                                 Assure customers that your app is just the app they’re looking for. Let them try it out with a free trial.
                            </p>
                            <p className='c-paragraph-3'><a className='c-hyperlink' target='_blank' href='http://go.microsoft.com/fwlink/?LinkID=820705&clcid=0x409' id='app-btn'>
                                <i className='right-tringle'></i>  App review guidelines</a></p>
                        </div>

                        <div data-grid='col-1' />

                        <div data-grid='col-4'>
                            <img src='/images/provide-access-img.png' alt='provide-access' />
                            <h1 className='c-heading-4'>Grow your business – offer your implementation services</h1>
                            <p className='c-paragraph-3'>
                                Capitalize on your industry and consulting expertise.
                                 Market your services, connect with customers, implement SaaS business apps, differentiate your practice and help drive innovation.
                            </p>
                            <p className='c-paragraph-3'><a className='c-hyperlink' target='_blank' href='http://go.microsoft.com/fwlink/?LinkId=828734&clcid=0x409' id='app-btn'>
                                <i className='right-tringle'></i>  Partner listing guidelines</a></p>
                        </div>

                        <div data-grid='col-1' />

                    </div>
                </section>

                <section className='section three theme-dark'>
                    <div data-grid='container pad-12x'>
                        <div data-grid='col-3'></div>
                        <div data-grid='col-6'>
                            <h1 className='c-heading-3'>Submit to AppSource today</h1>
                            <p className='c-paragraph-3'>
                                The AppSource team will validate that your solution meets the review guidelines —- then we’ll reach out to you with next steps.
                            </p>
                            <a onClick={this.navigateToAppform.bind(this) } className='c-call-to-action c-glyph partnerSubmitButton'>SUBMIT YOUR APP</a>
                            <a onClick={this.navigateToPartnersform.bind(this) } className='c-call-to-action c-glyph partnerSubmitButton'>LIST AS PARTNER</a>
                        </div>
                        <div data-grid='col-3'></div>
                    </div>
                </section>
            </div>
        );
    }
}

(Partners as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
