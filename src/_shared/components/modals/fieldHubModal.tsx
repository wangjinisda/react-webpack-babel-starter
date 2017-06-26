import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { IFieldHub } from '../../Models/Models';

export interface IFieldHubModalProps {
    iframeProps: IFieldHub;
    accessToken: any;
    dismissModal: () => void;
    refreshAccessToken: () => Promise<any>;
}

export default class IFieldHubModal extends SpzaComponent<IFieldHubModalProps, any> {
    postActionLoadReport() {
        // Once the iframe is loaded, we need to invoke post message and pass the access token to the power-bi iframe
        // We iterate over the DOM to find out the iframes and then send the access token to the modalIframe on which our power-bi report is hosted.
        let iframes = document.getElementsByTagName('iframe');

        let m = {
            action: 'loadReport',
            accessToken: (this.props.accessToken && this.props.accessToken.fieldHub) ? this.props.accessToken.fieldHub : ''
        };
        let message = JSON.stringify(m);

        for (let i = 0; i < iframes.length; i++) {
            let iframe = iframes[i];

            if (iframe.id === 'modalIframe') {
                iframe.contentWindow.postMessage(message, '*');
            }
        }
    }

    componentDidMount() {
        // Refresh the access token if it has expired or about to expire
        this.props.refreshAccessToken()
            .then(() => {
                let iframe = document.getElementById('modalIframe');
                iframe.onload = this.postActionLoadReport.bind(this);
            });
    }

    renderImpl() {
        let sourceUrl = this.props.iframeProps.url;
        return (
            <div role='dialog' tabIndex={-1} className='fieldHubModalClass'>
                <div className='dialogContent'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    <div className='iframeContainer'>
                        <iframe id='modalIframe' frameborder='0' width='1200' height='675' src={sourceUrl}>
                        </iframe>
                    </div>
                </div>
            </div>
        );
    }
}

(IFieldHubModal as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};