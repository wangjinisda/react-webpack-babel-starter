import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IUserDataState } from '../../State';
import { Constants } from '../utils/constants';
import { generateGuid } from '../utils/appUtils';
import { getWindow } from '../services/window';
import { routes, urlPush } from '../routerHistory';
import { IBuildHrefContext, ICommonContext } from '../interfaces/context';
import { IUserReview } from '../Models';
import { FeedbackComponent } from './feedbackComponent';
import * as reviewRestClient from '../services/http/reviewRestClient';
import * as graphRestClient from '../services/http/graphRestClient';
import { ITelemetryData } from './../Models';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
let classNames = require('classnames-minimal');

let queryStringUtil = require('query-string');

export interface IUser {
    openModal: (modalId: number) => void;
    userInfo: IUserDataState;
    correlationId: string;
}

export class UserComponent extends SpzaComponent<IUser, any> {
    defaultUserImage: string;
    reviewPageURL: string;
    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: IUser, context: IBuildHrefContext & ICommonContext) {
        super(props, context);
        this.defaultUserImage = '/images/defaultUser.png';
        this.state = {
            dropdown: false,
            feedback: false,
            thumbnail: this.defaultUserImage,
            hasReview: this.props.userInfo.hasReview
        };
        if (this.props.userInfo.signedIn) {
            this.updateReviewStatus();
        }
        this.reviewPageURL = context.buildHref(routes.myReviews, null, { category: null });
    }

    // todo: these routine will not be called at the moment and only for the following updates. 
    updateReviewStatus() {
        if (this.props.userInfo.signedIn) {
            reviewRestClient.get('authorization', this.props.userInfo.accessToken.spza, '*').then(
                (result: IUserReview[]) => {
                    if (result && result.length) {
                        this.setState({
                            hasReview: true
                        });
                    } else {
                        this.setState({
                            hasReview: false
                        });
                    }
                })
                .catch((error: any) => {
                    console.log(error);
                });
        }
    }

    openSignInForm() {
        this.props.openModal(Constants.ModalType.SignIn);
        this.setState({
            dropdown: false,
            thumbnail: this.defaultUserImage
        });
    }

    altDropdownMenu() {
        this.setState({dropdown: !this.state.dropdown, feedback: false});
    }

    altFeedbackDialog() {
        this.setState({feedback: !this.state.feedback, dropdown: false});
        let modalOpenClose = {
            openFeedbackModal: !this.state.feedback
        };

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.FeedbackModal,
            details: JSON.stringify(modalOpenClose)
        };

        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    closeFeedbackDialog() {
        this.setState({feedback: false});
    }

    isUserUrl(url: string) {
        if (url && url.split('/')[3] && url.split('/')[3].split('?')[0] === 'user') {
            return true;
        } else {
            return false;
        }
    }

    homeUrl() {
        let l = location.href.split('/');
        return l[0] + '//' + l[2] + '/';
    }

    signOut() {
        let requestId = generateGuid();
        let correlationId = this.props.correlationId;

        let href = getWindow().location.href;
        // We should not auto sign in once we log out of Appsource. This query parameter is handled in the default controller
        // TODO : This is the not the complete signOut. Once we close the browser and open it, we will be signed in again. Need to fix this.
        href = href && href.indexOf('?') > 0 ? href + '&ignoreAutoSignIn=true' : href + '?ignoreAutoSignIn=true';

        let url = this.isUserUrl(href) ? this.homeUrl() : href;

        // no need to encode
        let query = {};
        query['from'] = url;
        query[Constants.Headers.RequestId] = requestId;
        query[Constants.Headers.CorrelationId] = correlationId;

        let signOutUrl: string = '/logout?' + queryStringUtil.stringify(query);

        getWindow().location.href = signOutUrl;
    }

    getGraph() {
        let self = this;
        graphRestClient.get(this.props.userInfo.accessToken.graph).then((result: any) => {
            let reader = new FileReader();
            reader.readAsDataURL(result);
            reader.onloadend = function () {
                self.setState({ thumbnail: result });
            };
        }).catch((error) => {
            console.log('Warning: thumbnail failed to fetch from AD, use default image instead.');
        });
    }

    componentDidMount() {
        if (this.props.userInfo.signedIn) {
            this.getGraph();
        }

        // since componentDidMount is only called at client side after the first round of client side rendering 
        // is finished which would be consistent with the server side rendering result.
        // then readyToRenderAtClientSide is set to true here which would trigger another round of client side rendering.
        this.setState({
            readyToRenderAtClientSide: true
        });
    }

    openMyReview() {
        urlPush(this.reviewPageURL);
        this.setState({
            dropdown: false
        });
    }

    componentWillReceiveProps(nextProps: IUser) {
        if (nextProps.userInfo.hasReview !== this.props.userInfo.hasReview) {
            this.setState({
                hasReview: nextProps.userInfo.hasReview
            });
        }
    }

     handleBtnKeyPress(evt: any) {
        evt = evt || window.event;
        // only the enter key can toggle the user profile button to show/hide dropdown menu
        if (evt.charCode === 13) {
            this.altDropdownMenu();
        }
        evt.preventDefault();
    }

    renderImpl() {
        // readyToRenderAtClientSide is only be true from the 2nd round of client side rendering.
        // It means for the 1st round of client side rendering, the client side renders what be rendered at server side which is just an empty div.
        // Then from the 2nd round of client side rendering, the actual "user sign in" UI will be rendered.
        // The purpose of doing this is to avoid the actual "user sign in" UI with any user information be cached at server side.
        if (this.state.readyToRenderAtClientSide) {
        let context = this.context as any;
        let feedbackEmail = this.props.userInfo.signedIn ? this.props.userInfo.email : 'no user';
        const signedInFeedback = classNames({
            'spza_feedback': true,
            'separationBar': this.props.userInfo.signedIn
        });
            return (
            <div className='spza_signInBlock'>
                <div className={signedInFeedback} role='button' tabIndex={0} onClick={this.altFeedbackDialog.bind(this)}>
                    <div className='smileFace'></div>
                </div>
                <FeedbackComponent feedback={this.state.feedback} preloadEmail={feedbackEmail} closeDialog={this.closeFeedbackDialog.bind(this)}/>
                {
                    this.props.userInfo.signedIn ?
                    (
            <div className='spza_signButton spza_signedIn' role='button'
                    onKeyPress={(event: any) => { this.handleBtnKeyPress(event); }}
                    onClick={this.altDropdownMenu.bind(this)}
                    tabIndex={0}>
                <div className={this.state.dropdown ? 'userTitle userTabActive' : 'userTitle userTabInactive'}>
                            { this.state.thumbnail ?  <img title={this.props.userInfo.displayName} src={this.state.thumbnail}  /> : null }
                    <span>{this.props.userInfo.firstName}</span>
                </div>
                    {this.state.dropdown ?
                  (<ul className='userTab'>
                                <li>
                          <img className='userTabPhoto'
                            onClick={this.altDropdownMenu.bind(this)}
                            alt={this.props.userInfo.firstName}
                            src={this.state.thumbnail} />
                          <ul className='userTabInfo'>
                              <li className='userTabName'>{this.props.userInfo.displayName}</li>
                              <li className='userTabEmail'>{this.props.userInfo.email}</li>
                          </ul>
                      </li>
                      {/*{this.state.hasReview ?
                      (<li tabIndex={-1} className= 'userReviews'>
                          <button name='button' className='requestButton' type='SignOut' onClick={this.openMyReview.bind(this)}>{context.loc('Rating_MyReviews')}</button>
                      </li>) : null}*/}
                            <li tabIndex={-1} className='userTabSignOut'>
                          <button name='button' className='requestButton' type='SignOut' onClick={this.signOut.bind(this)}>{context.loc('SO_SignOutTitle')}</button>
                      </li>
                            </ul>) : null}
                        </div>
                    ) :
                    (
                        <div className='spza_signButton spza_signIn'>
                            <button className='c-button signInButton macSignInButton' type='button' onClick={this.openSignInForm.bind(this)}>{context.loc('SI_SignIn')}</button>
                        </div>
                    )
                }
            </div>
        );
    }

        return <div></div>;
    }
}

(UserComponent as any).contextTypes = {
    loc: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
