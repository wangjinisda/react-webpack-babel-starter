import * as React from 'react';
import SpzaComponent from './spzaComponent';

export interface IAnimationProps {
    // default is the linear animation
    isCircular?: boolean;
}

export default class Animation extends SpzaComponent<IAnimationProps, any> {
    renderImpl() {
        return (
            this.props.isCircular ?
                <div className='c-progress f-indeterminate-local f-progress-small' role='progressbar'
                 aria-valuetext='Loading...' tabindex='0' aria-label='indeterminate local small progress bar'>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                :
                <div className='c-progress f-indeterminate-regional' role='progressbar'
                    aria-valuetext='Loading...' tabindex='0'>
                    <span className='aniDot'></span>
                    <span className='aniDot'></span>
                    <span className='aniDot'></span>
                    <span className='aniDot'></span>
                    <span className='aniDot'></span>
                </div>
        );
    }
}

(Animation as any).contextTypes = {
    renderErrorModal: React.PropTypes.func
};