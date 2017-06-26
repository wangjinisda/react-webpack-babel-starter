import * as React from 'react';
let { connect } = require('react-redux');
import { TestDrive } from './../components/testDrive';
import { createTestDriveInitializedAction } from '../actions/actions';
import { ITestDriveAcquistionsResponse } from '../Models/Models';
import { IState } from './../States/State';

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        flightCodes: state.config.flightCodes ? state.config.flightCodes : null
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        persistTestDriveState: (state: ITestDriveAcquistionsResponse) => {
            return dispatch(createTestDriveInitializedAction(state));
        }
    };
};

const TestDriveContainer = connect(null, mapDispatchToProps)(TestDrive);

export default TestDriveContainer as React.StatelessComponent<any>;
