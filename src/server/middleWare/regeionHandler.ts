import { generateGuid, readCookie, saveCookie } from './../../market/shared/utils/appUtils';
import { newSpzaCookie, saveSpzaLocale, loadSpzaLocale } from './../../market/server/auth/cookie'

const pricingCookieKey = 'appsourcebillingregion';

export let serverRegionHandler = () => {

    return (req: any, res: any, next: any) => {
        let countryCode = loadSpzaLocale(req) || '' ;
        if(countryCode === ''){
            countryCode = 'cn';
            saveSpzaLocale(countryCode, res);
            // saveCookie(pricingCookieKey, countryCode, 'Fri, 31 Dec 9999 23:59:59 GMT');
        }
        req.clientRedirectUrl = '/zh-cn';
        return next();
        // res.redirect('/zh-cn');
    }
}