import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { IVideo } from '../../Models';
let classNames = require('classnames-minimal');
let url = require('url');

export interface IVideoModal {
    video: IVideo;
    dismissModal: () => void;
}

interface IParsedUrl {
    hostname: string;
    pathname: string;
    query: any;
}

export default class VideoModal extends SpzaComponent<IVideoModal, any> {
    youtubeEmbedTemplate: string = 'https://www.youtube.com/embed/';
    vimeoEmbedTemplate: string = 'https://player.vimeo.com/video/';

    getQueryString(query: any, exclude?: string[]): string {
        let result = '';
        const keys = query ? Object.keys(query) : [];
        const keysLength = keys.length;

        for (let i = 0; i < keysLength; i++) {
            if (exclude && exclude.indexOf(keys[i]) < 0) {
                result += '&' + keys[i] + '=' + query[keys[i]];
            }
        }

        return result;
    }

    parseUrl(videoUrl: string): IParsedUrl {
        let parsedUrl = url.parse(videoUrl, true);

        let hostName = '';
        let pathName = '';

        if (parsedUrl) {
            hostName = parsedUrl.hostname ?  parsedUrl.hostname.toLowerCase() : hostName;
            // If the pathname doesn't start with "/", add "/" since in IE the pathname doesn't start with "/" which breaks the video url generating logic.
            pathName = (parsedUrl.pathname && parsedUrl.pathname.length > 0 && parsedUrl.pathname[0] !== '/' ? '/' : '') + parsedUrl.pathname;
        }

        return {
            hostname: hostName,
            pathname: pathName,
            query: parsedUrl ? parsedUrl.query : ''
        };
    };

    generateVideoSource(): string {
        let videoUrl = this.props.video.videoLink;
        let parsedUrl: IParsedUrl = this.parseUrl(videoUrl);
        let sourceUrl = '';
        if (parsedUrl.hostname.indexOf('youtube') >= 0 || parsedUrl.hostname.indexOf('youtu.be') >= 0) {
            if ((parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') && parsedUrl.query !== null && parsedUrl.query.v) {
                sourceUrl = this.youtubeEmbedTemplate + parsedUrl.query.v + '?' + this.getQueryString(parsedUrl.query, ['v']);
            } else if (parsedUrl.hostname === 'youtu.be') {
                let pathValues = parsedUrl.pathname.split('/');
                if (pathValues.length > 1) {
                    sourceUrl = this.youtubeEmbedTemplate + pathValues[1] + '?' + this.getQueryString(parsedUrl.query);
                }
            } else if ((parsedUrl.hostname === 'www.youtube.com' || parsedUrl.hostname === 'youtube.com') && parsedUrl.pathname.indexOf('embed') >= 0) {
                sourceUrl = videoUrl;

                if (sourceUrl.indexOf('?') < 0) {
                    sourceUrl = sourceUrl + '?';
                }
            }

            // regardless, add the modesty params
            sourceUrl = sourceUrl + '&autoplay=1&showinfo=0&rel=0&modestbranding=1';
        } else if (parsedUrl.hostname.indexOf('vimeo') >= 0) {
            // we are doing a naive parse here
            let pathValues = parsedUrl.pathname.split('/');
            sourceUrl = this.vimeoEmbedTemplate + pathValues[pathValues.length - 1] + '?' + this.getQueryString(parsedUrl.query);
        }

        // our redirect
        if ((parsedUrl.hostname === 'aka.ms')) {
            sourceUrl = videoUrl;
        }

        return sourceUrl;
    }

    renderImpl() {
        let sourceUrl = this.generateVideoSource();
        const videoDialogClasses = classNames({
            'spza_videoClass': true,
            'videoDisplay': sourceUrl !== ''
        });
        return (
            <div role='dialog' tabIndex={-1} className={videoDialogClasses}>
                <div className='dialogContent'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    <div className='videoContainer'>
                        {
                            sourceUrl !== '' ?
                                <iframe width='100%' height='100%' src={sourceUrl} frameBorder='0'></iframe>
                                :
                                <img src={this.props.video.thumbnailURL} />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

(VideoModal as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};