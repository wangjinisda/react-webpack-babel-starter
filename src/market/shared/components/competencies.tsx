import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { Constants } from '../utils/constants';
import { ICompetencies } from './../Models';
import { IBuildHrefContext, ILocContext, ICommonContext } from '../interfaces/context';
import { IRouteConfig } from '../routerHistory';
import * as DetailUtils from '../utils/detailUtils';
import { DataMap } from '../utils/dataMapping';
import { urlPush } from '../routerHistory';

export interface ICompetenciesProps {
    ownerType: DetailUtils.OwnerType;
    ownerId: string;
    competencies: ICompetencies[];
    certifications: string[];
    languages: string[];
    industries: number;
    categories: number;
    route: IRouteConfig<any>;
}

export class Competencies extends SpzaComponent<ICompetenciesProps, any> {
    context: IBuildHrefContext & ILocContext & ICommonContext;

    constructor(props: ICompetenciesProps, context: IBuildHrefContext & ILocContext & ICommonContext) {
        super(props, context);
    }

    buildMedalList(id: string) {
        let medalRender: JSX.Element[] = [];
        let competencies = this.props.competencies;

        if (competencies && competencies.length > 0) {
            let list: any = [];
            for (let value = 0; value < competencies.length; value++) {
                if (competencies[value] && competencies[value]['Type'] && competencies[value]['Type'].toLowerCase() === id.toLowerCase()) {
                    list = competencies[value]['Names'];
                    break;
                }
            }

            for (let i = 0; i < list.length; i++) {
                medalRender.push(
                    <div key={i} className='displayItem'>{list[i]}</div>
                );
            }
        }

        if (medalRender.length > 0) {
            return medalRender;
        } else {
            medalRender.push(
                <div className='displayItem'>-</div>
            );
            return medalRender;
        }
    }

    buildFilterElements(filterItem: string, filterTileTypes: string) {
        let filterRender: JSX.Element[] = [];
        Object.keys(DataMap[filterItem]).map((value) => {
            if (!DataMap[filterItem][value].ShortcutFilters
                && (this.props[filterItem] & DataMap[filterItem][value].FilterID)) {
                let filter = DataMap[filterItem][value];
                if (!filter) {
                    return null;
                }

                let pathParams: any = {
                    industry: null,
                    category: null,
                    product: null,
                    search: null
                };
                pathParams[filterTileTypes] = filter.UrlKey;

                let newPath = this.context.buildHref(this.props.route, null, pathParams);

                filterRender.push(
                    <a className='c-hyperlink filterItem' onClick={() => {
                            DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, filterItem, newPath, 'Competencies');
                            urlPush(newPath, true);
                        } }
                        key={filter.FilterID} >
                        {
                            this.context.loc(filter.LocKey, filter.LongTitle)
                        }
                    </a>
                );
            }
        });
        return filterRender;
    }

    renderImpl() {
        return (
            <div className='competenciesContent'>
                <div className='leftSide'>
                    {
                        <div className='competency'>
                            <header>{this.context.loc('PartnerDetail_Competency', 'Microsoft Competencies') }</header>
                            <div className='gold'>
                                <div className='goldMedalIcon'>
                                    <img src='/images/badgeGold.png' />
                                    <span>{this.context.loc('PartnerDetail_Gold', 'Gold')}</span>
                                </div>
                                <div className='goldCompetency'>
                                    {this.buildMedalList('Gold')}
                                </div>
                            </div>
                            <div className='silver'>
                                <div className='silverMedalIcon'>
                                    <img src='/images/badgeSilver.png' />
                                    <span>{this.context.loc('PartnerDetail_Silver', 'Silver')}</span>
                                </div>
                                <div className='silverCompetency'>
                                    {this.buildMedalList('Silver')}
                                </div>
                            </div>
                        </div>
                    }
                    <a href='http://go.microsoft.com/fwlink/?LinkId=828935' className='c-hyperlink learnCompetency' onClick={ () => {
                            DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId,
                                                                            'MicrosoftCompetency', 'http://go.microsoft.com/fwlink/?LinkId=828935', 'Competencies');
                        } }>
                        {this.context.loc('PartnerDetail_learnCompetency', 'Learn about Microsoft Competencies') }
                    </a>
                    {
                        this.props.certifications ?
                            <div className='industryCerts'>
                                <header>{this.context.loc('PartnerDetail_Certification', 'Industry Certifications') }</header>
                                {
                                    DetailUtils.getListElements(this.props.certifications)
                                }
                            </div> : null
                    }
                </div>
                <div className='rightSide'>
                    {
                        this.props.industries > 0 ?
                            <div className='industry'>
                                <header>{this.context.loc('FilterType_Industries') }</header>
                                {
                                    this.buildFilterElements(Constants.filterMaps.industries, Constants.filterTileTypes.industry)
                                }
                            </div> : null
                    }
                    {
                        this.props.categories > 0 ?
                            <div className='category'>
                                <header>{this.context.loc('App_Categories') }</header>
                                {
                                    this.buildFilterElements(Constants.filterMaps.categories, Constants.filterTileTypes.category)
                                }
                            </div> : null
                    }
                    {
                        this.props.languages ?
                            <div className='language'>
                                <header>{this.context.loc('App_Languages') }</header>
                                {
                                    DetailUtils.getListElements(this.props.languages)
                                }
                            </div> : null
                    }
                </div>
            </div>
        );
    }
}

(Competencies as any).contextTypes = {
    buildHref: React.PropTypes.func,
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};