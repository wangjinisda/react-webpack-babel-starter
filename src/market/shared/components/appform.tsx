import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppListingInfo, ITelemetryData } from '../Models';
import { Constants } from '../utils/constants';
import { Countries } from '../utils/allCountries';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { ILocContext, ICommonContext } from '../interfaces/context';
import * as appPartnerRestClient from '../services/http/appPartnerRestClient';

export class AppListingForm extends SpzaComponent<any, any> {
    context: ICommonContext & ILocContext;
    private partnersform: IAppListingInfo;
    private otherAppPlatforms: string;
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
            appName: '',
            industry: '',
            description: '',
            cloudIntegrations: [],
            appUses: [],
            msEmails: '',
            type: 'applisting',
            referral: '',
            location: '',
            trialUrl: ''
        };
    }

    // Sets the state with defaults
    constructor(props: any, context: any) {
        super(props, context);
        this.setDefaults();
        this.state = {
            isEnabled: false,
            otherCloundIntEnabled: false,
            otherAppPlatformEnabled: false,
            showSuccessPrompt: false
        };
        this.onChange = this.onChange.bind(this);
        this.onIndustrySelectionChange = this.onIndustrySelectionChange.bind(this);
        this.onCloudIntegrationSelected = this.onCloudIntegrationSelected.bind(this);
        this.onAppPlatformSelected = this.onAppPlatformSelected.bind(this);
        this.onReferralSelectionChange = this.onReferralSelectionChange.bind(this);
        this.onCountrySelectionChange = this.onCountrySelectionChange.bind(this);
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
        document.getElementsByTagName('title')[0].innerHTML = this.context.loc('submitApp_pageTitle', 'Submit your app – Microsoft AppSource');
    }

    onChange() {
        this.checkMandatoryFields();
    }

    onIndustrySelectionChange(event: any) {
        this.partnersform.industry = event.target.value;
        this.onChange();
    }

    onReferralSelectionChange(event: any) {
        this.partnersform.referral = event.target.value;
        this.onChange();
    }

    onCountrySelectionChange(event: any) {
        this.partnersform.location = event.target.value;
        this.onChange();
    }

    // Pushes the selected cloud integartions
    // in case "other" is selected enabled the other text box
    onCloudIntegrationSelected(event: any) {
        if (event.target.id === 'appIntOther') {
            if (event.target.checked) {
                this.setState({
                    otherCloundIntEnabled: true
                });
            }
        } else {
            if (event.target.checked) {
                this.partnersform.cloudIntegrations.push(event.target.value);
            }
            if (!event.target.checked) {
                let index = this.partnersform.cloudIntegrations.indexOf(event.target.value);
                if (index !== -1) {
                    this.partnersform.cloudIntegrations.splice(index, 1);
                }
            }
        }
        this.checkMandatoryFields();
    }

    // Pushes the selected app aplatforms
    // in case "other" is selected enabled the other text box
    onAppPlatformSelected(event: any) {
        if (event.target.id === 'appPlatOther') {
            if (event.target.checked) {
                this.setState({
                    otherAppPlatformEnabled: true
                });
            }
            if (!event.target.checked) {
                this.otherAppPlatforms = '';
                this.setState({
                    otherAppPlatformEnabled: false
                });
            }
        } else {
            if (event.target.checked) {
                this.partnersform.appUses.push(event.target.value);
            }
            if (!event.target.checked) {
                let index = this.partnersform.appUses.indexOf(event.target.value);
                if (index !== -1) {
                    this.partnersform.appUses.splice(index, 1);
                }
            }
        }
        this.checkMandatoryFields();
    }

    // enables disables the submit button based on top mandatory field values
    checkMandatoryFields() {
        let enabled = this.partnersform.firstName &&
            this.partnersform.lastName &&
            this.partnersform.email &&
            this.partnersform.industry &&
            this.partnersform.company &&
            this.partnersform.website &&
            this.partnersform.description &&
            this.partnersform.location &&
            this.partnersform.referral &&
            (this.state.otherAppPlatformEnabled === true ?
                this.otherAppPlatforms.length : this.partnersform.appUses.length);
        this.setState({
            isEnabled: enabled
        });
    }

    // Form submit method
    handleSubmit(e: any) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: 'App submitted for review'
        };

        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

        if (this.otherAppPlatforms) {
            this.partnersform.appUses.push(this.otherAppPlatforms);
        }

        appPartnerRestClient.postPartnerForm(this.partnersform)
            .then(() => {
                this.setState({
                    showSuccessPrompt: true
                });
            })
            .catch((error: any) => {
                throw new Error(error);
            });
    }

    renderImpl() {
        return (
            <div className='context-partners-form-page'>
                <div className='spza_partnerContainer' hidden={this.state.showSuccessPrompt}  >
                    <section className='theme-light context-form-header'>
                        <div data-grid='container pad-12x'>
                            <div data-grid='col-12'>
                                <h1 className='c-heading-2'>
                                    Tell us about your app
                                </h1>
                                <p className='c-paragraph-1'>To get started, provide some details about your line-of-business SaaS app.
                                    For questions, refer to the <a className='c-hyperlink' target='_blank'
                                        href='http://go.microsoft.com/fwlink/?LinkID=820705&clcid=0x409'>app review guidelines.</a></p>
                            </div>
                        </div>
                    </section>

                    <div data-grid='container pad-12x'>

                        <div data-grid='col-12'>
                            <div className='context-form'>
                                <h2 className='c-heading-3'>Your contact info</h2>

                                <label htmlFor='your_name' className='c-label'><span className='spza-c-required'>*</span> First Name</label>
                                <input id='your_name' onChange={this.onChange}
                                    ref={(x) => this.partnersform.firstName = x ? x.value : ''} type='text'
                                    className='c-text-field f-flex' required />

                                <label htmlFor='your_name' className='c-label'><span className='spza-c-required'>*</span> Last Name</label>
                                <input id='your_name' onChange={this.onChange}
                                    ref={(x) => this.partnersform.lastName = x ? x.value : ''} type='text'
                                    className='c-text-field f-flex' required />

                                <label htmlFor='your_email' className='c-label'><span className='spza-c-required'>*</span> Email</label>
                                <input id='your_email' onChange={this.onChange}
                                    ref={(x) => this.partnersform.email = x ? x.value : ''}
                                    type='text' className='c-text-field f-flex' required />

                                <label htmlFor='your_role' className='c-label'>Role</label>
                                <input id='your_role'
                                    onChange={this.onChange}
                                    ref={(x) => this.partnersform.role = x ? x.value : ''}
                                    type='text' className='c-text-field f-flex' />
                                <label htmlFor='your_email' className='c-label'><span className='spza-c-required'>*</span> Country (where you are located)</label>
                                <div className='c-select'>
                                    <select onChange={this.onCountrySelectionChange}>
                                        <option value='' disabled selected>Choose a Country</option>
                                        {
                                            Countries.map((item, index) => (
                                                <option key={index} value={item}>{item}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div data-grid='col-12'>
                            <div className='context-form'>
                                <h2 className='c-heading-3'>Company info</h2>

                                <label htmlFor='company_name' className='c-label'><span className='spza-c-required'>*</span> Company name</label>
                                <input id='company_name' type='text'
                                    onChange={this.onChange}
                                    ref={(x) => this.partnersform.company = x ? x.value : ''}
                                    className='c-text-field f-flex' required />

                                <label htmlFor='company_website' className='c-label'><span className='spza-c-required'>*</span> Website</label>
                                <input id='company_website' type='text'
                                    onChange={this.onChange}
                                    ref={(x) => this.partnersform.website = x ? x.value : ''}
                                    className='c-text-field f-flex' required />

                                <label htmlFor='company_ms_contact' className='c-label'>Email alias of your Microsoft contact (if applicable)</label>
                                <input id='company_ms_contact' type='text'
                                    onChange={this.onChange}
                                    ref={(x) => this.partnersform.msEmails = x ? x.value : ''}
                                    className='c-text-field f-flex' />
                            </div>
                        </div>

                        <div data-grid='col-12'>
                            <div className='context-form'>
                                <h2 className='c-heading-3'>App info</h2>

                                <label htmlFor='app_name' className='c-label'><span className='spza-c-required'>*</span> App name</label>
                                <input id='app_name' type='text'
                                    className='c-text-field f-flex'
                                    onChange={this.onChange}
                                    ref={(x) => this.partnersform.appName = x ? x.value : ''}
                                    required />

                                <label htmlFor='app_industry' className='c-label'><span className='spza-c-required'>*</span> Primary industry</label>
                                <div className='c-select'>
                                    <select id='app_industry' onChange={this.onIndustrySelectionChange}>
                                        <option value='' disabled selected>Choose an industry</option>
                                        <option>Agriculture</option>
                                        <option>Distribution</option>
                                        <option>Financial services</option>
                                        <option>Government</option>
                                        <option>Healthcare + life sciences</option>
                                        <option>Manufacturing</option>
                                        <option>Professional services</option>
                                        <option>Retail + consumer goods</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className='c-textarea'>
                                    <label htmlFor='description' className='c-label'><span className='spza-c-required'>*</span> Description</label>
                                    <textarea id='description' className='f-no-resize'
                                        onChange={this.onChange}
                                        ref={(x) => this.partnersform.description = x ? x.value : ''}
                                        rows={5} required></textarea>
                                </div>

                                <label id='app_platform' className='c-label'><span className='spza-c-required'>*</span> Choose the products that your app is built for </label>
                                <ul role='group' aria-labelledby='app_platform'>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatazure' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-AZURE-WEBAPP' />
                                                <span>Web apps</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatazure' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-AZURE-CORTANA-INTELLIGENCE' />
                                                <span>Cortana Intelligence</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatdfo' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-OP' />
                                                <span>Microsoft Dynamics 365 for Operations</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatdfs' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-SALES' />
                                                <span>Microsoft Dynamics 365 for Sales</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatdfs' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-FIN' />
                                                <span>Microsoft Dynamics 365 for Financials</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatdcs' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-CS' />
                                                <span>Microsoft Dynamics 365 for Customer Service</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatdfs' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-FS' />
                                                <span>Microsoft Dynamics 365 for Field Service</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatpsa' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-DYNAMICS-PSA' />
                                                <span>Microsoft Dynamics 365 for Project Service Automation</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatpbi' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-PBI' />
                                                <span>Microsoft Power BI</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appplatoffice' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='MS-O365' />
                                                <span>Microsoft Office 365</span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input id='appPlatOther' type='checkbox'
                                                    onChange={this.onAppPlatformSelected}
                                                    name='example-1' value='APP-PLAT-OTHER' />
                                                <span>Other</span>
                                            </label>
                                        </div>
                                        <div className='spza-c-checkbox-text-field'>
                                            <input type='text'
                                                disabled={!this.state.otherAppPlatformEnabled}
                                                ref={(x) => this.otherAppPlatforms = x ? x.value : ''}
                                                onChange={this.onChange}
                                                className='c-text-field f-flex' />
                                        </div>
                                    </li>
                                </ul>

                                <label id='app_integrations' className='c-label'>
                                    App authentication method (for Microsoft Azure / Cloud Solutions and Office 365 apps) </label>
                                <ul role='group' aria-labelledby='app_integrations'>
                                    <li>
                                        <div className='c-checkbox'>
                                            <label className='c-label'>
                                                <input type='checkbox' id='appintaad'
                                                    onChange={this.onCloudIntegrationSelected} name='' value='AAD' />
                                                <span> Is Azure Active Directory Federated Single Sign-on (AAD federated SSO) enabled for your app? For details,
                                                    see <a className='c-hyperlink'
                                                        target='_blank' href='https://identity.microsoft.com/'>
                                                        Microsoft identity platform</a></span>
                                            </label>
                                        </div>
                                    </li>
                                    <li>
                                        <label htmlFor='trialUrl' className='c-label'>Please provide URL for the trial version of your app</label>
                                        <input id='company_ms_contact' type='text'
                                            onChange={this.onChange}
                                            ref={(x) => this.partnersform.trialUrl = x ? x.value : ''}
                                            className='c-text-field f-flex' />
                                    </li>
                                </ul>

                                <label id='app_referral' className='c-label'><span className='spza-c-required'>*</span> How did you first hear about Microsoft AppSource?</label>
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
                        <h2 className='c-heading-2'>Thanks for telling us about your app!</h2>
                        <h2 className='c-heading-2'>We’ll reach out to you with next steps soon.</h2>
                        <p className='c-paragraph-1'></p>
                        <p className='c-paragraph-1'></p>
                    </div>
                </div>
            </div>
        );
    }
}

(AppListingForm as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
