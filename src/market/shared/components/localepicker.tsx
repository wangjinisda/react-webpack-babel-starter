import * as React from 'react';
import SpzaComponent from './spzaComponent';
// import { AllLocales as Locales } from 'utils/localesList';
import { AllLocales as Locales } from './../../mac/utils/localesList';
import { saveCookie } from '../../shared/utils/appUtils';
import { Constants } from '../../shared/utils/constants';
// import { urlPush, routes, buildHref } from './../../mac/routerHistory';
let { urlPush, routes, buildHref } =require('./../../mac/routerHistory');

export default class LocalePicker extends SpzaComponent<any, any> {
    renderLocaleColumns(index: any) {
        let chunkSize = Math.ceil(Locales.length / 4);
        let start = index * chunkSize;
        return Locales.slice(start, start + chunkSize).map((value: any, key: number) => {
            return (
                <li>
                    <p className='c-hyperlink localeLink' onClick={() => {
                        saveCookie(Constants.Cookies.LocaleCookie, value.locale, 'expires=Fri, 31 Dec 9999 23:59:59 GMT');
                        const redirectURL = buildHref(
                            routes.home,
                            null,
                            null,
                            null,
                            null,
                            null,
                            value.locale);
                        urlPush(redirectURL);
                    } }>{value.language}</p>
                </li>
            );
        });
    }

    renderImpl() {
        let context = this.context as any;
        return (
            <div className='spza_regions localePicker'>
                <h3 className='c-heading-3 regionTitle'>{context.loc('Loc_PageTitle')}</h3>
                <div className='details'>
                    <div className='column'>{this.renderLocaleColumns(0)}</div>
                    <div className='column'>{this.renderLocaleColumns(1)}</div>
                    <div className='column'>{this.renderLocaleColumns(2)}</div>
                    <div className='column'>{this.renderLocaleColumns(3)}</div>
                </div>
            </div>
        );
    }
}

(LocalePicker as any).contextTypes = {
    loc: React.PropTypes.func,
    renderErrorModal: React.PropTypes.func
};
