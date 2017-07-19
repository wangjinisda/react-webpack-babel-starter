import * as React from 'react';
import SpzaComponent from './../spzaComponent';
import { logClientError } from '../../utils/appUtils';

interface IErrorModalProps {
    dismissModal: () => void;
}

export default class ErrorModal extends SpzaComponent<IErrorModalProps, any> {
    renderFailImpl(err: any): any {
        // We don't want error modal while trying to render error modal since it goes into a loop.
        // So, we are seperately handling the error case.
        logClientError(err, 'client side error: [From errorModal] ');
        return null;
    }

    renderImpl() {
        let context = this.context as any;
        return (
            <div role='dialog' tabIndex={-1} className='errorModalClass'>
                <div className='prompContainer'>
                    <div className='toolBar'>
                        <button className='cancel' onClick={this.props.dismissModal}>
                            <span className='c-glyph'></span>
                        </button>
                    </div>
                    <div className='errorModal'>
                        <div className='contentHeader'>
                            {context.loc('ERROR_Title', 'Something went wrong')}
                        </div>
                        <div className='errorContent'>
                            <div className='errorMessage'>{context.loc('ERROR_Subtitle', 'Go to the homepage to try that again.')}</div>
                            <div className='dismissErrorButton'>
                                <button name='button' className='c-button'
                                    type='submit'
                                    onClick={this.props.dismissModal}>{context.loc('ERROR_Link', 'Home')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

(ErrorModal as any).contextTypes = {
    loc: React.PropTypes.func
};
