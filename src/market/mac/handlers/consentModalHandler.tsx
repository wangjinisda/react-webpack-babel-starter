import * as React from 'react';
import CTAModal from '../containers/modals/ctaModal';
import { IModalProps } from '../../shared/components/modals/modal';
import { IAppDataItem } from '../models';
import { Constants } from '../../shared/utils/constants';
import { SignInModal } from '../../shared/components/modals/signInModal';
import { LeadFormModal } from '../../shared/components/modals/leadFormModal';
import { ConsentModal } from '../../shared/containers/modals/consentModal';
import { getWindow } from '../../shared/services/window'; // Start Mooncake

export function handleConsentModalCall(props: IModalProps, appData: IAppDataItem, dismissModal: () => void, refreshAccessToken: () => Promise<any>) {
    let modalContent: any = null;
    let ctaType: Constants.CTAType = props.options && props.options.ctaType ? props.options.ctaType : Constants.CTAType.Create;

    if (!props.isSignedIn && !props.isEmbedded) {
        // Start Mooncake
        if ( appData.actionString === Constants.ActionStrings.AccessNow ) {
            getWindow().location.href = appData.handoffURL;
        } else
        // End Mooncake
        if (ctaType === Constants.CTAType.Create) {
            modalContent = <SignInModal redirect={'app'}
                testDrive={false}
                appId={props.appId}
                dismissModal={dismissModal}
                signInModalType={Constants.SignInType.SignInWith_MSA_AAD} />;
        } else if (ctaType === Constants.CTAType.TestDrive) {
            modalContent = <SignInModal redirect={'app'}
                testDrive={true}
                signInModalType={Constants.SignInType.SignInWith_MSA_AAD}
                appId={props.appId}
                dismissModal={dismissModal} />;
        }
    } else if (appData.actionString === Constants.ActionStrings.RequestTrial) {
        modalContent = <LeadFormModal modalId={Constants.ModalType.CTA}
            userInfo={props.userInfo}
            appInfo={appData}
            dismissModal={dismissModal}
            accessToken={props.accessToken && props.accessToken.spza}
            nationalCloud={props.nationalCloud}
            refreshAccessToken={refreshAccessToken} />;
    } else if (ctaType === Constants.CTAType.TestDrive) {
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
    } else {
        modalContent = (<CTAModal
            userInfo={props.userInfo}
            appInfo={appData}
            isEmbedded={props.isEmbedded}
            dismissModal={dismissModal}
            accessToken={props.accessToken && props.accessToken.spza}
            nationalCloud={props.nationalCloud}
            options={props.options} />);
    }

    return modalContent;
}