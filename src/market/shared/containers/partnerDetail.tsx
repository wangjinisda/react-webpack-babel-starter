import * as React from 'react';
import { IState } from '../../State';
import { PartnerDetail as PartnerDetailComponent } from '../components/partnerDetail';
import { IPartnerDataItem } from '../Models';
import { getPartnerDetail } from '../actions/thunkActions';
import { createModalAction, createContactAction } from '../actions/actions';
import { Constants } from '../utils/constants';

let { connect } = require('react-redux');

export const mapStateToProps = (state: IState, ownProps: any) => {
    // find the partner in the app list

    // todo: consider sending down the index of the app as well, since we stored that :)
    let partnerList = state.partners.partnerData;
    let targetPartner: IPartnerDataItem = null;
    let query = ownProps.location ? ownProps.location.query : null;

    // This is the default matching function to help find the app from the URL
    let targetPartnerMatch = (partner: IPartnerDataItem) => {
        if (partner) {
            return partner.partnerId.toLowerCase() === ownProps.routeParams.partnerId.toString().toLowerCase();
        } else {
            return false;
        }
    };

    for (let i = 0; i < partnerList.length; i++) {
        if (targetPartnerMatch(partnerList[i])) {
            targetPartner = partnerList[i];
            break;
        }
    }

    let breadcrumbUrl = '/' + state.config.locale + '/marketplace/partners';
    if (state.config.breadcrumbUrl) {
        breadcrumbUrl = state.config.breadcrumbUrl;
    }

    let tab = (query && query.tab) ? query.tab : null;

    return {
        partner: targetPartner,
        userInfo: state.users,
        breadcrumbUrl: breadcrumbUrl,
        defaultTab: tab
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any) => {
    return {
        fetchPartnerDetails: (targetPartner: IPartnerDataItem) => dispatch(getPartnerDetail(targetPartner.partnerId)),
        openModal: (modalId: number) =>
            dispatch(createModalAction({
                showModal: true,
                modalId: modalId
            })),
        openContactModal: (partnerId: string, callback?: any) =>
            dispatch(createContactAction({
                partnerId: partnerId,
                callback: callback,
                modalId: Constants.ModalType.Contact,
                showModal: true
            }))
    };
};

const PartnerDetail = connect(
    mapStateToProps,
    mapDispatchToProps
)(PartnerDetailComponent);

export default PartnerDetail as React.StatelessComponent<any>;

PartnerDetail.ensureAsyncData = (dispatch: any, getState: () => IState, params: any) => {
    return dispatch(getPartnerDetail(params.partnerId));
};
