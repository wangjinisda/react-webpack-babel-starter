import * as React from 'react';
let { connect } = require('react-redux');
import { IState } from '../../../State';
import { ensureAppData, ensurePartnerData } from '../../actions/thunkActions';
import { createModalAction, createUserReviewUpdatedAction } from '../../actions/actions';
import { Modal as ModalComponent } from './../../components/modals/modal';
import { getWindow } from '../../services/window';
import { readCookie, isOnMicrosoftEmail } from '../../utils/appUtils';
import { SpzaInstrumentService } from '../../services/telemetry/spza/spzaInstrument';
import { Constants } from './../../utils/constants';
import { ITelemetryData } from './../../Models';
import { refreshAccessToken } from '../../actions/thunkActions';

export const mapStateToProps = (state: IState, ownProps: any) => {
    let userInfo = state.users;
    if (state.config.isEmbedded) {
        let cookie = readCookie('appsourcelead');
        let isAlternateEmailFromCookie = false;

        if (cookie && cookie.alternateEmail && cookie.email) {
            let userEmail = userInfo && userInfo.email ? userInfo.email.toLowerCase() : ' ';

            // If userInfo already has alternateEmail (from graph call on server), do NOT overwrite it here
            // also ensure that cookie's email is matching useremail to avoid scenario where user signs in into other sites that updated the cookie to some MSA
            if (!userInfo.alternateEmail && (userEmail === cookie.email.toLowerCase())) {
                userInfo.alternateEmail = cookie.alternateEmail;
                isAlternateEmailFromCookie = true;
            }
        }

        let payload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.CookieData,
            details: JSON.stringify({
                alternateEmailExists: cookie && cookie.alternateEmail ? true : false,
                emailHasOnMicrosoft: userInfo && userInfo.email ? isOnMicrosoftEmail(userInfo.email) : false,
                alternateEmailFromCookie: isAlternateEmailFromCookie
            })
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    return {
        appId: state.modal.appId,
        modalId: state.modal.modalId,
        userInfo: userInfo,
        isSignedIn: state.users.signedIn,
        allApps: state.apps.appData,
        allPartners: state.partners.partnerData,
        partnerId: state.modal.partnerId,
        isEmbedded: state.config.isEmbedded,
        payload: state.modal.payload,
        embedHost: state.config.embedHost,
        accessToken: state.users.accessToken,
        nationalCloud: state.config.nationalCloud,
        options: state.modal.options,
        includeOfficeApps: state.config.includeOfficeApps
    };
};

export const mapDispatchToProps = (dispatch: any, ownProps: any): any => {
    return {
        ensureAppData: () => {
            return dispatch(ensureAppData());
        },
        dismissModal: () => {
            return dispatch(createModalAction({
                showModal: false
            }
            ));
        },
        setUserReviewStatus: (hasReview: boolean) => {
            return dispatch(createUserReviewUpdatedAction(hasReview));
        },
        dismissModalWithRedirect: (href: string) => {
            getWindow().location.assign(href);
        },
        ensurePartnerData: () => {
            return dispatch(ensurePartnerData());
        },
        refreshAccessToken: () => {
            return dispatch(refreshAccessToken());
        }
    };
};

const Modal = connect(
    mapStateToProps,
    mapDispatchToProps
)(ModalComponent);

export default Modal as React.StatelessComponent<any>;
