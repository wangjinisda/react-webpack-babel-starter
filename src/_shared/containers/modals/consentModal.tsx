
import * as React from 'react';
import { ConsentModal as ConsentModalComponent } from '../../components/modals/consentModal';
import { createDriveModalAction } from '../../actions/actions';
let { connect } = require('react-redux');
import { getAppDetail } from '../../actions/thunkActions';
import { IAppDataItem } from '../../models/Models';
import { IState } from './../../states/state';

export const mapStateToProps = (state: IState, ownProps: any) => {
    return {
        billingCountryCode: state.config.billingCountryCode,
        flightCodes: state.config.flightCodes ? state.config.flightCodes : null
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        openDriveModal: (driveUrl: string) =>
            dispatch(createDriveModalAction({
                showModal: true,
                driveUrl: driveUrl
            })),
        fetchAppDetails: (targetApp: IAppDataItem) => dispatch(getAppDetail(targetApp.appid))
    };
};

export const ConsentModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConsentModalComponent) as React.StatelessComponent<any>;
