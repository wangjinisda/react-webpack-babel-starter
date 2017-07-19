import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ILocParamsContext, ICommonContext } from '../interfaces/context';
import { IAppDataItem, IPartnerDataItem, ITelemetryData } from './../Models';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';
import { Constants } from '../utils/constants';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { OwnerType } from '../utils/detailUtils';

export interface ICrossListingsProps {
    TileType: typeof AppTile | typeof PartnerTile;
    ownerType: OwnerType;
    ownerId: string;
    ownerTitle: string;
    crossListings: (IAppDataItem | IPartnerDataItem)[];
}

export class CrossListings extends SpzaComponent<ICrossListingsProps, any> {
    context: ILocParamsContext & ICommonContext;

    constructor(props: ICrossListingsProps, context: ILocParamsContext & ICommonContext) {
        super(props, context);

        let detailsObject = {
            appId: this.props.ownerId,
            crossListingPartners: this.props.crossListings
        };

        let payload: ITelemetryData = {
            page: 'AppDetails',
            action: Constants.Telemetry.Action.CrossListingInfo,
            actionModifier: Constants.Telemetry.ActionModifier.Info,
            details: JSON.stringify(detailsObject)
        };

        if (this.props.ownerType === OwnerType.App) {
            payload.appName = this.props.ownerId;
        } else if (this.props.ownerType === OwnerType.Partner) {
            payload.partnerId = this.props.ownerId;
        }

        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', payload);
    }

    renderImpl() {
        let localizationHeader = '';
        let localizationDescription = '';

        // AppTile means this is a partner displaying its available apps
        if (this.props.TileType === AppTile) {
            localizationHeader = 'PartnerDetail_RibbonSubHeader';
            localizationDescription = 'This partner can help you deploy or integrate these apps.';
        } else {
            localizationHeader = 'AppDetails_RibbonSubHeader';
            localizationDescription = 'Save time and let one of these partners help you deploy or integrate this app.';
        }

        return (
            <div className='crossListingsComponent overview'>
                <div className='tabHeader'>
                    {this.context.locParams(localizationHeader, [this.props.ownerTitle], localizationDescription)}
                </div>
                <div className='filteredGalleryContainer'>
                    <div className='spza_controls'></div>
                    <div className='spza_filteredTileContainer'>
                        {
                            this.props.crossListings.map((value: any, index: number) => {
                                return <this.props.TileType {...value} key={index} customCSSClass={'tile' + index}/>;
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }
}

(CrossListings as any).contextTypes = {
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};