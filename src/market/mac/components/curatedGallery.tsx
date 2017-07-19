import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { ICuratedSection, ITelemetryData } from '../../shared/Models';
import Ribbon from '../../shared/components/ribbon';
import { IBuildHrefContext, ILocContext, ILocParamsContext, ICommonContext } from '../../shared/interfaces/context';
import { SpzaInstrumentService } from '../../shared/services/telemetry/spza/spzaInstrument';
import { getWindow } from '../../shared/services/window';
import { IRouteConfig } from '../../shared/routerHistory';
import { Constants } from '../../shared/utils/constants';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { IDataMap, LocKeyToURLKey, BackendKeyToURLKey } from '../utils/dataMapping';
// import { getFilteredAppPageTitle } from 'utils/localization';
import { getFilteredAppPageTitle } from './../../mac/utils/localization';

export interface ICuratedGalleryProps<T> {
    ensureCuratedData: () => any;
    TileType: typeof AppTile;
    sections: ICuratedSection<T>[];
    route: IRouteConfig<any>;
    titleLocKey: string;
    category: string;
    dataMap: IDataMap;
}

export class CuratedGallery<T> extends SpzaComponent<ICuratedGalleryProps<T>, any> {
    context: IBuildHrefContext & ILocContext & ILocParamsContext & ICommonContext;
    private maxTileDisplay: number = 5;

    componentDidMount() {
        this.props.ensureCuratedData();

        let perfPayload: ITelemetryData = {
            page: getWindow().location.href,
            action: Constants.Telemetry.Action.PageLoad,
            actionModifier: Constants.Telemetry.ActionModifier.End
        };
        SpzaInstrumentService.getProvider().probe<ITelemetryData>('logTelemetryInfo', perfPayload);
        document.getElementsByTagName('title')[0].innerHTML = getFilteredAppPageTitle(this.context);
    }

    getDetailsPageUrl(titleId: string): string {
        const categoryURLKey = BackendKeyToURLKey[this.props.category];
        const subCategoryURLKey = LocKeyToURLKey[titleId];
        let category = this.props.dataMap.category[categoryURLKey];
        if (category && category.subCategoryDataMapping && category.subCategoryDataMapping[subCategoryURLKey]) {
            const url = this.context.buildHref(this.props.route,
                { category: categoryURLKey },
                { subcategories: ';' + subCategoryURLKey, page: '1' });

            return url;
        } else {
            return '';
        }
    }

    getTitle(titleId: string): string {
        return this.context.loc(titleId);
    }

    renderImpl() {
        let TileType: any = this.props.TileType;

        return (
            <div className='spza_tileGroups'>
                <div className='spza_controls'></div>
                {
                    this.props.sections ?
                        this.props.sections.map((section, key) => {
                            if (section.items.length > 0) {
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
                            } else {
                                return null;
                            }
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
