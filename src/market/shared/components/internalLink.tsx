import * as React from 'react';
import SpzaComponent from './spzaComponent';
import { urlPush } from '../routerHistory';

// Did not add the error handling for the render menthod in this component : If there is an error, we don't want to go in a loop
export class InternalLink extends SpzaComponent<any, any> {
    renderImpl() {
        let href: string = null;
        let onClick: (e: any) => void = null;
        let children: any = null;
        let otherProps = {};
        let aTagAccEnabled = this.props.accEnabled ? 0 : -1;
        let additionalCommand: (e: any) => void = null;

        for (let p in this.props) {
            let val: any = this.props[p];
            if (p === 'href') {
                href = val;
            } else if (p === 'onClick') {
                onClick = val;
            } else if (p === 'children') {
                children = val;
            } else if (p === 'additionalCommand') {
                additionalCommand = val;
            } else {
                otherProps[p] = val;
            }
        }

        let callback: any;

        if (onClick) {
            callback = (e: any) => {
                if (additionalCommand) {
                    additionalCommand(e);
                }

                onClick(e);
                e.preventDefault();
            };
        } else {
            callback = (e: any) => {
                if (additionalCommand) {
                    additionalCommand(e);
                }

                e.preventDefault();
                urlPush(href, this.props.scrollToTop);
            };
        }

        return (
            <a {...otherProps} href={href} onClick={callback} tabIndex={aTagAccEnabled}>
                {children}
            </a>
        );
    }
}
