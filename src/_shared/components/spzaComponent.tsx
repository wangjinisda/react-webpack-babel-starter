import * as React from 'react';
import { logClientError } from '../utils/appUtils';
import { ICommonContext } from '../interfaces/context';

export default class SpzaComponent<P, S> extends React.Component<P, S> {
    context: ICommonContext;
    renderImpl(): any {
        // should never be called
        throw new Error('SpzaComponent renderImpl method should never be called!\nMake sure you are implementing renderImpl in your Component');
    }

    renderFailImpl(err: any): any {
        // rendering must _never_ let an error escape. This puts react in a bad state and
        // current versions (15.x) cannot deal with that.
        logClientError(err, 'client side error: [From spzaComponent] ');
        this.context.renderErrorModal();
        return null;
    }

    render() {
        try {
            return this.renderImpl();
        } catch (err) {
            return this.renderFailImpl(err);
        }
    }
}