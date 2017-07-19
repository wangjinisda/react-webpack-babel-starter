import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, IPartnerDataItem, ITelemetryData } from '../Models';
import { IUserDataState } from '../../State';
// import { Header } from 'containers/header';
import { Header } from './../../mac/containers/header';
// import Modal from 'containers/modals/modal';
import Modal from './../containers/modals/modal';
import { IBuildHrefFn } from '../interfaces/context';
import { getTelemetryAppData, getTelemetryPartnerData, isJsonString, logTenantInfo, getSpzaUserIdAndNewUserModifier } from '../utils/appUtils';
import { getWindow } from '../services/window';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { NpsModule } from '../utils/npsUtils';
// import { handleCTACallback } from 'handlers/appViewHandler';
import { handleCTACallback } from './../handlers/appViewHandler';
// import { Footer } from 'containers/footer';
import { Footer } from './../../mac/containers/footer';
import { getAppConfig } from '../services/init/appConfig';
import { TileOnDemandLoadingService } from '../services/tileOnDemandLoadingService';

// note: appview is acting as our 'service provider' through the usage of context.
// Feel free to declare which services you need in your context declaration and prosper!

export interface IAppViewProps {
    localizedStrings: any;
    locale: string;
    isEmbedded: boolean;
    embedHost: number;
    buildHref: IBuildHrefFn;
    showModal: boolean;
    performedSubsetQueryString: string;
    location: any;
    userInfo: IUserDataState;
    telemetryLoggedCount: number;
    showCTAModal: (appId: string, ctaType?: Constants.CTAType, skuId?: string) => void;
    showContactModal: (partnerId: string, crossListingAppcontext?: IAppDataItem, callback?: any) => void;
    showErrorModal: () => void;
    showNPSModal: () => void;
    autoSignIn: (userStore: any) => void; // This will trigger the action to update the user data in the state
    openTile: (detailUrl: string) => void;
    isInErrorDialog: boolean;
    updateTelemetryLoggedCount: () => void;
    nationalCloud: string;
    changeSearchText(searchValue: string): void;
    performSearchAll(seachText: string): Promise<any>;
    clearSearch(): void;
    registerTileExtraDataHandler(appData: IAppDataItem): void;
    getTileExtraDataHandler(idList: { [id: string]: number }): void;
}

export class AppView extends SpzaComponent<IAppViewProps, any> {
    private instrument = SpzaInstrumentService.getProvider();
    private tileOnDemandLoadingService: TileOnDemandLoadingService = new TileOnDemandLoadingService(this.props.registerTileExtraDataHandler, this.props.getTileExtraDataHandler);

    constructor(props: IAppViewProps) {
        super(props);
    }

    performSearchIfNeeded(props: IAppViewProps) {
        // The embedded app doesn't use Azure search, just live filtering
        if (props.isEmbedded) {
            return;
        }
        // you might wonder why we are executing the search here, instead of on the server or in the
        // search component. This is because we also want to make sure we execute the search if someone
        // uses the back button, which does not result in the search component searching, nor in the
        // server to be hit for a new request.

        // this route can work with the following params:
        // 1. filtering
        // 2. search

        // in the case of filtering: the filtering pane takes care of everything
        // in the case of searching: we should make sure that the right data is fetched

        // we need to perform the search if:
        // 1. we have a search query in the params
        // 2. that search query is different from the search query used to build the subset data with
        let search = props.location.query.search;
        if (search) {
            if (search !== props.performedSubsetQueryString && search.length >= 2) {
                console.log('going to perform a search all because params do not match performedSubsetQuery'
                    + props.performedSubsetQueryString);

                // we are rendering this page while we do not have the correct subset of data
                props.performSearchAll(search).then(v => {
                    // clear out search text
                    props.changeSearchText('');
                });
            }
        } else if (props.performedSubsetQueryString !== '') {
            // should follow the same conceptual path as an actual search. The changeSearchText would have been fired
            // when doing a real search, so we should do that now as well. This will increase the searchID for instance.
            props.clearSearch();
            props.changeSearchText('');
        }
    };

    // executed by client each time there are new props, except first time
    componentWillUpdate(nextProps: any) {
        this.performSearchIfNeeded(nextProps);
    }

    componentDidUpdate() {
        this.tileOnDemandLoadingService.getTileExtraData();
    }

    errorHandling(error: Event) {
        try {
            // The error object here vs the one that is used in the main client hook up are different adding this logging
            // to see what are the diff types of error we are showing to later decide on when not to show the error modal for errors not raised by our components 
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.ErrorModal,
                actionModifier: Constants.Telemetry.ActionModifier.Info,
                appName: 'N.A',
                details: error ? JSON.stringify(error) : 'Error object null'
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
            // TODO : Remove this hack after the Power BI null images issue is sorted out
            let showError = true;
            if (error.target['nodeName'] && error.srcElement['nodeName'] && (error.target['nodeName'].toString() === 'image' || error.srcElement['nodeName'].toString() === 'image' ||
                error.target['nodeName'].toString() === 'IMG' || error.srcElement['nodeName'].toString() === 'IMG')) {
                showError = false;
            }
            // We dont wanna show errors for an empty or isTrusted error object as the site is still expected to be functional
            if (error && Object.getOwnPropertyNames(error).length === 0 || error && error.isTrusted && error.isTrusted === true) {
                showError = false;
            }
            if (showError) {
                this.props.showErrorModal();
            }
        } catch (err) {
            console.log('something went wrong while showing error modal' + err);
        }
    }


    // We need to remove all the event listeners once the component is unmounted.
    componentWillUnmount() {
        getWindow().removeEventListener('error', this.errorHandling.bind(this), false);
    }

    // We have 3 steps in the auto sign-in behavior. 
    // Step 1: Make a call to the AAD and get the user info into the sub iframe.
    // Step 2: Make a post message from the sub iframe to the parent appsource site with the user info.[This receiveMessage api will be called when we receive the message]
    // Step 3 : Using this user data, we make a auto signin action which will update the State using userDataReducer
    receiveMessage(event: Event) {
        // We should listen only to the messages from the iframes with the same origin.
        if (!event || !event['data'] || !event['origin'] || !window.location.hostname || event['origin'].indexOf(window.location.hostname) === -1) {
            return;
        }

        let data = event['data']; // Extract the payload data from the event 
        let payload = data ? isJsonString(data) : '';

        // If the user is already signed-in, we should not trigger the sign in action
        // Also check for the null values in the mandatory fields.
        if (payload && payload['msgType'] === 'authIframe'
            && payload['id'] && payload['signedIn'] && payload['group']
            && payload['idToken'] && payload['accessToken'] && payload['refreshToken']
            && payload['firstName'] && payload['lastName'] && payload['email']) {
            let userStore: IUserDataState = {
                id: payload['id'],
                signedIn: payload['signedIn'],
                group: payload['group'],
                idToken: payload['idToken'],
                accessToken: payload['accessToken'],
                refreshToken: payload['refreshToken'],
                firstName: payload['firstName'],
                lastName: payload['lastName'],
                displayName: payload['displayName'],
                oid: payload['oid'],
                tid: payload['tid'],
                email: payload['email'],
                alternateEmail: payload['alternateEmail'],
                isMSAUser: payload['isMSAUser'],
                isFieldUser: payload['isFieldUser'],
                tokenRefreshTime: payload['tokenRefreshTime']
            };

            let userIdInfo = getSpzaUserIdAndNewUserModifier();

            this.props.autoSignIn(userStore);
            logTenantInfo(this.props.userInfo, true, userIdInfo.spzaUserId);
        }
    }

    componentDidMount() {
        // onerror event handler is added in the mainClientHookup. Client error logs are rendered from there. We use this event listener for just showing the error dialog.
        getWindow().addEventListener('error', this.errorHandling.bind(this), true);
        this.performSearchIfNeeded(this.props);

        // UHF fixups
        // NOTE: these need to be orchestrated with UHF changes in compass that I've made

        // Skip UHF fixups for the embedded app
        if (this.props.isEmbedded) {
            return;
        }

        // initialize nps functionality if the local storage is set to null in case the access is denied the initialize handles the null case
        let localStorage: any = null;
        try {
            localStorage = window.localStorage;
        } catch (e) {
            // Access denied :-(
        }
        NpsModule.Initialize(this.props.showNPSModal, localStorage);
        let params = this.props.location && this.props.location.query ? this.props.location.query : '';

        if (this.props.userInfo && !this.props.userInfo.signedIn && params && !params.ignoreAutoSignIn) {
            // Add the auth iframe to the DOM after the page load
            (window as any).appendAuthIframe(getAppConfig('correlationId'));

            // Auto-SignIn listener : Parent window is listening for the post message from the child iframe.
            if (window.addEventListener) {
                window.addEventListener('message', this.receiveMessage.bind(this), false);
            } else {
                (window as any).attachEvent('onmessage', this.receiveMessage.bind(this)); // Added this for old versions of IE
            }
        }

        // This is added here for the sign-in/sign-up redirect scenarios which are triggered by CTA.
        // Once we get redirected to SPZA after signing in, we need to show the CTA modal dialog.
        if (params && params.modalAppId !== undefined) {
            // Added this as a fallback case when there will be duplicate modalAppIds in the queryParams
            if (typeof (params.modalAppId) === 'string') {
                this.props.showCTAModal(params.modalAppId, (params.testDrive && params.testDrive === 'true') ? Constants.CTAType.TestDrive : Constants.CTAType.Create);
            } else if (params.modalAppId.length > 0) {
                this.props.showCTAModal(params.modalAppId[0]);
            }
        }
        if (params && params.modalPartnerId !== undefined) {
            // Added this as a fallback case when there will be duplicate modalAppIds in the queryParams
            let crossListingAppcontext: any = null;
            if (typeof (params.modalPartnerId) === 'string') {
                if (params.appId !== undefined && params.productId !== undefined) {
                    if (typeof (params.appId) === 'string' && typeof (params.productId) === 'string') {
                        crossListingAppcontext = {
                            appid: params.appId,
                            primaryProduct: params.productId
                        };
                    }
                    this.props.showContactModal(params.modalPartnerId, crossListingAppcontext);
                } else {
                    this.props.showContactModal(params.modalPartnerId);
                }
            } else if (params.modalPartnerId.length > 0) {
                if (params.appId !== undefined && params.productId !== undefined) {
                    if (params.appId.length > 0 && params.productId.legth > 0) {
                        crossListingAppcontext = {
                            appid: params.appId[0],
                            primaryProduct: params.productId[0]
                        };
                    }
                    this.props.showContactModal(params.modalPartnerId[0], crossListingAppcontext);
                } else {
                    this.props.showContactModal(params.modalPartnerId[0]);
                }
            }
        }

        this.tileOnDemandLoadingService.getTileExtraData();
    }

    getChildContext() {
        return {
            loc: (textid: string, fallback?: string) => {
                let translated = this.props.localizedStrings[textid];
                // todo: remove these underscores for production
                translated = translated ? translated : (fallback ? fallback : textid);
                return translated;
            },
            locParams: (textid: string, params: string[], fallback?: string) => {
                let translated = this.props.localizedStrings[textid];
                for (let i = 0; i < params.length; i++) {
                    let regEx = new RegExp('\\{' + i + '\\}', 'gm');
                    translated = translated ? translated : (fallback ? fallback : textid);
                    translated = translated.replace(regEx, params[i]);
                }
                return translated;
            },
            locDateString: (dateAsString: string) => {
                return dateAsString ? new Date(dateAsString).toLocaleDateString(this.props.locale) : null;
            },
            buildHref: this.props.buildHref,
            ctaCallback: (app: IAppDataItem, ctaType: Constants.CTAType = Constants.CTAType.Create, skuId: string) => {
                let payload: ITelemetryData = {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Click,
                    actionModifier: Constants.Telemetry.ActionModifier.CTAModal,
                    appName: app.appid,
                    details: getTelemetryAppData(app, this.props.nationalCloud ? true : false, ctaType)
                };
                this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);

                handleCTACallback(this.props, app, ctaType, skuId);
            },
            contactCallback: (partner: IPartnerDataItem, crossListingAppcontext?: IAppDataItem) => {
                let payload: ITelemetryData = {
                    page: getWindow().location.href,
                    action: Constants.Telemetry.Action.Click,
                    actionModifier: Constants.Telemetry.ActionModifier.ContactModal,
                    partnerUrl: partner.friendlyURL,
                    details: getTelemetryPartnerData(partner, crossListingAppcontext != null)
                };
                this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
                this.props.showContactModal(partner.friendlyURL, crossListingAppcontext);
            },
            openTileCallback: (detailUrl: string) => {
                this.props.openTile(detailUrl);
            },
            renderErrorModal: () => {
                this.props.showErrorModal();
            },
            getTileOnDemandLoadingService: (): TileOnDemandLoadingService => {
                return this.tileOnDemandLoadingService;
            }
        };
    }

    renderFailImpl(err: any): any {
        // rendering is never allowed to throw an exception
        return this.props.showModal ? <Modal /> : null;
    }

    renderImpl() {
        NpsModule.ResetNPSIdle();

        if (this.props.isInErrorDialog) {
            // some component failed rendering, so we can't trust to render components again
            return <Modal />;
        } else {
            return (
                <div className='spza_root'>
                    <Header />
                    {this.props.children}
                    {this.props.showModal ? <Modal /> : null}
                    <Footer locale={this.props.locale} />
                </div>
            );
        }
    }
}

(AppView as any).childContextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    locDateString: React.PropTypes.func,
    locale: React.PropTypes.string,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    contactCallback: React.PropTypes.func,
    openTileCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    getTileOnDemandLoadingService: React.PropTypes.func
};
