import * as React from 'react';
import SpzaComponent from './spzaComponent';
import Animation from './animation';
import { IAppDataItem, ITelemetryData, SolutionInstanceStatus, ITestDriveAcquistionsResponse } from './../Models';
import { ITestDriveState } from './../../State';
// import { routes, urlPush } from 'routerHistory';
let { routes, urlPush } = require('./../../mac/routerHistory')
import { InternalLink } from './internalLink';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { getTestDriveByInstance } from '../utils/testDriveUtils';
import { DataMap, ProductEnum } from '../utils/dataMapping';
import { TestDriveBanner } from './testDriveBanner';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext, ITestDriveContext } from '../interfaces/context';

export interface ITestDrivePageProps {
    app?: IAppDataItem;
    testDriveInstance: ITestDriveState;
    isSignedin: boolean;
    accessToken: string;
    testDriveToken: string;
    instanceId?: string;
    userInfo: any;
    flightCodes?: string;
    persistTestDriveState: (state: ITestDriveAcquistionsResponse) => void;
    fetchAppDetails(targetApp: IAppDataItem): Promise<any>;
}

export interface ITestDrivePageState {
    testDriveState: ITestDriveState;
    videoEnabled: boolean;
}

export class TestDrivePage extends SpzaComponent<ITestDrivePageProps, ITestDrivePageState> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext & ITestDriveContext;

    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: ITestDrivePageProps, context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ITestDriveContext) {
        super(props, context);
        this.state = {
            testDriveState: this.props.testDriveInstance || null,
            videoEnabled: false
        };
    }

    setPageState(instance: ITestDriveAcquistionsResponse, isError = false) {
        // if the new state is diff from the current state persisit the state
        if (!this.state.testDriveState || this.state.testDriveState.state !== instance.status) {
            this.props.persistTestDriveState(instance);
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.PageLoad,
                actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
                appName: this.props.app.appid,
                details: JSON.stringify(instance)
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
        }
        if (isError) {
            let testdrive: ITestDriveState = {
                appid: this.props.app.appid,
                expirationDate: null,
                id: null,
                outputs: null,
                state: SolutionInstanceStatus.Error
            };
            this.setState({
                testDriveState: testdrive,
                videoEnabled: false
            });
        } else {
            let testdrive: ITestDriveState = {
                appid: this.props.app.appid,
                expirationDate: instance.expirationDate,
                id: instance.id,
                outputs: instance.outputs,
                state: instance.status
            };
            this.setState({
                testDriveState: testdrive,
                videoEnabled: false
            });
        }
    }

    // invoked once, both on client and server, immediately before rendering
    componentWillMount() {
        if (this.props.app) {

            // well, we got passed an app without detail information, lets trigger that
            if (!this.props.app.detailInformation && !this.props.app.detailLoadFailed) {
                this.props.fetchAppDetails(this.props.app);
            }
        }
    }

    // invoked when receiving new props, not on first render
    componentWillReceiveProps(nextProps: ITestDrivePageProps, nextState: any) {
        if (nextProps.app && !nextProps.app.detailInformation && !nextProps.app.detailLoadFailed) {
            this.props.fetchAppDetails(nextProps.app);

            // Set page title
            this.setPageTitle(nextProps.app.title);
        }
    }

    // invoked once, only on the client, after initial render
    componentDidMount() {
        if (this.props.app) {

            let testDriveDetails = this.props.testDriveInstance ? JSON.stringify(this.props.testDriveInstance) : 'LandedOnTestDrive';

            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.PageLoad,
                actionModifier: Constants.Telemetry.ActionModifier.End,
                appName: this.props.app.appid,
                details: testDriveDetails
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
            this.setPageTitle(this.props.app.title);
        }
        // landed on this page without the test drive state get it again from the API 
        // using the instance id from the query param and the token from user
        if (!this.props.testDriveInstance) {
            getTestDriveByInstance(this.props.app.appid, this.props.instanceId, this.props.accessToken, this.props.testDriveToken)
                .then((result: ITestDriveAcquistionsResponse) => {
                    this.setPageState(result);
                }, () => {
                    // in case of an error land on the details page, giving the user an option to start a new test drive
                    let payload: ITelemetryData = {
                        page: getWindow().location.href,
                        action: Constants.Telemetry.Action.PageLoad,
                        actionModifier: Constants.Telemetry.ActionModifier.Error,
                        appName: this.props.app.appid,
                        details: 'TestDrivePage: Error getting the test drive details, navigating to app details'
                    };
                    this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
                    urlPush(this.getDetailsPageUrl(), true);
                });
        }
    }


    logClickEvent(sourceElement: string) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            appName: this.props.app.appid,
            details: sourceElement
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
    }

    getChildContext() {
        return {
            persistTestDriveState: (instance: any) => {
                this.props.persistTestDriveState(instance);
            }
        };
    }

    setPageTitle(title: string) {
        document.getElementsByTagName('title')[0].innerHTML = this.context.locParams('detail_pageTitle', [title]);
    }

    getDetailsPageUrl(openModal = false) {
        let productString = ProductEnum[this.props.app.primaryProduct];
        let productData = DataMap.products[productString];
        let product = productData ? productData.UrlKey : productString;
        let appDetailUrl = this.context.buildHref(routes.appDetails, { productId: product, appid: this.props.app.appid }, { 'tab': 'Overview' });
        return appDetailUrl;
    }

    getgalleryUrl() {
        let galleryUrl = this.context.buildHref(routes.marketplace, null, false);
        return galleryUrl;
    }

    getIconElement() {
        let iconUri = '';
        if (this.props.app.detailInformation) {
            iconUri = this.props.app.detailInformation.LargeIconUri;
        }
        if (!iconUri) {
            return (
                <div className='iconHost'></div>
            );
        }
        return (
            <div className='iconHost' style={{ backgroundColor: this.props.app.detailInformation.IconBackgroundColor }} >
                <span className='thumbnailSpacer'></span>
                <img className='appLargeIcon' src={iconUri} />
            </div>
        );
    }

    getAppHeader() {
        return (
            <div className='headerContainer'>
                <div>
                    {this.getIconElement()}
                </div>
                <div className='headerSubContainer'>
                    <h5 className='c-heading-5 titleSubHeader'>{this.context.loc('TestDrive_Title')}</h5>
                    <h4 className='c-heading-4 titleHeader'>{this.props.app.title}</h4>
                    <h4 className='c-heading-5 titleSubHeader'>{this.context.locParams('TestDrive_PublisherTitle', [this.props.app.publisher])}</h4>
                </div>
            </div>
        );

    }

    getBreadcrumbElement() {
        return (
            <div>
                {
                    <div className='navigationBar' id='maincontent'>
                        <ul className='breadcrumb'>
                            <InternalLink href={this.getgalleryUrl()} role='button' className='c-button goBackButton'>
                                {this.context.loc('Embedded_Apps')}
                            </InternalLink>
                            <span className='c-glyph'></span>
                            <InternalLink href={this.getDetailsPageUrl()} role='button' className='c-button goBackButton'>
                                {this.props.app.title}
                            </InternalLink>
                            <span className='c-glyph'></span>
                            <header className='appTabButton'>{this.context.loc('TestDrive_Title')}</header>
                        </ul>
                    </div>
                }
            </div>
        );
    }

    getTestDriveInfo() {
        return (
            this.props.app.detailInformation && this.props.app.detailInformation.TestDriveDetails ?
                <div>
                    {
                        this.props.app.detailInformation.TestDriveDetails.description ?
                            <div className='container'>
                                <h6 className='c-heading-6 linkTitle'>{this.context.loc('TestDrive_DetailsTitle')}</h6>
                                <div className='description'>{this.props.app.detailInformation && this.props.app.detailInformation.TestDriveDetails.description}</div>
                            </div> : null
                    }
                    {
                        this.props.app.detailInformation.TestDriveDetails.instructionsDocument
                            && this.props.app.detailInformation.TestDriveDetails.instructionsDocument.DocumentUri ?
                            <div className='container'>
                                <h6 className='c-heading-6 linkTitle'>{this.context.loc('TestDrive_DocumentationTitle')}</h6>
                                <a href={this.props.app.detailInformation && this.props.app.detailInformation.TestDriveDetails.instructionsDocument.DocumentUri}
                                    className='c-hyperlink linkContent' rel='noreferrer' target='_blank' onClick={() => {
                                        this.logClickEvent('TestDriveManual');
                                    }}>{this.context.loc('TestDrive_ManualTitle')}</a>

                            </div> : null
                    }
                </div> : null
        );
    }

    getTestDriveVideo() {
        return (
            this.props.app.detailInformation && this.props.app.detailInformation.TestDriveDetails && this.props.app.detailInformation.TestDriveDetails.videos ?
                <div>
                    {
                        this.props.app.detailInformation.TestDriveDetails.videos.length > 0 ?
                            <div>
                                <h5 className='c-heading-5 titleSubHeader'>{this.context.loc('TestDrive_VideoTitle')}</h5>
                                <div className='videoHolder'>
                                    {
                                        this.state.videoEnabled ?
                                            <div className='videoContainer'>
                                                <iframe src={this.props.app.detailInformation.TestDriveDetails.videos[0].VideoLink}
                                                    width='97%' height='350' frameBorder='0' allowFullScreen>
                                                </iframe>
                                                <span className='c-glyph' onClick={() => {
                                                    this.logClickEvent('TestDriveVideo');
                                                    this.setState(
                                                        {
                                                            testDriveState: this.state.testDriveState,
                                                            videoEnabled: false
                                                        }
                                                    );
                                                }}></span>
                                            </div> :
                                            <div className='imgContent' onClick={() => { this.setState({ testDriveState: this.state.testDriveState, videoEnabled: true }); }}>
                                                <img src={this.props.app.detailInformation.TestDriveDetails.videos[0].ThumbnailURL} />
                                                <img className='overlay' src='/images/videoOverlay.png' />
                                            </div>
                                    }
                                </div>
                            </div> : null
                    }
                </div> : null
        );
    }

    renderImpl() {
        if (this.state.testDriveState) {
            return (
                <div className='spza_testDriveContainer'>
                    <div className='spza_content'>
                        <div className='testDrive_content'>
                            {this.getBreadcrumbElement()}
                            {this.getAppHeader()}
                            <div className='testDrive_container'>
                                <div className='testDrive_subcontainer'>
                                    <TestDriveBanner accessToken={this.props.accessToken}
                                        app={this.props.app}
                                        testDriveToken={this.props.testDriveToken}
                                        testDriveInstance={this.state.testDriveState}
                                        userInfo={this.props.userInfo}
                                        flightCodes={this.props.flightCodes}
                                    />
                                    {this.getTestDriveInfo()}
                                </div>
                                {this.getTestDriveVideo()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='spza_testDriveContainer'>
                    <div className='spza_content'>
                        <div className='testDrive_content'>
                            <div className='testDrive_spinnerContent'>
                                <header className='c-header'>{this.context.locParams('TestDrive_FetchingTitle', [this.props.app.title])}</header>
                                <div className='c-animation'>
                                    <Animation isCircular={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

(TestDrivePage as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func
};

(TestDrivePage as any).childContextTypes = {
    persistTestDriveState: React.PropTypes.func
};



