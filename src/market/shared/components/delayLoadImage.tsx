import * as React from 'react';
import SpzaComponent from './spzaComponent';

export interface IDelayLoadImageProps {
    src: string;
    className: string;
}

export class DelayLoadImage extends SpzaComponent<IDelayLoadImageProps, any> {
    renderImpl() {
        return (
            <div className={'delayLoadImage ' + this.props.className}>{this.props.src}</div>
        );
    }
}
