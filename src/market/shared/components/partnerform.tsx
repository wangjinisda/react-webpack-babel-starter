import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IPartnerListingInfo, ITelemetryData } from '../Models';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { DataMap } from '../utils/dataMapping';
import { getWindow } from '../services/window';
import { ICommonContext, ILocContext } from '../interfaces/context';

import * as appPartnerRestClient from '../services/http/appPartnerRestClient';

export class PartnerListingForm extends SpzaComponent<null, any> {
    context: ICommonContext & ILocContext;
    private partnersform: IPartnerListingInfo;
    private instrument = SpzaInstrumentService.getProvider();

    // TODO: check if there is a better way 
    // not setting defaults blows up, the control bindings
    setDefaults() {
        this.partnersform = {
            firstName: '',
            lastName: '',
            email: '',
            role: '',
            company: '',
            website: '',
            msEmails: '',
            companyListings: '',
            appListings: '',
            industries: [],
            type: 'partnerlisting',
            referral: ''
        };
    }

    // Sets the state with defaults
    constructor(props: any, context: any) {
        super(props, context);
        this.setDefaults();
        // todo: state should be typed
        this.state = {
            isEnabled: false,
            showSuccessPrompt: false
        };
        this.onChange = this.onChange.bind(this);
        this.onReferralSelectionChange = this.onReferralSelectionChange.bind(this);
    }

    componentWillMount() {
        this.checkMandatoryFields();
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        document.getElementsByTagName('title')[0].innerHTML = this.context.loc('listAsPartner_pageTitle', 'List as partner – Microsoft AppSource');
    }

    onChange(id: string, e: any) {
        this.partnersform[id] = e.target ? e.target.value : '';
        this.checkMandatoryFields();
    }

    // enables disables the submit button based on top mandatory field values
    checkMandatoryFields() {
        let enabled = this.partnersform.firstName &&
            this.partnersform.lastName &&
            this.partnersform.email &&
            this.partnersform.company &&
            this.partnersform.website &&
            this.partnersform.appListings;
        this.setState({
            isEnabled: enabled
        });
    }

    onIndustrySelected(event: any) {
        if (event.target.checked) {
            this.partnersform.industries.push(event.target.value);
        }
        if (!event.target.checked) {
            let index = this.partnersform.industries.indexOf(event.target.value);
            if (index !== -1) {
                this.partnersform.industries.splice(index, 1);
            }
        }
    }

    renderIndustriesList() {
        let list: JSX.Element[] = [];
        Object.keys(DataMap.industries).forEach(industry => {
            list.push(
                <li>
                    <div className='c-checkbox'>
                        <label className='c-label'>
                            <input type='checkbox'
                                onChange={this.onIndustrySelected.bind(this)}
                                id={industry}
                                value={DataMap.industries[industry].UrlKey} />
                            <span>{DataMap.industries[industry].Title}</span>
                        </label>
                    </div>
                </li>
            );
        });
        return list;
    }

    onReferralSelectionChange(event: any) {
        this.partnersform.referral = event.target.value;
    }

    // Form submit method
    handleSubmit(e: any) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: 'Partner submitted for review'
        };

        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

        appPartnerRestClient.postPartnerForm(this.partnersform).then(
            () => {
                this.setState({
                    showSuccessPrompt: true
                });
                return;
            },
            (error: any) => {
                throw new Error(error);
            });
    }

    renderImpl() {
        const inputCell = (require: boolean, title: string, id: string) => {
            return (
                <div>
                    <label htmlFor={id} className='c-label'>{require ? <span className='spza-c-required'>*</span> : null} {title}</label>
                    {require ? <input id={id} onChange={this.onChange.bind(this, id)} type='text' className='c-text-field f-flex' /> :
                        <input id={id} onChange={this.onChange.bind(this, id)} type='text' className='c-text-field f-flex' required />}
                </div>
            );
        };

        return (
            <div className='context-partners-form-page'>
                <div className='spza_partnerContainer' hidden={this.state.showSuccessPrompt}  >
                    <section className='theme-light context-form-header'>
                        <div data-grid='container pad-12x'>
                            <div data-grid='col-12'>
                                <h1 className='c-heading-2'>
                                    Tell us about you
                                </h1>
                                <p className='c-paragraph-1'>To get started, provide some details about your partner organization.
                                    For questions, refer to the <a className='c-hyperlink' target='_blank'
                                        href='http://go.microsoft.com/fwlink/?LinkId=828734&clcid=0x409'>partner listing guidelines.</a></p>
                            </div>
                        </div>
                    </section>

                    <div data-grid='container pad-12x'>

                        <div data-grid='col-12'>
                            <div className='context-form'>
                                <h2 className='c-heading-3'>Your contact info</h2>

                                {inputCell(true, 'First Name', 'firstName')}
                                {inputCell(true, 'Last Name', 'lastName')}
                                {inputCell(true, 'Email', 'email')}
                                {inputCell(false, 'Role', 'role')}
                            </div>
                        </div>

                        <div data-grid='col-12'>
                            <div className='context-form'>
                                <h2 className='c-heading-3'>Company info</h2>

                                {inputCell(true, 'Company name', 'company')}
                                {inputCell(true, 'Website', 'website')}
                                {inputCell(true, 'Email alias of your Microsoft contact (if applicable)', 'msEmails')}

                                <label htmlFor='company_url_listings' className='c-label'>URL for any other company listings you have with Microsoft (eg.
                                    <a className='c-hyperlink' target='_blank' href='https://partnercenter.microsoft.com/en-us/partner/home'> Microsoft Partner center</a>) </label>
                                <input id='company_url_listings' type='text'
                                    onChange={this.onChange.bind(this, 'companyListings')}
                                    className='c-text-field f-flex' />

                                <label htmlFor='company_industries' className='c-label'>Industry</label>
                                <ul role='group' aria-labelledby='app_industries'>
                                    {this.renderIndustriesList()}
                                </ul>

                                <label htmlFor='app_url_listings' className='c-label'><span className='spza-c-required'>*</span> My company
                                    provides services for these apps in AppSource (Link to app page on
                                    <a className='c-hyperlink' target='_blank' href='https://appsource.microsoft.com/'> AppSource.com</a>) </label>
                                <input id='app_url_listings' type='text'
                                    onChange={this.onChange.bind(this, 'appListings')}
                                    className='c-text-field f-flex' />

                                <label htmlFor='app_referral' className='c-label'>How did you first hear about Microsoft AppSource?</label>
                                <div className='c-select'>
                                    <select id='app_referral' onChange={this.onReferralSelectionChange}>
                                        <option value='' disabled selected>Choose an option</option>
                                        <option>Event / Conferences</option>
                                        <option>Microsoft Developer Experience (DX)</option>
                                        <option>Microsoft field team</option>
                                        <option>Microsoft product team</option>
                                        <option>Microsoft Partner Network</option>
                                        <option>Other partners or community</option>
                                        <option>Online search</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div data-grid='col-12'>
                            <button name='submitButton' disabled={!this.state.isEnabled} className='c-button' role='button'
                                onClick={this.handleSubmit.bind(this)} type='submit'>Submit</button>
                        </div>
                    </div>
                </div>

                <div className='spza_partnerContainer' hidden={!this.state.showSuccessPrompt} >
                    <div data-grid='col-12'>
                        <p className='c-paragraph-1'></p>
                        <p className='c-paragraph-1'></p>
                        <h2 className='c-heading-2'>Thanks for telling us about you!</h2>
                        <h2 className='c-heading-2'>We’ll reach out to you with next steps soon.</h2>
                        <p className='c-paragraph-1'></p>
                        <p className='c-paragraph-1'></p>
                    </div>
                </div>
            </div>
        );
    }
}

(PartnerListingForm as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};