import * as React from 'react';
import { IState } from '../../State';
import { TestDrivePage as TestDriveComponent } from '../components/testDrivePage';
import { IAppDataItem } from '../Models';
import { getAppDetail } from '../actions/thunkActions';
import { createTestDriveInitializedAction } from '../actions/actions';
import { ITestDriveAcquistionsResponse } from '../Models';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {

    let targetApp: IAppDataItem = null;
    let appList = state.apps.appData;
    let hashMap = state.apps.appIdMap;
    let query = ownProps.location ? ownProps.location.query : null;
    let appIndex = hashMap[ownProps.routeParams.appid.toString().toLowerCase()];

   if (appIndex >= 0) {
        targetApp = appList[appIndex];
    }

    let appTestDriveInstance = state.testDrive.filter((item) => { return item.appid === ownProps.routeParams.appid.toString(); })[0];

    return {
        app: targetApp,
        testDriveInstance: appTestDriveInstance,
        isSignedin: state.users.signedIn,
        accessToken: state.users.accessToken.spza,
        testDriveToken: state.users.accessToken.testDrive,
        instanceId: query.instanceId,
        userInfo: state.users,
        billingCountryCode: state.config.billingCountryCode,
        flightCodes: state.config.flightCodes ? state.config.flightCodes : null
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        fetchAppDetails: (targetApp: IAppDataItem) => dispatch(getAppDetail(targetApp.appid)),
        persistTestDriveState: (state: ITestDriveAcquistionsResponse) => dispatch(createTestDriveInitializedAction(state))
    };
};

const TestDrive = connect(
    mapStateToProps,
    mapDispatchToProps
)(TestDriveComponent);

export default TestDrive as React.StatelessComponent<any>;

TestDrive.ensureAsyncData = (dispatch: any, getState: () => IState, params: any) => {
    return dispatch(getAppDetail(params.appid));
};