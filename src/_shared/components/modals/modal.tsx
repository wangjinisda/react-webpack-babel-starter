import * as React from 'react';
import { SignInModal } from '../../components/modals/signInModal';
import VideoModal from './videoModal';
import DriveModal from './driveModal';
import IFieldHubModal from './fieldHubModal';
import ErrorModal from './errorModal';
import DisclaimerModal from './disclaimerModal';
import NpsModal from './npsModal';
import RatingModal from './ratingModal';
import SpzaComponent from './../spzaComponent';
import { LeadFormModal } from './leadFormModal';
import { Constants } from './../../utils/constants';
import { ProductEnum } from './../../utils/dataMapping';
import { IAppDataItem, IPartnerDataItem, IVideo, ITelemetryData, IReviewPayload, IDrive, IFieldHub, IDisclaimer } from './../../models/models';
import { IUserDataState } from './../../states/state';
import { IBuildHrefContext, ICommonContext } from '../../interfaces/context';
import { routes, appendQueryParams } from '../../routerHistory';
import { getWindow } from '../../services/window';
import { removeURLParameter } from '../../utils/appUtils';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { NpsModule } from '../../utils/npsUtils';
import { handleConsentModalCall } from './../../handlers/consentModalHandler';
let classNames = require('classnames-minimal');

export interface IModalProps {
    appId: string;
    modalId: number;
    allApps: IAppDataItem[];
    partnerId: string;
    allPartners: IPartnerDataItem[];
    userInfo: IUserDataState;
    isSignedIn: boolean;
    isEmbedded: boolean;
    options?: any;
    dismissModal: () => void;
    dismissModalWithRedirect: (href: string) => void;
    setUserReviewStatus: (hasReview: boolean) => void;
    ensureAppData: () => void;
    ensurePartnerData: () => void;
    payload: any;
    embedHost: number;
    accessToken: any;
    nationalCloud: string;
    includeOfficeApps?: boolean;
    refreshAccessToken: () => Promise<any>;
}

export class Modal extends SpzaComponent<IModalProps, any> {
    context: IBuildHrefContext & ICommonContext;

    componentWillMount() {
        this.props.ensureAppData();
        this.props.ensurePartnerData();
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End,
            details: JSON.stringify({ ModalId: this.props.modalId })
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);

        getWindow().addEventListener('keydown', this.handleKeyPress.bind(this), false);

        NpsModule.BlockShowingNPS();
    }

    handleKeyPress(e: KeyboardEvent) {
        // On pressing, escape key, the modal window should close.
        // Key code 27 refers to Escape key
        if (e.keyCode === 27) {
            this.dismissModal();
        }
    }

    componentWillUnmount() {
        let currWindow = getWindow();
        currWindow.removeEventListener('keydown', this.handleKeyPress.bind(this), false);
        // During CTA experience, when the user gets back from the Sign-in/Sign-up page to the modal,
        // there will be a query parameter(modalAppId) added in the end.
        // So, when the modal is dismissed, we need to get rid of this parameter
        /*
        if (currWindow.location.href.indexOf('modalAppId') > -1) {
            let pageURL = removeURLParameter(currWindow.location.href, 'modalAppId');
            urlReplace(pageURL);
        }
        */
        NpsModule.AllowShowingNPS();
    }

    dismissModal() {
        if (this.props.modalId === Constants.ModalType.Error) {
            if (!this.props.isEmbedded) {
                this.props.dismissModalWithRedirect(this.context.buildHref(routes.home, null, {
                    category: null,
                    industry: null,
                    product: null,
                    search: null
                }) as string);
            } else {
                let href = this.context.buildHref(routes.marketplace, null, {
                    category: null,
                    industry: null,
                    product: null,
                    showPrivateApps: false,
                    search: null,
                    page: null
                });
                // For the embedded app we need to convert the relative path to an absolute path by adding '/embed'
                href = '/embed' + appendQueryParams(href, { embedHost: ProductEnum[this.props.embedHost] });
                this.props.dismissModalWithRedirect(href);
            }
        } else {
            this.props.dismissModal();
        }
    }

    renderImpl() {
        let modalContent: any = null;
        let dismissModal = () => this.dismissModal();

        let modalBackgroundClasses = classNames({
            'spza_presentation': true,
            'spza_background_1': true,
            'spza_background_2': false
        });

        let modalClasses = classNames({
            'spza_dialog': true,
            'spza_dialog_design2': false
        });

        let appData: IAppDataItem = null;

        switch (this.props.modalId) {
            case Constants.ModalType.SignIn:
                modalContent = <SignInModal dismissModal={dismissModal} signInModalType={Constants.SignInType.SignInWith_MSA_AAD} includeOfficeApps={this.props.includeOfficeApps} />;
                break;
            case Constants.ModalType.CTA:
                appData = this.props.allApps.filter((x) => {
                    return (x.appid === this.props.appId);
                })[0];

                modalContent = handleConsentModalCall(this.props, appData, dismissModal, this.props.refreshAccessToken);
                break;
            case Constants.ModalType.Contact:
                let partnerData = this.props.allPartners.filter((x) => {
                    return (x.friendlyURL === this.props.partnerId);
                })[0];

                if (!this.props.isSignedIn && !this.props.isEmbedded) {
                    // In case the signin is invoked from the partnerTile within the context of an app details page 
                    // We need to set the appId as part of the query param for the lead form modal to use.
                    let crossListingAppContext: IAppDataItem = this.props.payload;
                    if (crossListingAppContext) {
                        modalContent = <SignInModal redirect={'partner'} partnerId={this.props.partnerId} signInModalType={Constants.SignInType.SignInWith_MSA_AAD}
                            appId={crossListingAppContext.appid} productId={crossListingAppContext.primaryProduct.toString()} dismissModal={dismissModal}
                            includeOfficeApps={this.props.includeOfficeApps} />;
                    } else {
                        modalContent = <SignInModal redirect={'partner'} partnerId={this.props.partnerId} signInModalType={Constants.SignInType.SignInWith_MSA_AAD}
                            dismissModal={dismissModal} includeOfficeApps={this.props.includeOfficeApps} />;
                    }
                } else {
                    modalContent = <LeadFormModal modalId={Constants.ModalType.Contact}
                        userInfo={this.props.userInfo}
                        partnerInfo={partnerData}
                        dismissModal={dismissModal}
                        accessToken={this.props.accessToken && this.props.accessToken.spza}
                        nationalCloud=''
                        crossListingAppContext={this.props.payload}
                        refreshAccessToken={this.props.refreshAccessToken} />;
                }
                dismissModal = null;
                break;
            case Constants.ModalType.Video:
                let video: IVideo = this.props.payload;
                modalContent = <VideoModal video={video} dismissModal={dismissModal} />;
                break;
            case Constants.ModalType.Drive:
                let drive: IDrive = this.props.payload;
                modalContent = <DriveModal drive={drive} dismissModal={dismissModal} />;
                break;
            case Constants.ModalType.Iframe:
                modalBackgroundClasses = classNames({
                    'spza_presentation': true,
                    'spza_background_1': false,
                    'spza_background_2': true
                });

                let iframePayload: IFieldHub = this.props.payload;
                modalContent = <IFieldHubModal iframeProps={iframePayload}
                    accessToken={this.props.accessToken}
                    dismissModal={dismissModal}
                    refreshAccessToken={this.props.refreshAccessToken} />;
                dismissModal = null;
                break;
            case Constants.ModalType.Error:
                modalContent = <ErrorModal dismissModal={dismissModal} />;
                break;
            case Constants.ModalType.Disclaimer:
                modalBackgroundClasses = classNames({
                    'spza_presentation': true,
                    'spza_background_1': false,
                    'spza_background_2': true
                });

                modalClasses = classNames({
                    'spza_dialog': true,
                    'spza_dialog_design2': true
                });

                let disclaimerPayload: IDisclaimer = this.props.payload;
                modalContent = <DisclaimerModal payload={disclaimerPayload} dismissModal={dismissModal} />;
                dismissModal = null;
                break;
            case Constants.ModalType.NPS:
                modalContent = <NpsModal dismissModal={dismissModal} emailAddress={this.props.userInfo.signedIn ? this.props.userInfo.email : 'no user'} />;
                dismissModal = null;
                break;
            case Constants.ModalType.Rating:
                let payload: IReviewPayload = this.props.payload;
                modalContent = <RatingModal
                    payload={payload}
                    userInfo={this.props.userInfo}
                    dismissModal={dismissModal}
                    setUserReviewStatus={this.props.setUserReviewStatus} />;
                dismissModal = null;
                break;
            default:
                break;
        }

        return (
            <div className={modalClasses}>
                {/* This presentation role is the grey background which we use behind the modal. On click, it closes the modal */}
                <div className={modalBackgroundClasses} onClick={dismissModal} ></div>
                {modalContent}
            </div>
        );
    }
}

(Modal as any).contextTypes = {
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
