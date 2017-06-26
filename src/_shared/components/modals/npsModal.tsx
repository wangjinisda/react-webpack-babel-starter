import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { NpsModule } from './../../utils/npsUtils';
import { Constants } from './../../utils/constants';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { ITelemetryData } from './../../Models/Models';
import { ILocContext, ICommonContext } from '../../interfaces/context';
import { getWindow } from '../../services/window';
import { getNPSRatingQuestionLocKey } from '../../handlers/npsModalHandler';

let classNames = require('classnames-minimal');

interface INpsModalProps {
    emailAddress: string;
    dismissModal: () => void;
}

interface INpsState {
    rating?: string;
    description?: string;
    privacy: boolean;
    validEmailUI: boolean;
    emailAddress: string;
}

export default class NpsModal extends SpzaComponent<INpsModalProps, INpsState> {
    context: ILocContext & ICommonContext;
    private description: string;
    private instrument = SpzaInstrumentService.getProvider();
    private emailRe: RegExp;

    constructor(props: any, context: ILocContext & ICommonContext) {
        super(props, context);

        // if this poped-up, the timer is automatically delay a short
        // interval (two-hours).
        NpsModule.SetShortInterval();
        NpsModule.ResetNPSCount();

        this.description = '';
        this.state = {
            rating: null,
            description: '',
            privacy: false,
            validEmailUI: true,
            emailAddress: this.props.emailAddress !== 'no user' ? this.props.emailAddress : ''
        };
        let reStr1 = '^(([^<>()\\[\\]\\.,;:\\s@\\"]+(\\.[^<>()\\[\\]\\.,;:\\s@\\"]+)*)|(\\".+\\"))';
        let reStr2 = '@(([^<>()[\\]\\.,;:\\s@\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\"]{2,})$';
        this.emailRe = new RegExp(reStr1 + reStr2, 'i');
    }

    editDescription(e: any) {
        this.description = e.target ? e.target.value : '';
        this.setState({
            description: this.description,
            privacy: this.state.privacy,
            validEmailUI: this.state.validEmailUI,
            emailAddress: this.state.emailAddress
        });
    }

    handleRatingChange(ratingNumber: string, e: any) {
        this.setState({
            rating: ratingNumber,
            description: this.description,
            privacy: this.state.privacy,
            validEmailUI: this.state.validEmailUI,
            emailAddress: this.state.emailAddress
        });
    }

    decline() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.NPS,
            actionModifier: Constants.Telemetry.ActionModifier.Declined,
            details: ''
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
        NpsModule.Declined();
        this.props.dismissModal();
    }

    handleSubmit() {
        if (!this.state.rating || (this.state.privacy && !this.state.validEmailUI)) {
            return this.decline();
        }

        let npsResult = {
            rating: this.state.rating,
            description: this.state.description,
            email: this.state.privacy ? this.state.emailAddress : ''
        };

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.NPS,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: JSON.stringify(npsResult)
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

        NpsModule.Submitted();
        this.props.dismissModal();
    }

    onChangePrivacy() {
        this.setState({
            privacy: !this.state.privacy,
            validEmailUI: this.state.validEmailUI,
            emailAddress: this.state.emailAddress
        });
    }

    editEmail(e: any) {
        this.setState({
            privacy: this.state.privacy,
            validEmailUI: this.state.validEmailUI,
            emailAddress: e.target ? e.target.value : ''
        });

        if (this.state.privacy) {
            if (this.emailRe.test(this.state.emailAddress)) {
                this.setState({
                    privacy: this.state.privacy,
                    validEmailUI: true,
                    emailAddress: e.target ? e.target.value : ''
                });
            } else {
                this.setState({
                    privacy: this.state.privacy,
                    validEmailUI: false,
                    emailAddress: e.target ? e.target.value : ''
                });
            }
        }
    }

    ratingPane(self: any) {
        let paneContent: JSX.Element[] = [];
        let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        arr.map((value) => {
            const classes = classNames({
                'ratingSelected': self.state.rating === value,
                'ratingBlock': true,
                'ratingTen': value === '10'
            });
            paneContent.push(
                <li className={classes} value={value.toString()} onClick={() => this.handleRatingChange.bind(this)(value)}>
                    <a className='ratingNumber'>{value}</a>
                </li>
            );
        });
        return paneContent;
    };

    renderImpl() {
        const emailInputClasses = classNames({
            'c-text-field': true,
            'npsEmailInput': true,
            'invalidEmailInput': this.state.privacy && !this.state.validEmailUI
        });
        return (
            <div role='dialog' tabIndex={-1} className='npsModalClass'>
                <div className='prompContainer'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.decline.bind(this)}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    <div className='npsModal'>
                        <div className='contentHeader'>{this.context.loc('Feedback_Header')}</div>
                        <div className='rateHeader'>{this.context.loc(getNPSRatingQuestionLocKey(), 'How likely is it that you would recommend AppSource to a friend or colleague?')}</div>
                        <div className='rateSlider'>
                            <ul className='ratingControl'>{this.ratingPane(this)}</ul>
                            <div className='ratingLabel'>
                                <div className='ratingLeftLabel'>{this.context.loc('NPS_NotLikely', 'Not at all likely')}</div>
                                <div className='ratingRightLabel'>{this.context.loc('NPS_Likely', 'Very likely')}</div>
                            </div>
                        </div>
                        <div className='rateReasonInput'>
                            <textarea id='subscription' className='c-text-field f-flex npsTextArea'
                                   onChange={this.editDescription.bind(this)}
                                   value={this.description}
                                   type='text'
                                   placeholder={this.context.loc('NPS_RatingReasonQuestion', 'How likely is it that you would recommend AppSource to a friend or colleague?')}
                                   name='default' />
                        </div>
                        <div className='c-checkbox npsPrivacy'>
                            <label className='c-label privacyHeader'>
                                <input aria-label='Control label (unselected)' type='checkbox' id='checkboxId1'
                                    name='checkboxId1' value='value1' aria-checked='false' checked={this.state.privacy}
                                    onChange={this.onChangePrivacy.bind(this)}/>
                                <span aria-hidden='true'>{this.context.loc('Feedback_privacy_content')}
                                    <a target='_blank' href='https://privacy.microsoft.com/en-us/privacystatement' className='c-hyperlink'>{this.context.loc('Feedback_privacy')}</a>
                                </span>
                            </label>
                        </div>
                        <input className={emailInputClasses}
                               type='text'
                               onChange={this.editEmail.bind(this)}
                               value={this.state.emailAddress}
                               placeholder={this.props.emailAddress === 'no user' ? 'email address' : ''}
                               name='default'
                               disabled={!this.state.privacy} />
                        <div className='npsButton'>
                            {
                                !this.state.privacy || (this.state.privacy && this.state.validEmailUI) ? null :
                                <span className='invalidEmailText'>{this.context.loc('Feedback_invalidEmail')}</span>
                            }
                            <button id='submit' name='button'
                                    disabled={this.state.privacy && !this.state.validEmailUI || this.state.rating === null}
                                    className='c-button submitButton'
                                    type='submit'
                                    onClick={this.handleSubmit.bind(this) }>{this.context.loc('NPS_SubmitButton', 'Submit')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(NpsModal as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
