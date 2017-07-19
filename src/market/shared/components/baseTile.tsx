import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { InternalLink } from './internalLink';
import { DelayLoadImage } from './delayLoadImage';
import { IOpenTileCallbackContext, ICommonContext } from '../interfaces/context';
import { Constants } from './../utils/constants';
import { generateTileClickPayloadAndLogTelemetry } from './../utils/detailUtils';
import { getComponentXYOffset, getTileBackgroundSVGHtml } from './../utils/reactUtils';

export interface IBaseTileProps {
    id: string;
    iconURL: string;
    iconBackgroundColor: string;
    title: string;
    middleContent: any;
    ctaContent: any;
    detailUrl: string;
    customCSSClass?: string;
    tileIndex: number;
}

export class BaseTile extends SpzaComponent<IBaseTileProps, any> {
    context: IOpenTileCallbackContext & ICommonContext;

    constructor(props: IBaseTileProps, context: IOpenTileCallbackContext & ICommonContext) {
        super(props, context);

        this.state = {
            readyForNonInitialRendering: false
        };
    }

    openTile(event: any, detailUrl: string) {
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        const offset = getComponentXYOffset(this.refs['baseTile' + this.props.id]);

        const details = {
            id: this.props.id,
            index: this.props.tileIndex,
            xOffset: offset.x,
            yOffset: offset.y
        };

        generateTileClickPayloadAndLogTelemetry(Constants.Telemetry.ActionModifier.Tile, details);

        this.context.openTileCallback(detailUrl);
    }

    handleKeyPress(evt: any) {
        // only enter key can navigate into the detail page through tiles
        if (evt.charCode === 13) {
            this.openTile(evt, this.props.detailUrl);
        }
    }

    componentDidMount() {
        // since componentDidMount is only called at client side after the initial client side rendering 
        // is finished which would be consistent with the server side rendering result.
        // then readyForNonInitialRendering is set to true here which would trigger another round of client side rendering.
        this.setState({
            readyForNonInitialRendering: true
        });
    }

    renderImpl() {
        // readyForNonInitialRendering is used here for constructing the image URLs.
        // Because we want to have the image delay loading HTML markups only for the initial client/server side rendering.
        return (
            <div className={'spza_tileWrapper' + (this.props.customCSSClass ? ' ' + this.props.customCSSClass : '')}
                tabIndex={0}
                onKeyPress={(event: any) => { this.handleKeyPress(event); }}
                ref={'baseTile' + this.props.id}>
                <InternalLink href={this.props.detailUrl} onClick={(event: any) => { this.openTile(event, this.props.detailUrl); }} scrollToTop={true}>
                    {
                        this.props.iconURL ?
                            (this.state.readyForNonInitialRendering ?
                                <div className='topBackground' style={{ backgroundColor: this.props.iconBackgroundColor }} dangerouslySetInnerHTML={
                                    {
                                        __html: getTileBackgroundSVGHtml(this.props.iconURL)
                                    }}>
                                </div>
                                : <div className='topBackground' style={{ backgroundColor: this.props.iconBackgroundColor }}>{this.props.iconURL}</div>)
                            : null
                    }
                    {
                        this.props.iconURL ?
                            <div className='tileThumbnail' style={{ backgroundColor: this.props.iconBackgroundColor }} >
                                {(this.state.readyForNonInitialRendering ?
                                    <div>
                                        <img className='thumbnail ready' src={this.props.iconURL} />
                                    </div>
                                    : <DelayLoadImage className='thumbnail' src={this.props.iconURL} />
                                )}
                            </div>
                            : null
                    }
                    <div className='tileContent'>
                        <h6 className='c-heading6 title'>{this.props.title}</h6>
                        {this.props.middleContent}
                    </div>
                </InternalLink>
                {this.props.ctaContent}
            </div>
        );
    }
}

(BaseTile as any).contextTypes = {
    openTileCallback: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};