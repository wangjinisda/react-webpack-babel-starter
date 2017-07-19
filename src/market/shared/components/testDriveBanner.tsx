import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ITestDriveState } from './../../State';
import { SolutionInstanceStatus, ITestDriveAcquistionsResponse, IAppDataItem, ITelemetryData } from './../Models';
import { Timer } from './timer';
import Animation from './animation';
import { getTestDriveByInstance, initializeTestDrive } from '../utils/testDriveUtils';
import { Constants } from '../utils/constants';
import { getWindow } from '../services/window';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICTACallbackContext, ICommonContext, ITestDriveContext} from '../interfaces/context';
// import { routes, urlReplace } from 'routerHistory';
let { routes, urlReplace } = require('./../../mac/routerHistory');
import { DataMap, ProductEnum } from '../utils/dataMapping';

// 7 seconds, to poll for change in status
const testDrivePollInterval = 7000;

export interface ITestDriveBannerProps {
    testDriveInstance: ITestDriveState;
    app: IAppDataItem;
    accessToken: string;
    testDriveToken: string;
    userInfo: any;
    flightCodes?: string;
}

export interface ITestDriveBannerState {
    testDriveInstance: ITestDriveState;
}

export class TestDriveBanner extends SpzaComponent<ITestDriveBannerProps, ITestDriveBannerState> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICTACallbackContext & ICommonContext & ITestDriveContext;
    // this is the interval Id for the poll, is used in unmount to kill the polling.
    private intervalId: any = null;
    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: ITestDriveBannerProps, context: IBuildHrefContext & ILocContext & ILocParamsContext
                     & ICTACallbackContext & ICommonContext & ITestDriveContext) {
        super(props, context);
        this.state = {
            testDriveInstance: this.props.testDriveInstance
        };
    }

    // invoked once, only on the client, after initial render
    componentDidMount() {
        if (this.props.testDriveInstance.state === SolutionInstanceStatus.Provisioning) {
            this.pollForStatusChange();
        }
    }

     componentWillUnmount() {
       if (this.intervalId) {
        clearInterval(this.intervalId);
       }
     }

    getChildContext() {
        return {
            timerCallback: () => {
                let instance = this.state.testDriveInstance;
                instance.state = SolutionInstanceStatus.Expired;
                this.setState({
                    testDriveInstance: instance
                });
            }
        };
    }

    showAppCta(ctaType: number) {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
            appName: this.props.app.appid,
            details: 'AppCTA_Clicked'
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
        this.context.ctaCallback(this.props.app, ctaType);
    }

    setPageState(instance: ITestDriveAcquistionsResponse, isError = false) {
        // if the new state is diff from the current state persist the state
        if (this.state.testDriveInstance.state !== instance.status) {
            this.context.persistTestDriveState(instance);
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
                appName: this.props.app.appid,
                details: JSON.stringify(instance)
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
        }
        if (isError) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.AzureTestDrive,
                appName: this.props.app.appid,
                details: 'TestDriveBanner: Error while setting the test state, test drive instance null'
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
            let testdrive: ITestDriveState = {
                appid: this.props.app.appid,
                expirationDate: null,
                id: null,
                outputs: null,
                state: SolutionInstanceStatus.Error
            };
            this.setState({
                testDriveInstance: testdrive
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
                testDriveInstance: testdrive
            });
        }
    }

    pollForStatusChange() {
        this.intervalId = setInterval(() => {
            getTestDriveByInstance(this.props.app.appid, this.props.testDriveInstance.id, this.props.accessToken, this.props.testDriveToken)
                .then((result: ITestDriveAcquistionsResponse) => {
                    if (result.status !== SolutionInstanceStatus.Provisioning) {
                        this.setPageState(result);
                        clearInterval(this.intervalId);
                    }
                }, () => {
                    this.setPageState(null, true);
                    clearInterval(this.intervalId);
                }).catch(() => {
                    this.setPageState(null, true);
                    clearInterval(this.intervalId);
                });
        }, testDrivePollInterval);
    }

    getTestDrivePageUrl() {
        let productString = ProductEnum[this.props.app.primaryProduct];
        let productData = DataMap.products[productString];
        let product = productData ? productData.UrlKey : productString;
        return this.context.buildHref(routes.testDrive, { productId: product, appid: this.props.app.appid },
            { 'instanceId': this.state.testDriveInstance.id }, true);
    }

    createTestDrive(): void {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.TestDrive,
            appName: this.props.app.appid,
            details: 'RepeatTestDrive_Clicked'
        };
        this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);

        initializeTestDrive(this.props.userInfo, this.props.app, this.props.accessToken, this.props.testDriveToken, this.props.flightCodes)
            .then((result: ITestDriveAcquistionsResponse) => {
                if (this.props && result) {
                    this.setPageState(result);
                    urlReplace(this.getTestDrivePageUrl());
                } else {
                    this.setPageState(null, true);
                }
            }, () => {
                this.setPageState(null, true);
            }).catch(() => {
                this.setPageState(null, true);
            });
    }

    navigateToTestDrive() {
        let output = this.state.testDriveInstance.outputs.filter((item) => item.type.toLowerCase() === 'handoffurl');
        if (this.state.testDriveInstance.state === SolutionInstanceStatus.Ready && output && output.length > 0) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.NavigatingToTestDrive,
                appName: this.props.app.appid,
                details: JSON.stringify(output[0].value)
            };
            this.instrument.probe<ITelemetryData>('logTelemetryInfo', payload);
            window.open(output[0].value, '_blank');
        }
    }

    getAsHTML(text: string) {
        return { __html: text };
    }

    getInProgressBanner() {
        let imgUri = '/images/TestDrive_Icon_Gear.png';
        return (

            <div className='bannerContainer'>
                <div className='progressSideBand'>
                    <img className='bandImage' src={imgUri} />
                </div>
                <div className='bannerColumnContainer'>
                     <div className='bannerSubContainer'>
                        <header className='c-bannerHeader'>
                            {this.context.loc('TestDrive_GettingReady_Header')}
                        </header>
                        <span className='c-timerTitle'>{this.context.loc('TestDrive_GettingReady_Details')}</span>
                    </div>
                    <div className='c-animation'>
                        <Animation isCircular={true} />
                    </div>
                </div>
            </div>

        );
    }

    getReadyBanner() {
        let imgUri = '/images/TestDrive_Icon_Check.png';
        let markDown = '';
        if (this.state.testDriveInstance.outputs.filter((item: any) => item.type.toLowerCase() === Constants.TestDriveOutputType.MetadataMarkdown).length > 0) {
            markDown = this.state.testDriveInstance.outputs.filter((item: any) => item.type.toLowerCase() === Constants.TestDriveOutputType.MetadataMarkdown)[0].value;
        }

        return (
            <div className='bannerContainer'>
                <div className='readySideBand'>
                    <img className='bandImage' src={imgUri} />
                </div>
                <div className='bannerColumnContainer'>
                    <div className='bannerSubContainer'>
                        <header className='c-bannerHeader'>
                            {this.context.loc('TestDrive_Active_1')}
                        </header>
                        <span className='c-timerTitle'><Timer endTime={this.state.testDriveInstance.expirationDate} /></span>
                    </div>
                    {markDown ? <div className='description markdown' dangerouslySetInnerHTML={this.getAsHTML(markDown)}></div> :
                        <button name='button' className='requestButton c-button c-testDriveButton' type='submit' onClick={() => this.navigateToTestDrive()}>
                            {this.context.loc('TestDrive_NavigateButton')}
                        </button>
                    }
                </div>
            </div>
        );
    }

    getExpiredBanner() {
        let imgUri = '/images/TestDrive_Icon_Clock.png';
        return (
            <div className='bannerContainer'>
                <div className='doneSideBand'>
                    <img className='bandImage' src={imgUri} />
                </div>
                <div className='bannerColumnContainer'>
                    <div className='bannerSubContainer'>
                        <header className='c-bannerHeader'>
                            {this.context.loc('TestDrive_Expired')}
                        </header>
                    </div>
                    <div className='bannerSubContainer'>
                        <button name='button' className='requestButton c-button c-testDriveButton' type='submit' onClick={() => this.showAppCta(Constants.CTAType.Create)}>
                            {this.context.loc(this.props.app.actionString).toUpperCase()}
                        </button>
                        <button name='button' className='requestButton c-button c-testDriveButton' type='submit' onClick={() => this.createTestDrive()}>
                            {this.context.loc('TestDrive_RepeatButton')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    getErrorBanner() {
        let imgUri = '/images/TestDrive_Icon_Error.png';
        return (
            <div className='bannerContainer'>
                <div className='doneSideBand'>
                    <img className='bandImage' src={imgUri} />
                </div>
                <div className='bannerColumnContainer'>
                    <div className='bannerSubContainer'>
                        <header className='c-bannerHeader'>
                            {this.context.loc('TestDrive_Error')}
                        </header>
                    </div>
                    <div className='bannerSubContainer'>
                        <button name='button' className='requestButton c-button c-testDriveButton' type='submit' onClick={() => this.showAppCta(Constants.CTAType.Create)}>
                            {this.context.loc(this.props.app.actionString)}
                        </button>
                        <button name='button' className='requestButton c-button c-testDriveButton' type='submit' onClick={() => this.createTestDrive()}>
                            {this.context.loc('TestDrive_RetryButton')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    renderImpl() {
        return (
            <div>
                {
                    this.state.testDriveInstance.state === SolutionInstanceStatus.Error ?
                        <div>
                            {this.getErrorBanner()}
                        </div>
                        :
                        <div>
                            {
                                this.state.testDriveInstance.state === SolutionInstanceStatus.Expired
                                    ?
                                    this.getExpiredBanner()
                                    :
                                    <div>
                                        {
                                            this.state.testDriveInstance.state === SolutionInstanceStatus.Ready
                                                ?
                                                this.getReadyBanner()
                                                :
                                                this.getInProgressBanner()
                                        }
                                    </div>
                            }
                        </div>
                }
            </div>
        );
    }
}

(TestDriveBanner as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    ctaCallback: React.PropTypes.func,
    persistTestDriveState: React.PropTypes.func
};

(TestDriveBanner as any).childContextTypes = {
    timerCallback: React.PropTypes.func
};

