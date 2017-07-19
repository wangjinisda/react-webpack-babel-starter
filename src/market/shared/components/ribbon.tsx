import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { urlPush } from '../routerHistory';
import { InternalLink } from './internalLink';
import { ICommonContext } from '../../shared/interfaces/context';

export interface IRibbonProps {
    title: string;
    seeMoreUrl?: string;
    seeMoreText?: string;
    isSeeMoreButton?: boolean;
    subHeader?: string;
    onClick?: () => void;
}

export default class Ribbon extends SpzaComponent<IRibbonProps, any> {
    context: ICommonContext;

    componentDidUpdate() {
        let tileOnDemandLoadingService = this.context.getTileOnDemandLoadingService();
        tileOnDemandLoadingService.getTileExtraData();
    }

    renderImpl() {
        const navigateAndScroll = () => {
            urlPush(this.props.seeMoreUrl, true);
        };

        let ribbonButton = <div></div>;

        const seeAllOnclick = this.props.onClick || navigateAndScroll;

        if (this.props.seeMoreUrl) {
            ribbonButton = (
                   <InternalLink onClick={seeAllOnclick} className='header_link' href={this.props.seeMoreUrl} accEnabled={1} aria-label={'see all for ' + this.props.title}>
                        {this.props.seeMoreText}
                        {this.props.isSeeMoreButton ? <span className='c-glyph'> </span> : null}
                    </InternalLink>
            );
        }

        // apps ribbon can be used to show 0 results even. if this is a possibility you should make sure to
        // keep that into account for title and seeMoreUrl

        return (
            <div className='spza_group'>
                <div className='header'>
                    <div className='header_wrap'>
                        <h3 className='c-heading3 spza_headerText'>{this.props.title}</h3>
                        {ribbonButton}
                    </div>
                    {this.props.subHeader ? <div className='segueRibbonSubHeader'>{this.props.subHeader} </div> : null}
                </div>
                <div className='spza_pagerWrapper'>
                    <div className='spza_pager'>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

(Ribbon as any).contextTypes = {
    renderErrorModal: React.PropTypes.func,
    getTileOnDemandLoadingService: React.PropTypes.func
};
