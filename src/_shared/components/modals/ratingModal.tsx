
import * as React from 'react';
import { ILocContext, ICommonContext, ILocParamsContext } from '../../interfaces/context';
import { ITelemetryData, IUserReview, IReviewPayload } from '../../Models/Models';
import { IUserDataState } from './../../states/state';
import { Constants } from '../../utils/constants';
import SpzaComponent from '../spzaComponent';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../../services/window';
import * as reviewRestClient from '../../services/http/reviewRestClient';
import { RichTextDropDown, IRichTextDropDownItem } from '../richTextDropDown';
import { ProductBitmaskEnum } from '../../utils/dataMapping';
import { urlPush } from '../../routerHistory';

let classNames = require('classnames-minimal');

export interface IRatingModalProps {
    payload: IReviewPayload;
    userInfo: IUserDataState;
    dismissModal: () => void;
    setUserReviewStatus: (hasReview: boolean) => void;
}

export interface IRatingState {
    showMode?: string;
    readySubmit?: boolean;
    rating?: number;
    review?: string;
    label?: string;
    description?: string;
    updateReview?: boolean;
    title?: string;
    submitted?: string;
    error?: string;
    dropdownList?: IRichTextDropDownItem<string>[];
    dropdownItem?: IRichTextDropDownItem<string>;
}

export default class RatingModal extends SpzaComponent<IRatingModalProps, IRatingState> {
    context: ILocContext & ICommonContext & ILocParamsContext;
    auth: string;
    iconURL: string;
    private showMode: string;
    private accessKey: string;
    private instrument = SpzaInstrumentService.getProvider();
    private dropdownMenu: IRichTextDropDownItem<string>[] = [];

    constructor(props: IRatingModalProps, context: ILocContext & ICommonContext & ILocParamsContext) {
        super(props, context);

        this.initMode();

        if (this.props.payload.app.detailInformation && this.props.payload.app.detailInformation.LargeIconUri) {
            this.iconURL = this.props.payload.app.detailInformation.LargeIconUri;
        } else {
            this.iconURL = this.props.payload.app.iconURL;
        }

        this.state = {
            showMode: this.showMode,
            readySubmit: false,
            rating: null,
            description: '',
            label: '',
            updateReview: false,
            title: '',
            submitted: '',
            dropdownList: this.dropdownMenu,
            dropdownItem: this.dropdownMenu[0]
        };
    }

    initMode() {
        this.dropdownMenu.push({ text: this.context.loc('rating_contactRate1', 'Select one'), value: 'Select one' });
        this.dropdownMenu.push({ text: this.context.loc('rating_contactRate2', 'Within 5 days'), value: 'Within 5 days' });
        this.dropdownMenu.push({ text: this.context.loc('rating_contactRate3', '5 - 10 days'), value: '5 - 10 days' });
        this.dropdownMenu.push({ text: this.context.loc('rating_contactRate4', 'More than 10 days'), value: 'More than 10 days' });
        this.dropdownMenu.push({ text: this.context.loc('rating_contactRate5', 'Did not reach out'), value: 'Did not reach out' });

        if (this.props.payload.accessKey) {
            this.showMode = 'default';
            this.auth = 'accessKey';
            this.accessKey = this.props.payload.accessKey;
        } else {
            if (this.props.userInfo.signedIn) {
                this.showMode = 'default';
                this.auth = 'authorization';
                this.accessKey = this.props.userInfo.accessToken.spza;
            } else {
                this.closeModal();
            }
        }
    }

    removeQueryParamsFromUrl(): string {
        let url = window.location.href;
        if (url && url.indexOf('?') > 0) {
            url = url.substr(0, url.indexOf('?'));
        }
        return url;
    }

    closeModal(e?: any) {
        let url = this.removeQueryParamsFromUrl();
        urlPush(url);
        this.props.dismissModal();
    }

    componentDidMount() {
        let self = this;
        let appid = (this.auth === 'accessKey') ? this.props.payload.app.appid : '';
        reviewRestClient.get(this.auth, this.accessKey, appid).then((result: IUserReview[]) => {
            let review: IUserReview = null;
            let found: IUserReview = null;

            for (let i = 0; i < result.length; i++) {
                review = result[i];
                if (review && review.appid === this.props.payload.app.appid) {
                    found = review;
                    break;
                }
            }

            let data = found;

            if (data && data.rating && data.description) {
                // found review
                self.setState({
                    showMode: 'default',
                    readySubmit: true,
                    rating: data.rating,
                    title: data.title || '',
                    label: this.getRatingLabel(data.rating),
                    description: data.description,
                    submitted: data.submitted,
                    updateReview: true,
                    dropdownItem: data.responseRate ? { text: data.responseRate, value: data.responseRate } : this.state.dropdownList[0]
                });
                document.getElementsByTagName('title')[0].innerHTML =
                    this.context.locParams('reviewModal_pageTitle', [this.props.payload.app.title]);
            } else {
                // successfully received but no review found
                self.setState({
                    showMode: 'default',
                    updateReview: false,
                    readySubmit: true
                });
            };
        },
            (err) => {
                this.handleError(err);
            });
    }

    getRatingLabel(rating: number) {
        let ratingNumber = (rating < 1 || rating > 5) ? 0 : rating;
        let dynamicLabel = '';
        if (ratingNumber === 1) {
            dynamicLabel = this.context.loc('Rating_OneStar', 'awful.');
        } else if (ratingNumber === 2) {
            dynamicLabel = this.context.loc('Rating_TwoStar', 'poor.');
        } else if (ratingNumber === 3) {
            dynamicLabel = this.context.loc('Rating_ThreeStar', 'fair.');
        } else if (ratingNumber === 4) {
            dynamicLabel = this.context.loc('Rating_FourStar', 'good.');
        } else {
            dynamicLabel = this.context.loc('Rating_FiveStar', 'excellent.');
        }
        return dynamicLabel;
    }

    handleRatingChange(ratingNumber: number) {
        this.setState({
            rating: ratingNumber,
            label: this.getRatingLabel(ratingNumber)
        });
    }

    ratingPane(self: any) {
        let RatePane: JSX.Element[] = [];
        let arr = [1, 2, 3, 4, 5];
        arr.map((value) => {
            const startColor = classNames({
                'f-fill': self.state.rating >= value,
                'f-none': self.state.rating < value,
                'c-glyph': true
            });
            let nameString = value.toString();
            RatePane.push(
                <button className={startColor} type='button' name={nameString}
                    itemProp={value === 1 ? 'worstRating' : (value === 5 ? 'bestRating' : null)}
                    onClick={() => this.handleRatingChange(value)}>
                    <span className='x-screen-reader'>Rate {value} star</span>
                </button>
            );
        });
        return RatePane;
    };

    onReviewTitleChange(e: any) {
        this.setState({
            title: e.target ? e.target.value : null
        });
    }

    onReviewContentChange(e: any) {
        this.setState({
            description: e.target ? e.target.value : null
        });
    }

    handleSubmit(e: any) {
        let reviewData: IUserReview = {
            appid: this.props.payload.app.appid,
            product: this.props.payload.app.products ? this.props.payload.app.products.toString() : ProductBitmaskEnum[this.props.payload.app.primaryProduct],
            rating: this.state.rating,
            title: this.state.title,
            description: this.state.description,
            isPublic: true,
            submitted: this.state.submitted || Date.now().toString(),
            lastUpdated: Date.now().toString(),
            responseRate: this.state.dropdownItem.value
        };
        let self = this;

        reviewRestClient.post(this.auth, this.accessKey, reviewData).then((res) => {
            self.setState({
                showMode: 'success',
                rating: null,
                description: '',
                label: '',
                updateReview: self.state.updateReview,
                title: ''
            });
            if (this.auth === 'authorization') {
                this.props.setUserReviewStatus(true);
            }
            self.props.payload.callback('success');
        }, (err) => {
            this.handleError(err);
        });
    }

    handleError(err: any) {

        if (err && err.response && err.response.statusCode && err.response.statusCode === 403) {
            let errorMessage = err.response.statusCode.toString();
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.RRSubmit,
                details: 'RatingModal cannot fetch the review from the server: ' + errorMessage
            };

            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

            this.setState({
                showMode: 'error',
                updateReview: false,
                readySubmit: false
            });
        }
    }

    handleUpdate(e: any) {
        this.handleSubmit(e);
    }

    renderImpl() {
        if (this.state.showMode === 'error') {
            return (
                <div role='dialog' tabIndex={-1} className='errorModalClass'>
                    <div className='prompContainer'>
                        <div className='toolBar'>
                            <button className='cancel' onClick={this.closeModal.bind(this)}>
                                <span className='c-glyph'></span>
                            </button>
                        </div>
                        <div className='errorModal'>
                            <div className='contentHeader'>
                                {this.context.loc('Rating_ExpiredHeader', 'Oops, the link has expired!')}
                            </div>
                            <div className='errorContent'>
                                <div className='errorMessage'>{this.context.loc('Rating_ExpiredBody', 'The request for reviewing this app has expired or is no longer valid.')}</div>
                                <div className='dismissErrorButton'>
                                    <button name='button'
                                        className='c-button'
                                        type='submit'
                                        onClick={this.closeModal.bind(this)} >
                                        {this.context.loc('Rating_FailedButton', 'Close')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>);
        };
        if (this.state.showMode === 'success') {
            return (
                <div role='dialog' tabIndex={-1} className='ratingModalClass'>
                    <div className='prompContainer'>
                        <div className='toolBar'>
                            <button className='cancel' onClick={this.closeModal.bind(this)}>
                                <span className='c-glyph'></span>
                            </button>
                        </div>
                    </div>
                    <div className='ratingSuccessDialog'>
                        <div className='successHeader'>{this.context.loc('Rating_SuccessHeader', 'Thank you for your feedback!')}</div>
                        <div className='successCheck'>
                            <img src='/images/checkLarge.png' />
                        </div>
                        <div className='successFooter'>
                            <button name='button' className='c-button requestButton' type='submit'
                                onClick={this.closeModal.bind(this)}>{this.context.loc('Rating_SuccessButton', 'Done')}</button>
                        </div>
                    </div>
                </div>
            );
        }

        // default case

        return (
            <div role='dialog' tabIndex={-1} className='ratingModalClass'>
                <div className='prompContainer'>
                    <div>
                        <div className='topBar'>
                            <div className='contentHeader c-heading-4 f-lean'>{this.context.loc('Rating_HeaderUpdateReview', 'Review this app')}</div>
                            <button className='cancel' onClick={this.closeModal.bind(this)}>
                                <span className='c-glyph'></span>
                            </button>
                        </div>
                        <div className='ratingModal'>
                            <div className='section1'>
                                <div className='iconHost'>
                                    <img className='appLargeIcon' src={this.iconURL} />
                                </div>
                                <div className='titles'>
                                    <div className='appTitle'>{this.props.payload.app.title}</div>
                                    <div className='appSubtitle c-caption-1'>{'By ' + this.props.payload.app.publisher}</div>
                                </div>
                            </div>
                            <div className='section2'>
                                <div className='ratingBlock'>
                                    <div className='ratePane'>
                                        <div className='requiredField'>
                                            <div className='required'>
                                                <img src='/images/requiredIcon.png' />
                                            </div>
                                            <div className='ratingLabel'>{this.context.loc('Rating_PaneContent', 'Your overall experience was')}
                                                <div className='labelchoice'>{this.state.label}</div>
                                            </div>
                                        </div>
                                        <div className='c-rating f-interactive' itemscope itemtype='https://schema.org/Rating'>
                                            <p className='x-screen-reader'>Not yet rated</p>
                                            <form>{this.ratingPane(this)}</form>
                                        </div>
                                    </div>
                                    {this.props.payload.ctaType && (this.props.payload.ctaType === 'CTA_RequestTrial' || this.props.payload.ctaType === 'CTA_ContactMe') ?
                                        <div className='contactDropdown'>
                                            <label className='menuHeader'>When did this partner first reply?</label>
                                            <RichTextDropDown
                                                className='menuItem'
                                                options={this.state.dropdownList}
                                                defaultValue={this.state.dropdownItem}
                                                onChange={(option: any) => this.setState({ dropdownItem: option })}
                                            />
                                        </div> : null
                                    }
                                </div>
                                <div className='reviewContainer'>
                                    <div className='topMessage'>{this.context.loc('Rating_ReviewHeader', 'Review title')}</div>
                                    <input className='c-text-field f-flex ratingTitleInput'
                                        onChange={this.onReviewTitleChange.bind(this)}
                                        type='text'
                                        name='placeholder'
                                        value={this.state.title}
                                        placeholder={this.context.loc('Rating_ReviewTitlePlacehoder', 'Title (optional)')}></input>
                                    <div className='c-textarea'>
                                        <label className='c-label topMessage' for='default-textarea-2'>{this.context.loc('Rating_ReviewDetail', 'Review details')}</label>
                                        <textarea id='default-textarea-2'
                                            className='f-no-resize ratingTextArea'
                                            rows={3}
                                            name='textarea-default'
                                            onChange={this.onReviewContentChange.bind(this)}
                                            value={this.state.description}
                                            placeholder={this.context.loc('Rating_ReviewContentPlacehoder', 'Write a review')}></textarea>
                                    </div>
                                </div>
                                <div className='ratingButton'>
                                    {
                                        this.state.updateReview ?
                                            <button id='submit' name='button' disabled={!this.state.rating || !this.state.readySubmit}
                                                className='c-button requestButton' type='submit'
                                                onClick={this.handleUpdate.bind(this)}>{this.context.loc('Rating_UpdateButton', 'Update')}
                                            </button> :
                                            <button id='submit' name='button' disabled={!this.state.rating || !this.state.readySubmit}
                                                className='c-button requestButton' type='submit'
                                                onClick={this.handleSubmit.bind(this)}>{this.context.loc('NPS_SubmitButton', 'Submit')}
                                            </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(RatingModal as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
