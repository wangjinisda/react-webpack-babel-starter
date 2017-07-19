import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { ITelemetryData } from '../../Models';
import { Constants } from '../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { generateGuid } from '../../utils/appUtils';
import { urlReplace } from '../../routerHistory';
import { removeURLParameter } from '../../utils/appUtils';
import { getWindow } from '../../services/window';
// import * as signInUtils from 'utils/signin';
import * as signInUtils from './../../../mac/utils/signin';
import { getAppConfig } from '../../services/init/appConfig';
import { ILocContext, ILocParamsContext, ICommonContext } from '../../interfaces/context';

export interface ISignInModalProps {
    dismissModal: () => void;
    signInModalType?: number;
    redirect?: string;
    partnerId?: string;
    appId?: string;
    appName?: string;
    email?: string;
    productId?: string;
    testDrive?: any;
    includeOfficeApps?: boolean;
}

export class SignInModal extends SpzaComponent<ISignInModalProps, any> {
    context: ILocContext & ILocParamsContext & ICommonContext;
    emailRe: RegExp;
    signUp: string;
    private instrument = SpzaInstrumentService.getProvider();
    private isEmailEmpty = true;
    constructor(props: ISignInModalProps, context: ILocContext & ILocParamsContext & ICommonContext) {
        super(props, context);

        this.state = {
            inputEmail: '',
            validEmail: false
        };

        let reStr1 = '^(([^<>()\\[\\]\\.,;:\\s@\\"]+(\\.[^<>()\\[\\]\\.,;:\\s@\\"]+)*)|(\\".+\\"))';
        let reStr2 = '@(([^<>()[\\]\\.,;:\\s@\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\"]{2,})$';

        this.signUp = process.env.SIGNUP_HOST || signInUtils.getSignUpHost();
        if (process.env.SIGNUP_ORIGIN) {
            this.signUp += '&origin=' + process.env.SIGNUP_ORIGIN;
        }

        this.emailRe = new RegExp(reStr1 + reStr2, 'i');
    }

    validateEmail(inputEmail: string) {
        if (this.emailRe.test(inputEmail)) {
            this.setState({
                inputEmail: inputEmail,
                validEmail: true
            });
        } else {
            this.setState({
                inputEmail: inputEmail,
                validEmail: false
            });
        }
    }

    getRedirectUrl(id?: string): string {
        let redirectUrl: string = encodeURIComponent(getWindow().location.href);

        if (this.props.redirect === 'app') {
            let appId = id || this.props.appId;
            if (appId) {
                redirectUrl = encodeURIComponent(getWindow().location.href + this.getQueryParam(Constants.QueryStrings.modalAppId) + appId
                    + this.getQueryParam(Constants.QueryStrings.signInModalType, true) + this.props.signInModalType
                    + (this.props.testDrive ? '&testDrive=true' : ''));
            }
        };

        if (this.props.redirect === 'partner') {
            let partnerId = id || this.props.partnerId;
            if (partnerId) {
                redirectUrl = encodeURIComponent(getWindow().location.href + this.getQueryParam(Constants.QueryStrings.modalPartnerId) + partnerId
                    + this.getQueryParam(Constants.QueryStrings.signInModalType, true) + this.props.signInModalType);
                // crossListingAppId is used to send the lead to the ISV
                if (this.props.appId && this.props.productId) {
                    redirectUrl = encodeURIComponent(getWindow().location.href + this.getQueryParam(Constants.QueryStrings.modalPartnerId) + partnerId
                        + this.getQueryParam(Constants.QueryStrings.ApplicationId, true)
                        + this.props.appId + this.getQueryParam(Constants.QueryStrings.productId, true) + this.props.productId
                        + this.getQueryParam(Constants.QueryStrings.signInModalType, true) + this.props.signInModalType);
                }
            }
        };

        return redirectUrl;
    }

    getQueryParam(param: string, isMultiParam = false): string {
        let queryParam = (getWindow().location.href.indexOf('?') > -1 || isMultiParam) ? '&' + param + '=' : '?' + param + '=';
        // If we do a sign-up before the sign-in, we will have modalAppId in the queryParams.
        // We need to get rid of it before signing in since there will be duplicate params.
        if (getWindow().location.href.indexOf(param) > -1) {
            let pageURL = removeURLParameter(getWindow().location.href, param);
            urlReplace(pageURL);
        }
        return queryParam;
    }

    // Sign up flow also uses SignIn URL as redirect (with absolute path) so that when user lands back on SPZA
    // (s)he gets redirected for sign-in flow and gets signed in
    getSignInRedirectUrl(email: string, needsAbsoluteUrl: boolean): string {
        let requestId = generateGuid();
        let correlationId = getAppConfig('correlationId');
        let redirectUrl: string = this.getRedirectUrl();
        let signInUrl: string = (needsAbsoluteUrl ? getWindow().location.origin : '') + '/signIn' +
            '?hint=' + (email ? email : '') +
            '&from=' + redirectUrl +
            '&' + Constants.Headers.RequestId + '=' + requestId +
            '&' + Constants.Headers.CorrelationId + '=' + correlationId;

        return signInUrl;
    }

    getSignUpUrl(email: string): string {
        // Start Mooncake: bug874
        let signUpUrl = getWindow().document.querySelector('.large-free-trial a').getAttribute('href');
        // End Mooncake
        return signUpUrl;
    }

    signInUser() {
        // Set the flushLog to true since we are navigating away from the SPZA website
        // and we need to flush all the logs present in the telemetry buffer
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.LoginModal,
            details: 'Clicked on signIn. Hand-off to AAD for authentication'
        };

        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        getWindow().location.href = this.getSignInRedirectUrl(this.state.inputEmail, false);
    }

    onChange(event: any) {
        if (event.target.value && event.target.value.length > 0) {
            this.isEmailEmpty = false;
        } else {
            this.isEmailEmpty = true;
        }

        this.validateEmail(event.target.value);
    }

    onKeyDown(event: KeyboardEvent) {
        // When user presses enter key, we should sign-in
        // 13 is the ASCII key code for enter key.
        if (event.keyCode === 13) {
            this.signInUser();
        }
    }

    handleSignIn(e: any) {
        this.signInUser();
    }

    handleSignUp(e: any) {
        // Set the flushLog to true since we are navigating away from the SPZA website
        // and we need to flush all the logs present in the telemetry buffer
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Signup,
            details: 'Clicked on sign-up. Navigating to office portal'
        };

        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        // Send the sign-in based URL so that when user lands back on SPZA post Sign-up we get him/her signed in as well.
        let signUpUrl = this.getSignUpUrl(this.state.inputEmail);

        let form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', signUpUrl);

        let emailField = document.createElement('input');
        emailField.setAttribute('type', 'hidden');
        emailField.setAttribute('name', 'StepsData.Email');
        emailField.setAttribute('value', this.state.inputEmail);

        form.appendChild(emailField);

        document.body.appendChild(form);
        form.submit();
    }

    // TODO : Remove this once Office onboarding is done
    renderOldSignInModal() {
        return (
            <div className='prompContainer'>
                <div className='toolBar'>
                    <button className='cancel' onClick={this.props.dismissModal}>
                        <span className='c-glyph'></span>
                    </button>
                </div>
                <div className='signInModal'>
                    <div className='contentHeader'>{signInUtils.getSignInHeader(this.context)}</div>
                    <div className='formCell signInFormCell'>
                        <div className='cellHeader'>{signInUtils.getTitle(this.context)}
                            <span className='required'></span>
                        </div>
                        <input className='c-text-field f-flex signInInput'
                            onChange={this.onChange.bind(this)}
                            onKeyDown={this.onKeyDown.bind(this)}
                            autoFocus={true}
                            type='text'
                            placeholder='someone@example.com'
                            name='default'></input>
                    </div>
                    <div className='signInButton'>
                        <button name='button' className='c-button requestButton'
                            type='submit'
                            disabled={this.isEmailEmpty}
                            onClick={this.handleSignIn.bind(this)}>{this.context.loc('SI_SignIn')}</button>
                    </div>
                    <div className='signupFooter'>
                        {this.context.loc('SI_For')}
                        <button onClick={this.handleSignUp.bind(this)}>{this.context.loc('SI_Signup')} </button>
                    </div>
                </div>
            </div>
        );
    }

    renderSignInContent(title: string, subTitle: string, disclaimer: string, accountType: string) {
        return (
            <div className='prompContainer newSignInModal'>
                <div className='toolBar'>
                    <button className='cancel' onClick={this.props.dismissModal}>
                        <span className='c-glyph'></span>
                    </button>
                </div>
                <div className='signInModal'>
                    <div className='title'>{title}</div>
                    <div className='subTitle'>{subTitle}</div>
                    <div className='disclaimer'>
                        <span className='c-glyph'/>
                        {disclaimer}
                    </div>
                    <div className='formCell signInFormCell'>
                        <div className='cellHeader'>{accountType}
                            <span className='required'></span>
                        </div>
                        <input className='c-text-field f-flex signInInput'
                            onChange={this.onChange.bind(this)}
                            onKeyDown={this.onKeyDown.bind(this)}
                            autoFocus={true}
                            type='text'
                            placeholder='someone@example.com'
                            name='default'></input>
                    </div>
                    <div className='signInButton'>
                        <button name='button' className='c-button requestButton'
                            type='submit'
                            disabled={this.isEmailEmpty}
                            onClick={this.handleSignIn.bind(this)}>{this.context.loc('SI_SignIn')}</button>
                    </div>
                    <div className='signupFooter'>
                        {this.context.loc('SI_For')}
                        <button onClick={this.handleSignUp.bind(this)}>{this.context.loc('SignInModal_SignUp')} </button>
                    </div>
                </div>
            </div>
        );
    }

    renderDualPurposeLoginModal() {
        return (this.renderSignInContent(this.context.loc('SignInModal_Title1'), this.context.loc('SignInModal_SubTitle1'),
            this.context.loc('SignInModal_Disclaimer1'), this.context.loc('SignInModal_AccountType1')));
    }

    renderWorkOnlyModal() {
        return (this.renderSignInContent(this.context.loc('SignInModal_Title1'), this.context.loc('SignInModal_SubTitle1'),
            this.context.locParams('SignInModal_Disclaimer2', [this.props.appName]), this.context.loc('SignInModal_AccountType2')));
    }

    renderSwitchAccountModal() {
        return (this.renderSignInContent(this.context.loc('SignInModal_Title2'), this.context.locParams('SignInModal_SubTitle2', [this.props.appName]),
            this.context.locParams('SignInModal_Disclaimer3', [this.props.email]), this.context.loc('SignInModal_AccountType2')));
    }

    renderModalContent(modalType: number) {
        let modalContent: JSX.Element = null;

        // TODO[OfficeOnboarding]: Remove this check when we enable MSA
        // For MAC, we are still showing the old sign-in modal
        if (!this.props.includeOfficeApps || !signInUtils.shouldUseNewSigninModal()) {
            modalType = Constants.SignInType.OldSignInModal;
        }

        switch (modalType) {
            // This case is added to handle legacy sign-in modal
            case Constants.SignInType.OldSignInModal:
                modalContent = this.renderOldSignInModal();
                break;
            // The new dual purpose login modal
            case Constants.SignInType.SignInWith_MSA_AAD:
                modalContent = this.renderDualPurposeLoginModal();
                break;
            // Work only login modal
            case Constants.SignInType.SignInWith_AAD:
                modalContent = this.renderWorkOnlyModal();
                break;
            // Sign-in modal to switch from MSA to AAD
            case Constants.SignInType.SwitchTo_AAD:
                modalContent = this.renderSwitchAccountModal();
                break;

            default: modalContent = this.renderOldSignInModal();
        }

        return modalContent;
    }

    renderImpl() {
        return (
            <div role='dialog' tabIndex={-1} className='signInModalClass'>
                {this.renderModalContent(this.props.signInModalType)}
            </div>
        );
    }
}

(SignInModal as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
