import * as React from 'react';
let { connect } = require('react-redux');
import { CTAModal as ModalComponent } from '../../components/modals/ctaModal';
import { IState } from '../../../State';
import { IAppDataItem } from '../../../shared/models';
import { getAppDetail, getAppPricing } from '../../../shared/actions/thunkActions';

export const mapStateToProps = (state: IState, ownProps: any) => {
    let targetApp: IAppDataItem = null;
    let appList = state.apps.appData;
    for (let i = 0; i < appList.length; i++) {
        if (appList[i].appid === ownProps.appInfo.appid) {
            targetApp = appList[i];
            break;
        }
    }

    return {
        app: targetApp,
        userInfo: ownProps.userInfo,
        appInfo: ownProps.appInfo,
        correlationId: ownProps.correlationId,
        isEmbedded: ownProps.isEmbedded,
        dismissModal: ownProps.dismissModal,
        accessToken: ownProps.accessToken,
        nationalCloud: ownProps.nationalCloud,
        options: ownProps.options,
        billingCountryCode: state.config.billingCountryCode,
        pricingInformation: ownProps.appInfo.pricingInformation
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
    return {
        fetchAppDetails: (targetApp: IAppDataItem) => dispatch(getAppDetail(targetApp.appid)),
        fetchPricing: (appId: string) => dispatch(getAppPricing(appId))
    };
};

const CTAModal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalComponent);

export default CTAModal as React.StatelessComponent<any>;
