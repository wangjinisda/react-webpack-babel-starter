import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ILocContext, ILocParamsContext, ICommonContext, IBuildHrefContext } from '../interfaces/context';
import { IUserInfo, IAppDataItem, ITelemetryData, ITestDriveAcquistionsResponse, SolutionInstanceStatus } from '../Models';
import { initializeTestDrive, setTestDriveCookie, createAndPollForTestDrive } from '../utils/testDriveUtils';
import Animation from './animation';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { routes, urlPush } from './../routerHistory';
import { DataMap, ProductEnum } from '../utils/dataMapping';
import { shouldPollForTestDrive } from './../utils/testdriveConfig';

export interface ITestDriveProps {
    userInfo: IUserInfo;
    appInfo: IAppDataItem;
    dismissModal: () => void;
    accessToken: string;
    testDriveAccessToken: string;
    persistTestDriveState: (state: ITestDriveAcquistionsResponse) => void;
    flightCodes?: string;
}

export interface ITestDriveState {
    showAnimation: boolean;
    testDriveState: string;
    testDriveInstance: ITestDriveAcquistionsResponse;
    navigateToTestDrive: boolean;
}

export class TestDrive extends SpzaComponent<ITestDriveProps, ITestDriveState> {
    context: ILocContext & ILocParamsContext & ICommonContext & IBuildHrefContext;
    private instrument = SpzaInstrumentService.getProvider();

    constructor(props: ITestDriveProps, context: ILocContext & ILocParamsContext & ICommonContext & IBuildHrefContext) {
        super(props, context);
        this.state = {
            showAnimation: true,
            testDriveState: '',
            testDriveInstance: null,
            navigateToTestDrive: false
        };
    }
    componentWillMount(): void {
        if (shouldPollForTestDrive()) {
            this.pollForTestDrive();
        } else {
            this.createTestDrive();
        }
    }

    setTestDriveState(testDriveInstance: ITestDriveAcquistionsResponse) {
        if (testDriveInstance) {
            let isHandoffType = false;
            let details = {
                testDriveState: testDriveInstance.status,
                output: testDriveInstance.outputs,
                testDriveInstaceId: testDriveInstance.id
            };
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.AzureTestDrive,
                appName: this.props.appInfo.appid,
                details: JSON.stringify(details)
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
            if (testDriveInstance.status === SolutionInstanceStatus.Ready || testDriveInstance.status === SolutionInstanceStatus.Provisioning) {
                setTestDriveCookie(this.props.appInfo.appid, this.props.userInfo.email, testDriveInstance.id);
            }
            if (testDriveInstance.status === SolutionInstanceStatus.Ready) {
                isHandoffType = testDriveInstance.outputs.filter((item: any) => item.type.toLowerCase() === Constants.TestDriveOutputType.HandOffUrl).length > 0;
            }
            this.setState({
                showAnimation: false,
                testDriveState: testDriveInstance.status,
                testDriveInstance: testDriveInstance,
                navigateToTestDrive: isHandoffType
            });
            this.props.persistTestDriveState(testDriveInstance);
            this.navigateToTestDrive();
        } else {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.AzureTestDrive,
                appName: this.props.appInfo.appid,
                details: 'TestDriveModal: Error while setting the test state, test drive instance null'
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
            this.setState({
                showAnimation: false,
                testDriveState: SolutionInstanceStatus.Error,
                testDriveInstance: testDriveInstance,
                navigateToTestDrive: false
            });
        }
    }

    // Sets up a new test drive and polls for the status of the test drive, to set the test drive as hot or cold
    createTestDrive(): void {
        initializeTestDrive(this.props.userInfo, this.props.appInfo, this.props.accessToken, this.props.testDriveAccessToken, this.props.flightCodes)
            .then((result: ITestDriveAcquistionsResponse) => {
                if (this.props && result) {
                    this.setTestDriveState(result);
                } else {
                    this.setTestDriveState(null);
                }
            }, () => {
                this.setTestDriveState(null);
            }).catch(() => {
                this.setTestDriveState(null);
            });
    }

    // Sets up a new test drive and polls for the status of the test drive, to set the test drive as hot or cold
    pollForTestDrive(): void {
        createAndPollForTestDrive(this.props.userInfo, this.props.appInfo, this.props.accessToken, this.props.testDriveAccessToken, this.props.flightCodes)
            .then((result: ITestDriveAcquistionsResponse) => {
                if (this.props && result) {
                    this.setTestDriveState(result);
                } else {
                    this.setTestDriveState(null);
                }
            }, () => {
                this.setTestDriveState(null);
            }).catch(() => {
                this.setTestDriveState(null);
            });
    }

    // Once the state is hot navigates to the test drive
    navigateToTestDrive(): void {
        let testDrivePageUrl = this.getTestDrivePageUrl();
        let output = this.state.testDriveInstance.outputs.filter((item: any) => item.type.toLowerCase() === Constants.TestDriveOutputType.HandOffUrl);
        if (this.state.testDriveState === SolutionInstanceStatus.Ready && output && output.length > 0) {
            let payload: ITelemetryData = {
                page: getWindow().location.href,
                action: Constants.Telemetry.Action.Click,
                actionModifier: Constants.Telemetry.ActionModifier.NavigatingToTestDrive,
                appName: this.props.appInfo.appid,
                // Do we need user info here?
                details: JSON.stringify(this.state.testDriveInstance)
            };
            this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
            window.open(output[0].value, '_self');
        } else {
            urlPush(testDrivePageUrl, true);
        }
        this.props.dismissModal();
    }

    getTestDrivePageUrl() {
        let productString = ProductEnum[this.props.appInfo.primaryProduct];
        let productData = DataMap.products[productString];
        let product = productData ? productData.UrlKey : productString;
        return this.context.buildHref(routes.testDrive, { productId: product, appid: this.props.appInfo.appid },
            { 'instanceId': this.state.testDriveInstance.id }, true);
    }

    // Kills the pollling for the test drive state if the users decides to dismiss the modal
    componentWillUnmount() {
        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.Click,
            actionModifier: Constants.Telemetry.ActionModifier.TestDriveDismissed,
            appName: this.props.appInfo.appid,
            details: ''
        };
        this.instrument.probe<ITelemetryData>('logAndFlushTelemetryInfo', payload);
    }

    renderImpl() {
        let context = this.context as any;
        return (
            <div>
                <div className='contentHeader'>{this.state.testDriveState === SolutionInstanceStatus.Ready
                    ? context.loc('TestDrive_DialogTitle_Hot')
                    : context.loc('TestDrive_DialogTitle')}
                </div>
                <div className='trunk'>
                    <div className='miniIcon'>
                        {<img className='thumbnail' src={this.props.appInfo.iconURL} />}
                    </div>
                    <div className='trunkContent'>
                        <span className='header'>{this.props.appInfo.title}</span>
                        <span className='subHeader'>{context.locParams('Tile_By', [this.props.appInfo.publisher])}</span>
                    </div>
                </div>
                {
                    this.state.showAnimation ?
                        <div>
                            <Animation />
                        </div>
                        :
                        <div>
                            {
                                this.state.testDriveState === SolutionInstanceStatus.Error ?
                                    <div>
                                        <div className='terms'>
                                            <div>
                                                <div className='testDriveContent'>
                                                    <p>{context.loc('TestDrive_Error')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    this.state.navigateToTestDrive ?
                                        <div>
                                            <div className='terms'>
                                                <div className='testNavigationContent'>
                                                    <p>{context.loc('TestDrive_HotDuration')}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <Animation />
                                            </div>
                                        </div> : null
                            }
                        </div>
                }
            </div>
        );
    }
}

(TestDrive as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func,
    buildHref: React.PropTypes.func
};