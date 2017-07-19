import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import {
    publishLead, publishAppAcquisitionInfo, publishPartnerAcquisitionInfo, getTelemetryAppData,
    getTelemetryPartnerData, getLeadGenEmailId
} from './../../utils/appUtils';
import { IUserInfo, IAppDataItem, IPartnerDataItem, ITelemetryData } from '../../Models';
import { Constants } from './../../utils/constants';
import { ILocContext, ILocParamsContext, ICommonContext } from '../../interfaces/context';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../../services/window';

interface ILeadFormModal {
    modalId: number;
    userInfo: IUserInfo;
    appInfo?: IAppDataItem;
    partnerInfo?: IPartnerDataItem;
    accessToken: string;
    nationalCloud: string;
    crossListingAppContext?: IAppDataItem;
    dismissModal: () => void;
    refreshAccessToken: () => Promise<any>;
}

interface ISourceInfo {
    title: string;
    publisher: string;
    iconURL: string;
}

export class LeadFormModal extends SpzaComponent<ILeadFormModal, any> {
    public context: ILocContext & ILocParamsContext & ICommonContext;
    private sourceInfo: ISourceInfo;
    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: ILeadFormModal, context: ILocContext & ILocParamsContext & ICommonContext) {
        super(props, context);
        switch (this.props.modalId) {
            case Constants.ModalType.CTA:
                this.sourceInfo = {
                    title: this.props.appInfo.title,
                    iconURL: this.props.appInfo.iconURL,
                    publisher: this.props.appInfo.publisher
                };
                break;
            case Constants.ModalType.Contact:
                this.sourceInfo = {
                    title: this.props.partnerInfo.title,
                    iconURL: this.props.partnerInfo.iconURL,
                    publisher: this.props.partnerInfo.title
                };
                break;
        };

        this.state = {
            isEnabled: false,
            showSuccessDialog: false
        };
        this.onChange = this.onChange.bind(this);
    }

    componentWillMount() {
        this.checkMandatoryFields();
    }

    onChange(id: string, e: any) {
        this.props.userInfo[id] = e.target ? e.target.value : '';
        this.checkMandatoryFields();
    }

    checkMandatoryFields() {
        this.setState({
            isEnabled: this.props.userInfo.firstName && this.props.userInfo.firstName.length
            && this.props.userInfo.lastName && this.props.userInfo.lastName.length
            && this.props.userInfo.email && this.props.userInfo.email.length
        });
    }

    showTerms() {
        let buttonName = '';

        let defaultTerms = 'By clicking {0}, I give Microsoft permission to share my supplied contact information ' +
            'so that the app provider can contact me to discuss my requirements. I’ll contract directly with the provider about ' +
            'deployment, pricing, terms of use, and the privacy statement. Rights to use this app do not come from Microsoft. ' +
            'See the {1} for more information.';
        switch (this.props.modalId) {
            case Constants.ModalType.CTA:
                buttonName = this.context.loc('CTA_ContactMe');
                break;
            case Constants.ModalType.Contact:
                buttonName = this.context.loc('Contact_Send');
                break;
        };
        let term = '<a href=\'' + Constants.MicrosoftTermsURL + '\' rel=\'noreferrer\' target=\'_blank\'>' + this.context.loc('RT_Terms') + '</a>';
        let c = '';
        c = this.context.locParams('RT_Disclaimer', [buttonName, term], defaultTerms);
        return c;
    }

    showSubmitText() {
        let c = '';
        switch (this.props.modalId) {
            case Constants.ModalType.CTA:
                c = this.context.loc('CTA_ContactMe');
                break;
            case Constants.ModalType.Contact:
                c = this.context.loc('Contact_Send');
                break;
        };
        return c;
    }

    submit(e: any) {
        // refresh the access token if it has expired or about to expire
        this.props.refreshAccessToken()
            .then(() => {
                switch (this.props.modalId) {
                    case Constants.ModalType.CTA:
                        return this.sendCTA(e);
                    case Constants.ModalType.Contact:
                        return this.sendContact(e);
                };
            });
    }

    sendContact(e: any) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.SubmitLeadGen,
            partnerId: this.props.partnerInfo.partnerId,
            details: getTelemetryPartnerData(this.props.partnerInfo)
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        let appId: string = this.props.crossListingAppContext ? this.props.crossListingAppContext.appid : null;
        let product: number = this.props.crossListingAppContext ? this.props.crossListingAppContext.primaryProduct : null;
        let partnerId: string = this.props.partnerInfo ? this.props.partnerInfo.partnerId : null;

        publishPartnerAcquisitionInfo(this.props.userInfo, this.props.partnerInfo, this.props.accessToken,
            this.props.nationalCloud ? true : false, appId, product ? product.toString() : '');
        publishLead(this.props.userInfo, this.props.accessToken, appId, partnerId, product);
        this.setState({ showSuccessDialog: true });
    }

    sendCTA(e: any) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.SubmitLeadGen,
            appName: this.props.appInfo.appid,
            details: getTelemetryAppData(this.props.appInfo, this.props.nationalCloud ? true : false)
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        // FOR REQUEST TRIAL THE CTA TYPE WILL ALWAYS BE CREATE AS TEST DRIVE WONT OPEN THE RT FORM
        publishAppAcquisitionInfo(this.props.userInfo, this.props.appInfo, this.props.accessToken, this.props.nationalCloud ? true : false, Constants.CTAType.Create);
        publishLead(this.props.userInfo,
            this.props.accessToken,
            this.props.appInfo ? this.props.appInfo.appid : null,
            null,
            this.props.appInfo ? this.props.appInfo.primaryProduct : null,
            this.props.appInfo.actionString);
        this.setState({ showSuccessDialog: true });
    }

    renderImpl() {
        let context = this.context as any;
        const inputCell = (require: boolean, title: string, id: string, defaultValue?: string) => {
            return (
                <div className='formCell'>
                    <div className='cellHeader'>{title}
                        {require ? <img className='required' src='/images/requiredIcon.png' /> : null}
                    </div>
                    <input className='c-text-field f-flex cellInput' onChange={this.onChange.bind(this, id)} defaultValue={defaultValue ? defaultValue : ''}
                        type='text' aria-label={title}></input>
                </div>
            );
        };

        return (
            <div role='dialog' tabIndex={-1} className='leadFormModalClass'>
                <div className='prompContainer'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    {
                        this.state.showSuccessDialog ?
                            <div>
                                <div className='leadSubmitHeader'>{context.loc('LeadForm_Submitted')}</div>
                                <div className='leadSubmitSubHeader'>{context.locParams('RT_DialogSubmittedText',
                                    this.sourceInfo.publisher ? [this.sourceInfo.publisher] : ['Publisher'])}</div>
                                <div className='leadSubmitCheck'>
                                    <img src='/images/checkLarge.png' />
                                </div>
                                <div className='leadConsentBottomBar'>
                                    <button name='button' className='c-button requestButton' type='submit'
                                        onClick={this.props.dismissModal}>{context.loc('Dialog_Close')}</button>
                                </div>
                            </div> :
                            <div>
                                <div className='contentHeader'>{context.loc('LeadForm_DialogTitle')}</div>
                                <div className='trunk'>
                                    <div className='miniIcon'>
                                        {<img className='thumbnail' src={this.sourceInfo.iconURL} />}
                                    </div>
                                    <div className='trunkContent'>
                                        <span className='header'>{this.sourceInfo.title}</span>
                                        <span className='subHeader'>{this.sourceInfo.publisher}</span>
                                    </div>
                                </div>
                                <div className='leadGen'>
                                    {inputCell(true, context.loc('RT_FirstName'), 'firstName', this.props.userInfo.firstName)}
                                    {inputCell(true, context.loc('RT_LastName'), 'lastName', this.props.userInfo.lastName)}
                                    <div className='formCell'>
                                        <div className='cellHeader'>{context.loc('RT_WorkEmail')}
                                            <img className='required' src='/images/requiredIcon.png' />
                                        </div>
                                        <input className='c-text-field f-flex cellInput' onChange={this.onChange.bind(this, 'email')} defaultValue={getLeadGenEmailId(this.props.userInfo)}
                                            type='text' name='placeholder'
                                            placeholder='someone@example.com'></input>
                                    </div>
                                    {inputCell(false, context.loc('RT_Title'), 'title', this.props.userInfo.title)}
                                    {inputCell(false, context.loc('RT_Company'), 'company', this.props.userInfo.company)}
                                    {inputCell(false, context.loc('RT_Country'), 'country', this.props.userInfo.country)}
                                    {inputCell(false, context.loc('RT_Phone'), 'phone', this.props.userInfo.phone)}
                                </div>
                                <div className='terms leadTerm' dangerouslySetInnerHTML={{ __html: this.showTerms.bind(this)() }}></div>
                                <div className='bottomBar'>
                                    <button name='button' disabled={!this.state.isEnabled} className='c-button requestButton' type='submit'
                                        onClick={this.submit.bind(this)}>{this.showSubmitText.bind(this)()}</button>
                                </div>
                            </div>
                    }
                </div>
            </div>
        );
    }
}

(LeadFormModal as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
