import * as React from 'react';
import { ConsentModal } from '../containers/modals/consentModal';
import { IModalProps } from '../components/modals/modal';
import { IAppDataItem } from '../models/models';
import { Constants } from '../utils/constants';
import { SignInModal } from '../components/modals/signInModal';
import { LeadFormModal } from '../components/modals/leadFormModal';
import { getSignInModalType } from '../utils/appUtils';

export function handleConsentModalCall(props: IModalProps, appData: IAppDataItem, dismissModal: () => void, refreshAccessToken: () => Promise<any>) {
    let modalContent: any = null;

    // TODO[OfficeOnboarding]: Remove feature flag(includeOfficeApps) after Office Onboarding
    let signinType = Constants.SignInType.OldSignInModal;
    let shouldShowSignInModal = !props.isSignedIn && !props.isEmbedded;

    if (props && props.includeOfficeApps) {
        signinType = getSignInModalType(appData.products, props.userInfo);
        shouldShowSignInModal = (signinType !== Constants.SignInType.Authorized && !props.isEmbedded);
    }

    if (shouldShowSignInModal) {
        let appTitle = appData && appData.title ? appData.title : '';
        let userEmail = props.userInfo && props.userInfo.email ? props.userInfo.email : '';

        modalContent = <SignInModal redirect={'app'}
            appId={props.appId}
            dismissModal={dismissModal}
            signInModalType={signinType}
            includeOfficeApps={props.includeOfficeApps}
            appName={appTitle}
            email={userEmail}
            testDrive={props.options && props.options.ctaType === Constants.CTAType.TestDrive} />;
    } else if (appData.actionString === Constants.ActionStrings.RequestTrial && props.options.ctaType !== Constants.CTAType.TestDrive) {
        modalContent = <LeadFormModal modalId={Constants.ModalType.CTA}
            userInfo={props.userInfo}
            appInfo={appData}
            dismissModal={dismissModal}
            accessToken={props.accessToken && props.accessToken.spza}
            nationalCloud={props.nationalCloud}
            refreshAccessToken={refreshAccessToken} />;
    } else {
        // Since we generate leads for GET as well we need the accessToken passed here too.
        modalContent = (<ConsentModal
            userInfo={props.userInfo}
            appInfo={appData}
            isEmbedded={props.isEmbedded}
            dismissModal={dismissModal}
            accessToken={props.accessToken && props.accessToken.spza}
            testDriveToken={props.accessToken && props.accessToken.testDrive}
            nationalCloud={props.nationalCloud}
            ctaType={props.options.ctaType}
            refreshAccessToken={refreshAccessToken} />);
    }

    return modalContent;
}