import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, IPartnerDataItem, ITelemetryData } from '../Models/Models';
import { IUserDataState } from './../States/State';
import { Header } from './../appsource/containers/header';
import Modal from './../containers/modals/modal';
import { IBuildHrefFn } from '../interfaces/context';
import { getTelemetryAppData, getTelemetryPartnerData, isJsonString, logTenantInfo, getSpzaUserIdAndNewUserModifier } from '../utils/appUtils';
import { getWindow } from '../services/window';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { NpsModule } from '../utils/npsUtils';
import { handleCTACallback } from './../handlers/appViewHandler';
import { Footer } from './../containers/footer';
import { getAppConfig } from '../services/init/appConfig';
import { TileOnDemandLoadingService } from '../services/tileOnDemandLoadingService';

export interface IAppViewProps {
    localizedStrings: any;
    locale: string;
    isEmbedded: boolean;
    embedHost: number;
    buildHref: IBuildHrefFn;
    showModal: boolean;
    performedSubsetQueryString: string;
    location: any;
    userInfo: IUserDataState;
    telemetryLoggedCount: number;
    showCTAModal: (appId: string, ctaType?: Constants.CTAType, skuId?: string) => void;
    showContactModal: (partnerId: string, crossListingAppcontext?: IAppDataItem, callback?: any) => void;
    showErrorModal: () => void;
    showNPSModal: () => void;
    autoSignIn: (userStore: any) => void; // This will trigger the action to update the user data in the state
    openTile: (detailUrl: string) => void;
    isInErrorDialog: boolean;
    updateTelemetryLoggedCount: () => void;
    nationalCloud: string;
    changeSearchText(searchValue: string): void;
    performSearchAll(seachText: string): Promise<any>;
    clearSearch(): void;
    registerTileExtraDataHandler(appData: IAppDataItem): void;
    getTileExtraDataHandler(idList: { [id: string]: number }): void;
}


export class AppView extends SpzaComponent<any, any> {
    componentWillUpdate(nextProps: any) {

    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
        getWindow().removeEventListener('error', this.errorHandling.bind(this), false);
    }

    errorHandling(error: Event) {
        console.log('something went wrong while showing error modal' + error);
    }
    
    componentDidMount() {
        getWindow().addEventListener('error', this.errorHandling.bind(this), true);
    }

    renderFailImpl(err: any): any {
        // rendering is never allowed to throw an exception
        return this.props.showModal ? <Modal /> : null;
    }

    renderImpl() {
        if (this.props.isInErrorDialog) {
            // some component failed rendering, so we can't trust to render components again
            return <Modal />;
        } else {
            return (
                <div className='spza_root'>
                    <Header />
                    {this.props.children}
                    {this.props.showModal ? <Modal /> : null}
                    <Footer locale={this.props.locale} />
                </div>
            );
        }
    }
}