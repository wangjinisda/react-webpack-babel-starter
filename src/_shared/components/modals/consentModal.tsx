import * as React from 'react';
import Animation from './../animation';
import SpzaComponent from './../spzaComponent';
import { getHandoffUrlForProduct, publishLead, publishAppAcquisitionInfo, getTelemetryResponseUrl } from './../../utils/appUtils';
import { IUserInfo, IAppDataItem, ITelemetryData } from '../../Models/Models';
import { Constants } from './../../utils/constants';
import { getTelemetryAppData } from '../../utils/appUtils';
import { ProductEnum } from '../../utils/dataMapping';
// import { postEmbedAcquisitionMessage } from '../../../embed/embedMessaging';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../../services/window';
import TestDrive from '../../containers/testDrive';
import { isTestDriveInProgress } from '../../utils/testDriveUtils';
import { NpsModule } from '../../utils/npsUtils';

export interface IConsentModal {
    userInfo: IUserInfo;
    appInfo: IAppDataItem;
    isEmbedded: boolean;
    dismissModal: () => void;
    accessToken: string;
    nationalCloud: string;
    openDriveModal?: (driveUrl: string) => void;
    ctaType: Constants.CTAType;
    billingCountryCode: string;
    testDriveToken?: string;
    flightCodes?: string;
    fetchAppDetails?: (targetApp: IAppDataItem) => void;
    refreshAccessToken: () => Promise<any>;
}

export class ConsentModal extends SpzaComponent<IConsentModal, any> {
    protected handoffTitle: string = '';
    private instrument = SpzaInstrumentService.getProvider();

    constructor() {
        super();
        this.state = {
            isChecked: false,
            showAnimation: false,
            showTestDrive: false,
            // To get the privacy URL for an app, we need to fetch the App Details. This is lazy loaded.
            // Hence it is in the state.
            appPrivacyPolicyUrl: ''
        };
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        this.handoffTitle = this.props.appInfo.builtFor;
    }

    componentDidMount() {
        // If there is no license terms, we shouldn't show the consent popup.
        if (this.props.appInfo
            && !this.props.appInfo.licenseTermsUrl) {
            this.handleContinue();
        }
        // If the cta is for a test drive and there is test drive in progress (there is a cookie for the current user and current app)
        // skip the leadgen/terms to test drive
        if (this.props.ctaType === Constants.CTAType.TestDrive && !this.props.isEmbedded &&
            isTestDriveInProgress(this.props.appInfo.appid, this.props.userInfo.email)) {
            this.skipToTestDrive();
        }

        // For the privacy policy URL to show up, we need the app details.
            if (this.props.appInfo.detailInformation == null) {
            this.props.fetchAppDetails(this.props.appInfo);
            } else {
                this.setState({ appPrivacyPolicyUrl: this.props.appInfo.detailInformation.PrivacyPolicyUrl });
            }
        }

    componentWillReceiveProps(nextProps: IConsentModal, nextState: any) {
        if (this.props.appInfo.detailInformation !== nextProps.appInfo.detailInformation) {
            this.setState({ appPrivacyPolicyUrl: nextProps.appInfo.detailInformation.PrivacyPolicyUrl });
        }
    }

    onChange() {
        this.setState({ isChecked: !this.state.isChecked });
    }

    skipToTestDrive() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.AzureTestDrive,
            appName: this.props.appInfo.appid,
            // Do we need user info here?
            details: 'Returning Test Drive User'
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        this.setState({ showTestDrive: true });
    }

    handleContinueHelper(showAnimation: boolean, shouldGenerateLead: boolean) {
        let userInfo = this.props.userInfo;

        // We do an acquisition for embed as well as non-embed modes.
        // As of now there is no mandatory fields, so we collect telemetry w/o any props checks.
        publishAppAcquisitionInfo(userInfo, this.props.appInfo, this.props.accessToken, this.props.nationalCloud ? true : false, this.props.ctaType);

        if (userInfo.email && userInfo.firstName && userInfo.lastName) {
            if (shouldGenerateLead) {
                this.processLeadGenPublishing();
            } else {
                this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Click,
                    actionModifier: Constants.Telemetry.ActionModifier.Info,
                    details: 'User choose not to generate lead'
                });
            }
        } else {
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.Info,
                details: 'Invalid userInfo for Lead Gen'
            });
        }

        if (this.props.ctaType === Constants.CTAType.TestDrive && this.props.appInfo.showcaseLink) {
            // telemetry for test drive
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
                appName: this.props.appInfo.appid,
                details: getTelemetryAppData(this.props.appInfo, this.props.nationalCloud ? true : false)
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

            NpsModule.IncreaseAppAcquisition();

            // show the test drive report
            this.props.openDriveModal(this.props.appInfo.showcaseLink);
        } else if (this.props.ctaType === Constants.CTAType.TestDrive && !this.props.isEmbedded) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.AzureTestDrive,
                appName: this.props.appInfo.appid,
                // Do we need user info here?
                details: 'Initializing a new Test Drive'
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

            NpsModule.IncreaseAppAcquisition();

            this.setState({ showTestDrive: true });
        } else {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.ConsentModal,
                appName: this.props.appInfo.appid,
                details: this.getTelemetryDetailsData()
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

            if (this.props.isEmbedded) {
                // TODO : Publish lead in embed experience using the host data
                // We need to fetch lastName, firstName and email. If firstName/lastName are null, use FNU/LNU
                // postEmbedAcquisitionMessage(this.props.appInfo);

                this.props.dismissModal();
                return;
            }

            let url = this.processHandoffURLAndTitle();
            if (!url) {
                this.props.dismissModal();
                return;
            }

            NpsModule.IncreaseAppAcquisition();

            if (showAnimation) {
                this.setState({ showAnimation: true, handoffUrl: url });
                setTimeout(function () {
                    window.open(url, '_self');
                }, 2500);
            } else {
                window.open(url, '_self');
            }
        }
    }

    handleContinue(showAnimation = true, shouldGenerateLead = true) {
        if (this.props.refreshAccessToken) {
            // refresh the access token if it has expired or about to expire
            this.props.refreshAccessToken()
                .then(() => {
                    this.handleContinueHelper(showAnimation, shouldGenerateLead);
                });
        } else {
            this.handleContinueHelper(showAnimation, shouldGenerateLead);
        }
    }

    getTelemetryDetailsData() {
        return getTelemetryAppData(this.props.appInfo, this.props.nationalCloud ? true : false);
    }

    processLeadGenPublishing(): void {
        if (this.props.appInfo.leadgenEnabled) {
            publishLead(this.props.userInfo,
                this.props.accessToken,
                this.props.appInfo ? this.props.appInfo.appid : null,
                null,
                this.props.appInfo ? this.props.appInfo.primaryProduct : null, null, null, this.props.ctaType);
        }
    }

    processHandoffURLAndTitle(): string {
        // We get the Handoff URL from the Partners Manifest file. If the url is null,
        // we need to read the url from the app meta data.
        let url = getHandoffUrlForProduct(String(this.props.appInfo.primaryProduct), this.props.appInfo.appid, this.props.userInfo.isMSAUser, this.props.appInfo.products);
        if (!url) {
            if (this.props.appInfo.handoffURL) {
                url = this.props.appInfo.handoffURL;
                let notifyURL = getTelemetryResponseUrl(this.props.appInfo.appid);
                let queryParams = url.indexOf('?') > -1 ? '&responseUrl=' + notifyURL : '?responseUrl=' + notifyURL;
                url = url + queryParams;

                // Taking you to Azure/Office doesn't make sense for ISV SaaS apps during transition animation popup.
                // So, for only this case, we update the builtFor field.
                // Also, there is a special case for Power BI. For all the content packs, we use the title as Power BI
                if (this.props.appInfo.primaryProduct !== ProductEnum['power-bi']) {
                    this.handoffTitle = this.props.appInfo.title;
                }
            }
        }

        return url;
    }

    renderImpl() {
        let context = this.context as any;
        return (
            <div role='dialog' tabIndex={-1} className='consentModalClass'>
                <div className='prompContainer'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    {
                        this.state.showAnimation ?
                            <div>
                                <div className='contentHeader'>{context.locParams('TRY_Redirect', [this.handoffTitle])}</div>
                                <Animation />
                            </div>
                            :
                            <div>
                                {
                                    this.state.showTestDrive ?
                                        <div>
                                            <TestDrive
                                                userInfo={this.props.userInfo}
                                                appInfo={this.props.appInfo}
                                                dismissModal={this.props.dismissModal}
                                                accessToken={this.props.accessToken}
                                                testDriveAccessToken={this.props.testDriveToken}
                                                flightCodes={this.props.flightCodes}
                                            />
                                        </div>
                                        :
                                        <div>
                                            <div className='contentHeader'>{context.loc('TRY_DialogTitle')}</div>
                                            <div className='trunk'>
                                                <div className='miniIcon'>
                                                    {<img className='thumbnail' src={this.props.appInfo.iconURL} />}
                                                </div>
                                                <div className='trunkContent'>
                                                    <span className='header'>{this.props.appInfo.title}</span>
                                                    <span className='subHeader'>{context.locParams('Tile_By', [this.props.appInfo.publisher])}</span>
                                                </div>
                                            </div>
                                            <div className='terms'>
                                                {this.props.appInfo.leadgenEnabled ?
                                                    <div>
                                                        <div className='c-checkbox termCheckbox'>
                                                            <label className='c-label checkboxLabel'>
                                                                <input autofocus='' type='checkbox' checked={this.state.isChecked} onChange={this.onChange} />
                                                                <span></span>
                                                            </label>
                                                        </div>
                                                        <div className='termLinks consentTerms' dangerouslySetInnerHTML={{
                                                            __html: context.locParams('TRY_Disclaimer_LeadConsent',
                                                                ['<span class="accountInformation" title=\'' + context.loc('TRY_AccountInformationText') + '\' >' +
                                                                    context.loc('TRY_AccountInformation') + '</span>',
                                                                '<a href=\'' + this.props.appInfo.licenseTermsUrl +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms2') + '</a>',
                                                                '<a href=\'' + this.state.appPrivacyPolicyUrl +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_PrivacyPolicy') + '</a>',
                                                                '<a href=\'' + Constants.MicrosoftTermsURL +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms') + '</a>',
                                                                '<a href=\'' + Constants.MicrosoftPrivacyStatementURL +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Privacy') + '</a>'])
                                                        }}>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <div className='termLinks consentTerms' dangerouslySetInnerHTML={{
                                                            __html: context.locParams('TRY_Disclaimer_Consent',
                                                                ['<a href=\'' + this.props.appInfo.licenseTermsUrl +
                                                                    '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms2') + '</a>',
                                                                '<a href=\'' + this.state.appPrivacyPolicyUrl +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_PrivacyPolicy') + '</a>',
                                                                '<a href=\'' + Constants.MicrosoftTermsURL +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Terms') + '</a>',
                                                                '<a href=\'' + Constants.MicrosoftPrivacyStatementURL +
                                                                '\' rel=\'noreferrer\' target=\'_blank\'>' + context.loc('TRY_Privacy') + '</a>'])
                                                        }}>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div className='loginInfo'>
                                                <div dangerouslySetInnerHTML={{
                                                    __html: context.locParams('Login_Info',
                                                        ['<span>' + this.props.userInfo.displayName + '</span>', '<span>' + this.props.userInfo.email + '</span>'])
                                                }}>
                                                </div>
                                            </div>
                                            <div className='consentBottomBar'>
                                                <button name='button' className='c-button requestButton' type='submit'
                                                    onClick={this.handleContinue.bind(this)} disabled={!this.state.isChecked &&
                                                        this.props.appInfo.leadgenEnabled}>{context.loc('Dialog_Continue')}</button>
                                            </div>
                                        </div>
                                }
                            </div>
                    }
                </div>
            </div>
        );
    }
}


(ConsentModal as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
