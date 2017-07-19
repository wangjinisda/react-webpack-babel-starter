import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { IAppDataItem, IPartnerDataItem, IImages, IDemoVideos, ICollateralDocuments } from './../Models';
import { ILocContext, ILocParamsContext, ICommonContext } from '../interfaces/context';
import { Constants } from '../utils/constants';
import { Capabilities } from '../utils/capabilities';
import * as DetailUtils from '../utils/detailUtils';
import Ribbon from '../components/ribbon';
// import { AppTile } from 'containers/appTile';
import { AppTile } from './../../mac/containers/appTile';
import { PartnerTile } from './partnerTile';
// import { shouldShowPopUp } from 'utils/modals';
import { shouldShowPopUp } from './../../mac/utils/modals';
import { TelemetryImage } from './telemetryImage';

let classNames = require('classnames-minimal');

export interface IOverviewProps {
    ownerType: DetailUtils.OwnerType;
    ownerId: string;
    ownerTitle: string;
    shortDescription: string;
    description: string;
    images: IImages[];
    videos: IDemoVideos[];
    documents: ICollateralDocuments[];
    capabilities?: string[];
    TileType: typeof AppTile | typeof PartnerTile;
    crossListings: (IAppDataItem | IPartnerDataItem)[];
    handleSeeAllCallback: () => void;
    openVideoModal: (partnerId: string, videoUrl: string, videoThumbnail: string) => void;
}

interface IOverviewState {
    selectedUrl: string;
    selectedThumbnail: string;
    showMoreText: boolean;
}

export class Overview extends SpzaComponent<IOverviewProps, IOverviewState> {
    context: ILocContext & ILocParamsContext & ICommonContext;

    private descriptionRef: HTMLDivElement;
    private hasImages: boolean = false;
    private hasDemoVideos: boolean = false;
    private hasDocuments: boolean = false;
    private shortDescriptionClass: string = 'description';

    constructor(props: IOverviewProps, context: ILocContext & ILocParamsContext & ICommonContext) {
        super(props, context);

        this.state = this.getNewState(props);
    }

    componentWillReceiveProps(nextProps: IOverviewProps, nextState: IOverviewState) {
        if (this.props.ownerId !== nextProps.ownerId) {
            this.setState(this.getNewState(nextProps));
        }
    }

    getNewState(props: IOverviewProps) {
        this.hasImages = (props.images && props.images.length > 0);
        this.hasDemoVideos = (props.videos && props.videos.length > 0);
        this.hasDocuments = (props.documents && props.documents.length > 0);

        let selectedUrl = '';
        let selectedThumbnail = '';

        if (this.hasDemoVideos) {
            selectedThumbnail = props.videos[0].ThumbnailURL;
            selectedUrl = props.videos[0].VideoLink;
        } else if (this.hasImages) {
            selectedThumbnail = props.images[0].ImageUri;
        }

        return {
            selectedUrl: selectedUrl,
            selectedThumbnail: selectedThumbnail,
            showMoreText: true
        };
    }

    componentDidUpdate() {
        const descriptionCutoffSize = 294;

        if (this.props.ownerType === DetailUtils.OwnerType.Partner && this.descriptionRef && this.descriptionRef.clientHeight < descriptionCutoffSize) {
            if (this.descriptionRef.parentElement.parentElement.childNodes[1]['className'].indexOf('hideButton') === -1) {
                this.descriptionRef.parentElement.parentElement.childNodes[1]['className'] += ' hideButton';
            }
        }
    }

    componentWillMount() {
        this.shortDescriptionClass = this.props.description ? 'shortDescription' : 'description';
    }

    descriptionClasses(self: any) {
        if (this.props.ownerType === DetailUtils.OwnerType.Partner) {
            const classes = classNames({
                'partnerDescription': self.state.showMoreText,
                'showLessText': !self.state.showMoreText,
                'description': true
            });
            return classes;
        } else {
            return '';
        }
    }

    showMoreText() {
        this.setState({
            selectedThumbnail: this.state.selectedThumbnail,
            selectedUrl: this.state.selectedUrl,
            showMoreText: false
        });

        DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId,
            'ShowMoreText', this.state.selectedUrl, 'Overview');
    }

    showLessText() {
        this.setState({
            selectedThumbnail: this.state.selectedThumbnail,
            selectedUrl: this.state.selectedUrl,
            showMoreText: true
        });

        DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId,
            'ShowLessText', this.state.selectedUrl, 'Overview');
    }

    imageRendering() {
        let thumbnailsRender: JSX.Element[] = [];
        if (this.hasImages) {
            let list: IImages[] = this.props.images;
            for (let i = 0; i < list.length; i++) {
                let source: string = list[i].ImageUri;
                thumbnailsRender.push(
                    <div className='imgContent' key={i} tabIndex={0}
                         onKeyPress={(event: any) => { this.handleKeyPressImgSwitch(event, i); }}
                         onClick={() => this.setSelectedImage(i)}>
                        <TelemetryImage src={source} />
                    </div>
                );
            }
        }
        return thumbnailsRender;
    };

    videoRendering() {
        let videosRender: JSX.Element[] = [];
        if (this.hasDemoVideos) {
            let list: IDemoVideos[] = this.props.videos;
            for (let i = 0; i < list.length; i++) {
                let source: string = list[i].ThumbnailURL;
                videosRender.push(
                    <div className='imgContent' key={i} tabIndex={0}
                         onKeyPress={(event: any) => { this.handleKeyPressVideoSwitch(event, i); }}
                         onClick={() => this.setSelectedVideo(i)}>
                        <TelemetryImage src={source} />
                        <TelemetryImage className='overlay' src='/images/videoOverlay.png' />
                    </div>
                );
            }
        }
        return videosRender;
    };

    documentsRendering() {
        let documentsRender: JSX.Element[] = [];
        if (this.hasDocuments) {
            let list: ICollateralDocuments[] = this.props.documents;
            for (let i = 0; i < list.length; i++) {
                let name: string = list[i].DocumentName;
                let source: string = list[i].DocumentUri;
                documentsRender.push(
                    <a href={source} className='c-hyperlink linkContent' key={i} rel='noreferrer' target='_blank' onClick={() => {
                        DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, 'LearnMore', source, 'Overview');
                    } }>{name} </a>
                );
            }
        }
        return documentsRender;
    };

    capabilitiesRendering() {
        let capabilitiesPane: JSX.Element[] = [];

        for (let i = 0; i < this.props.capabilities.length; i++) {
            let capability = this.props.capabilities[i];
            let subCapabilities = Capabilities[capability];
            let subCapabilitiesCount = (subCapabilities && subCapabilities.length) ? subCapabilities.length : 0;

            for (let j = 0; j < subCapabilitiesCount; j++) {
                capabilitiesPane.push(
                    <li key={j}>{this.context.loc(subCapabilities[j])}</li>
                );
            }
        }

        return capabilitiesPane;
    }

    handleKeyPress(evt: any) {
        // only enter key can navigate into the detail page through tiles
        if (evt.charCode === 13) {
            this.showVideoDialog(this.state.selectedThumbnail, this.state.selectedUrl);
        }
    }

    handleKeyPressVideoSwitch(evt: any, videoIndex: number) {
        // only enter key can navigate into the detail page through tiles
        if (evt.charCode === 13) {
            this.setSelectedVideo(videoIndex);
        }
    }

    handleKeyPressImgSwitch(evt: any, imgIndex: number) {
        // only enter key can navigate into the detail page through tiles
        if (evt.charCode === 13) {
            this.setSelectedImage(imgIndex);
        }
    }

    showVideoDialog(videoUrl: string, videoThumbnail: string) {
        DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, 'OpenMedia', videoUrl, 'Overview');
        if (shouldShowPopUp()) {
            // todo: switch urls
            this.props.openVideoModal(this.props.ownerId, videoThumbnail, videoUrl);
        }
    }

    setSelectedVideo(index: number) {
        if (this.props.videos && index < this.props.videos.length) {
            this.setState({
                selectedThumbnail: this.props.videos[index].ThumbnailURL,
                selectedUrl: this.props.videos[index].VideoLink,
                showMoreText: this.state.showMoreText
            });

            DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, 'SelectVideo', this.props.videos[index].VideoLink, 'Overview');
        }
    }

    setSelectedImage(index: number) {
        if (this.props.images && index < this.props.images.length) {
            this.setState({
                selectedThumbnail: this.props.images[index].ImageUri,
                selectedUrl: '',
                showMoreText: this.state.showMoreText
            });

            DetailUtils.generateLinkPayloadAndLogTelemetry(this.props.ownerType, this.props.ownerId, 'SelectImage', this.props.images[index].ImageUri, 'Overview');
        }
    }

    getAsHTML(text: string) {
        return { __html: text };
    }

    renderImpl() {
        let localizationTexts: string[] = [];

        // AppTile means this is a partner displaying its available apps
        if (this.props.TileType === AppTile) {
            localizationTexts.push('PartnerDetail_RibbonHeader');
            localizationTexts.push('Supported apps');
            localizationTexts.push('PartnerDetail_RibbonSubHeader');
            localizationTexts.push('This partner can help you deploy or integrate these apps.');
        } else {
            localizationTexts.push('AppDetails_RibbonHeader');
            localizationTexts.push('Partners');
            localizationTexts.push('AppDetails_RibbonSubHeader');
            localizationTexts.push('Save time and let one of these partners help you deploy or integrate this app.');
        }

        return (
            <div className='overview overviewContent'>
                <div className='detailsContentWrapper'>
                    <div className='appDetailContent'>
                        <div className={this.descriptionClasses(this)} ref={(el) => { this.descriptionRef = el; } }>
                            <div className={this.shortDescriptionClass}>{this.props.shortDescription}</div>
                            <div className='description' dangerouslySetInnerHTML={this.getAsHTML(this.props.description)}></div>
                        </div>
                        {
                            this.props.ownerType === DetailUtils.OwnerType.Partner ?
                                (this.state.showMoreText ?
                                    <div className='readMoreDescription' onClick={() => this.showMoreText()}>{this.context.loc('PartnerDetail_More')}</div> :
                                    <div className='readMoreDescription' onClick={() => this.showLessText()}>{this.context.loc('PartnerDetail_Less')}</div>) :
                                null
                        }
                        {
                            this.hasDocuments ?
                                <div className='link'>
                                    <h6 className='c-heading-6 linkTitle'>{this.context.loc('App_LearnMore')}</h6>
                                    {this.documentsRendering()}
                                </div> : null
                        }
                        {
                            this.props.capabilities ?
                                <div className='capabilities'>
                                    <h6 className='c-heading-6 capabilitiesTitle'>{this.context.loc('CP_Title')}</h6>
                                    <div className='disclaimer'>{this.context.loc('CP_Disclaimer')}</div>
                                    {this.capabilitiesRendering()}
                                </div> : null
                        }
                    </div>
                    {
                        this.hasDemoVideos || this.hasImages
                            ?
                            <div className='appDetailMedia'>
                                <div className='selectedMedia' tabIndex={0}
                                    onKeyPress={(event: any) => { this.handleKeyPress(event); }}
                                    onClick={() => this.showVideoDialog(this.state.selectedThumbnail, this.state.selectedUrl)}>
                                    <TelemetryImage className='content' src={this.state.selectedThumbnail} />
                                    {
                                        this.state.selectedUrl !== '' ?
                                            <TelemetryImage className='overlay' src='/images/videoOverlay.png' /> : null
                                    }
                                </div>
                                <div className='thumbnails'>
                                    {this.videoRendering()}
                                    {this.imageRendering()}
                                </div>
                            </div> : null
                    }
                </div>
                {
                    this.props.crossListings ?
                        <div className='spza_tileGroups'>
                            <div className='spza_controls overview_header_link'></div>
                            <Ribbon title={this.context.loc(localizationTexts[0], localizationTexts[1])} seeMoreUrl={'openTab'}
                                seeMoreText={this.context.loc('Link_SeeAll')}
                                subHeader={this.context.locParams(localizationTexts[2], [this.props.ownerTitle], localizationTexts[3])}
                                onClick={this.props.handleSeeAllCallback} >
                                {
                                    this.props.crossListings.slice(0, Constants.crossListingRibbonItemCount)
                                        .map((value: any, index: number) => {
                                            return <this.props.TileType {...value} key={index} customCSSClass={'tile' + index} />;
                                        })
                                }
                            </Ribbon>
                        </div> : null
                }
            </div>
        );
    }
}

(Overview as any).contextTypes = {
    loc: React.PropTypes.func,
    locParams: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};