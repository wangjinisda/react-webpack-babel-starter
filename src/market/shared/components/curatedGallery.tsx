import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { ICuratedSection, ITelemetryData } from '../Models';
import Ribbon from '../components/ribbon';
import { ProductEnum, DataMap } from '../utils/dataMapping';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICommonContext } from '../interfaces/context';
import { SpzaInstrumentService } from '../services/telemetry/spza/spzaInstrument';
import { getWindow } from '../services/window';
import { IRouteConfig } from '../routerHistory';
import { Constants } from '../utils/constants';
//import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';

export interface ICuratedGalleryProps<T> {
    ensureCuratedData: () => any;
    TileType: typeof AppTile | typeof PartnerTile;
    sections: ICuratedSection<T>[];
    route: IRouteConfig<any>;
    titleLocKey: string;
}

export class CuratedGallery<T> extends SpzaComponent<ICuratedGalleryProps<T>, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICommonContext;
    private maxTileDisplay: number = 5;

    componentWillMount() {
        this.props.ensureCuratedData();
    }

    componentDidMount() {
        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);
    }

    getDetailsPageUrl(titleId: string): string {
        let url = '';
        let product = ProductEnum[titleId];

        if (product) {
            let shortcutFilters = DataMap.products[product] && DataMap.products[product].ShortcutFilters;
            if (shortcutFilters) {
                product = DataMap.products[product].ShortcutFilters.join(';');
            }
            url = this.context.buildHref(this.props.route, null, {
                category: null,
                industry: null,
                product: product,
                search: null
            });
        }

        return url;
    }

    getTitle(titleId: string): string {
        let title = '';
        if (titleId === Constants.FeaturedAppsId) {
            title = this.context.loc('CuratedType_FeaturedApps');
        } else {
            const titleIdEnum = ProductEnum[titleId];
            if (titleIdEnum) {
                let productName = DataMap.products[titleIdEnum].LongTitle;
                title = this.context.locParams(this.props.titleLocKey, [productName]);
            } else {
                title = titleId;
            }
        }
        return title;
    }

    renderImpl() {
        let TileType: any = this.props.TileType;

        return (
            <div className='spza_tileGroups'>
                <div className='spza_controls'></div>
                {
                    this.props.sections ?
                        this.props.sections.map((section, key) => {
                            let ribbonItems = section.items.length > this.maxTileDisplay ? section.items.slice(0, this.maxTileDisplay) : section.items;
                            return (
                                <Ribbon title={this.getTitle(section.titleId)} key={key} seeMoreUrl={this.getDetailsPageUrl(section.titleId)}
                                    seeMoreText={this.context.loc('Link_SeeAll')} >
                                    {
                                        ribbonItems.map((item: T, index: number) => {
                                            return <TileType {...item}
                                                key={item['appid'] || item['partnerId']}
                                                customCSSClass={'tile' + index}
                                                tileIndex={index} />;
                                        })
                                    }
                                </Ribbon>
                            );
                        }) : null
                }
            </div>
        );
    }
}

(CuratedGallery as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
