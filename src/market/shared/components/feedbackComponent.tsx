import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ILocContext, ICommonContext } from '../interfaces/context';
import { ITelemetryData } from './../Models';
import { getWindow } from '../services/window';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';

let classNames = require('classnames-minimal');

export interface IFeedbackProps {
    feedback: boolean;
    preloadEmail: string;
    closeDialog: () => void;
}

export class FeedbackComponent extends SpzaComponent<IFeedbackProps, any> {
    context: ILocContext & ICommonContext;
    private instrument = SpzaInstrumentService.getProvider();
    private emailRe: RegExp;

    constructor(props: IFeedbackProps, context: ILocContext & ICommonContext) {
        super(props, context);
        this.state = {
            happyChoice: true,
            checkbox1: false,
            checkbox2: false,
            checkbox3: false,
            privacy: false,
            comments: '',
            emailAddress: this.props.preloadEmail !== 'no user' ? this.props.preloadEmail : '',
            validEmailUI: true
        };

        let reStr1 = '^(([^<>()\\[\\]\\.,;:\\s@\\"]+(\\.[^<>()\\[\\]\\.,;:\\s@\\"]+)*)|(\\".+\\"))';
        let reStr2 = '@(([^<>()[\\]\\.,;:\\s@\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\"]{2,})$';
        this.emailRe = new RegExp(reStr1 + reStr2, 'i');
    }

    handleSubmit() {
        if (this.state.privacy) {
            if (this.emailRe.test(this.state.emailAddress)) {
                this.setState({validEmailUI : true});
            } else {
                this.setState({validEmailUI : false});
                return;
            }
        }

        let feedbackResult = {
            happyExperience: this.state.happyChoice,
            browseContributuion: this.state.checkbox1,
            installContribution: this.state.checkbox2,
            findContribution: this.state.checkbox3,
            comments: this.state.comments || '',
            email: this.state.privacy ? this.state.emailAddress : ''
        };

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Feedback,
            details: JSON.stringify(feedbackResult)
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
        this.setState({
            happyChoice: true,
            checkbox1: false,
            checkbox2: false,
            checkbox3: false,
            privacy: false,
            comments: '',
            emailAddress: this.props.preloadEmail !== 'no user' ? this.props.preloadEmail : '',
            validEmailUI: true
        });
        this.props.closeDialog();
    }

    changeFaceChoice(choice: boolean) {
        this.setState({happyChoice: choice});
    }

    onChangeCheckbox1() {
        this.setState({ checkbox1: !this.state.checkbox1 });
    }

    onChangeCheckbox2() {
        this.setState({ checkbox2: !this.state.checkbox2 });
    }

    onChangeCheckbox3() {
        this.setState({ checkbox3: !this.state.checkbox3 });
    }

    onChangePrivacy() {
        this.setState({ privacy: !this.state.privacy});
    }

    editEmail(e: any) {
        this.setState({ emailAddress: e.target ? e.target.value : ''});
        if (this.state.privacy) {
            if (this.emailRe.test(this.state.emailAddress)) {
                this.setState({validEmailUI : true});
            } else {
                this.setState({validEmailUI : false});
            }
        }
    }

    componentWillReceiveProps(nextProps: IFeedbackProps, nextState: any) {
        if (nextProps.preloadEmail !== this.props.preloadEmail) {
            this.setState({
                emailAddress: nextProps.preloadEmail
            });
        }
    }

    editComments(e: any) {
        this.setState({ comments : e.target ? e.target.value : ''});
    }

    renderImpl() {
        const classes = classNames({
            'feedbackDialog': true,
            'dialogClosed': !this.props.feedback
        });

        const happyClasses = classNames({
            'happyImg': true,
            'happyChosen': this.state.happyChoice,
            'happyNotChosen': !this.state.happyChoice
        });

        const unhappyClasses = classNames({
            'sadImg': true,
            'unhappyChosen': !this.state.happyChoice,
            'unhappyNotChosen': this.state.happyChoice
        });

        const emailInputClasses = classNames({
            'c-text-field': true,
            'feedbackEmailInput': true,
            'invalidEmailInput': this.state.privacy && !this.state.validEmailUI
        });

        return(
            <div className={classes}>
                {this.props.feedback ? <div className='overlay' onClick={this.props.closeDialog}></div> : null}
                <div className='feedbackDialogContent'>
                    <span className='contentHeader'>{this.context.loc('Feedback_Header')}</span>
                    <span className='subHeader1'>{this.context.loc('Feedback_subHeader2')}</span>
                    <div className='faces'>
                        <div className='happyFace' onClick={() => this.changeFaceChoice(true)}>
                            <div className={happyClasses}></div>
                        </div>
                        <div className='sadFace' onClick={() => this.changeFaceChoice(false)}>
                            <div className={unhappyClasses}></div>
                        </div>
                    </div>
                    <div className='checkboxes'>
                        <div className='c-checkbox checkboxContainer'>
                            <span className='c-label checkboxesHeader'>{this.context.loc('Feedback_checkbox_header')}</span>
                                <label className='c-label'>
                                    <input aria-label='Control label 1 (vertical group)' type='checkbox'
                                           name='checkboxId8a' value='value8a' aria-checked='false' checked={this.state.checkbox1}
                                           onChange={this.onChangeCheckbox1.bind(this)} />
                                    <span aria-hidden='true'>{this.context.loc('Feedback_browse')}</span>
                                </label>
                                <label className='c-label'>
                                    <input aria-label='Control label 2 (vertical group)' type='checkbox'
                                           name='checkboxId8b' value='value8b' aria-checked='false' checked={this.state.checkbox2}
                                           onChange={this.onChangeCheckbox2.bind(this)} />
                                    <span aria-hidden='true'>{this.context.loc('Feedback_Find_app_product')}</span>
                                </label>
                                <label className='c-label'>
                                    <input aria-label='Control label 3 (vertical group)' type='checkbox'
                                           name='checkboxId8c' value='value8c' aria-checked='false' checked={this.state.checkbox3}
                                           onChange={this.onChangeCheckbox3.bind(this)} />
                                    <span aria-hidden='true'>{this.context.loc('Feedback_Install_app_product')}</span>
                                </label>
                        </div>
                    </div>
                    <div className='c-textarea feedbackTextArea'>
                        <textarea id='default-textarea-2' className='f-resize' name='textarea-default'
                                  value={this.state.comments}
                                  placeholder={this.context.loc('NPS_RatingReasonQuestion')}
                                  onChange={this.editComments.bind(this)}></textarea>
                    </div>
                    <div className='c-checkbox feedbackPrivacy'>
                        <label className='c-label'>
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
                           placeholder={this.props.preloadEmail === 'no user' ? 'email address' : ''}
                           name='default'
                           disabled={!this.state.privacy} />
                    <div className='feedbackButton'>
                        {
                            !this.state.privacy || (this.state.privacy && this.state.validEmailUI) ? null :
                            <span className='invalidEmailText'>{this.context.loc('Feedback_invalidEmail')}</span>
                        }
                        <button id='submit'
                                name='button'
                                className='c-button requestbutton'
                                type='submit'
                                disabled={this.state.privacy && !this.state.validEmailUI}
                                onClick={this.handleSubmit.bind(this) }>{this.context.loc('NPS_SubmitButton', 'Submit')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

(FeedbackComponent as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
