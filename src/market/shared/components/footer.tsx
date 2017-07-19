import * as React from 'react';
import SpzaComponent from '../../shared/components/spzaComponent';
import { urlPush, routes } from '../../shared/routerHistory';
import { IBuildHrefContext, ICommonContext } from '../../shared/interfaces/context';
import { attachClickHandlerToElement } from '../../shared/utils/appUtils';

export class Footer extends SpzaComponent<any, any> {
    context: IBuildHrefContext & ICommonContext;

    componentDidMount() {
        const localePickerUrl = this.context.buildHref(routes.localePicker, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });

        const billingRegionPickerUrl = this.context.buildHref(routes.billingRegion, null, {
            category: null,
            industry: null,
            product: null,
            search: null
        });

        let internalNavigation = (url: string) => {
            return (event: any) => {
                urlPush(url);
                event.preventDefault();
            };
        };

        // locale picker
        attachClickHandlerToElement('locale-picker-link', internalNavigation(localePickerUrl));
        // billing region picker
        attachClickHandlerToElement('billingregion-picker-link', internalNavigation(billingRegionPickerUrl));
    }

    renderImpl() {
        return null as any;
    }
}

(Footer as any).contextTypes = {
    buildHref: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};