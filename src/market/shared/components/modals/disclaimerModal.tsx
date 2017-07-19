import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { ILocContext, ICommonContext } from '../../interfaces/context';
import { IDisclaimer } from './../../Models';

interface IDisclaimerModalProps {
    payload: IDisclaimer;
    dismissModal: () => void;
}

export default class DisclaimerModal extends SpzaComponent<IDisclaimerModalProps, any> {
    public context: ILocContext & ICommonContext;

    constructor(props: IDisclaimerModalProps, context: ILocContext & ICommonContext) {
        super(props, context);
    }

    renderImpl() {
        return (
            <div role='dialog' tabIndex={-1} className='disclaimerModalClass'>
                <div className='prompContainer'>
                    <div className='title'>{this.props.payload.title}</div>
                    <div className='description'>{this.props.payload.description}</div>
                    <div className='footer'>
                        <button name='button' className='c-button requestButton' type='submit'
                            onClick={this.props.dismissModal}>{this.context.loc('Dialog_Continue')}</button>
                    </div>
                </div>
            </div>
        );
    }
}

(DisclaimerModal as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
