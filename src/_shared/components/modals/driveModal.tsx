
import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { IDrive } from '../../Models/Models';
// let classNames = require('classnames-minimal');

export interface IDriveModal {
    drive: IDrive;
    dismissModal: () => void;
}

export default class DriveModal extends SpzaComponent<IDriveModal, any> {
    renderImpl() {
        let sourceUrl = this.props.drive.urlLink;
        return (
            <div role='dialog' tabIndex={-1} className='driveModalClass'>
                <div className='dialogContent'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    <div className='driveContainer'>
                        <iframe frameborder='0' width='1200' height='675' src={sourceUrl}>
                        </iframe>
                    </div>
                </div>
            </div>
        );
    }
}

(DriveModal as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};