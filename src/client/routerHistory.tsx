let { useRouterHistory } = require('react-router');
let { createBrowserHistory } = require('history');
export let appHistory: any = null;

let isEmbedded = false;
let previousPage = '';

export const initRouterHistory = (embedded = false) => {
    isEmbedded = embedded;
    const createAppHistory = useRouterHistory(createBrowserHistory);
    let options: any = {};
    if (embedded) {
        options.basename = '/embed';
    }
    appHistory = createAppHistory(options);
};

let marketplace = {
    name: 'appGallery',
    getPath: (routeArgs?: any) => {
        if (routeArgs && routeArgs.category) {
            return '/marketplace/apps/category/' + routeArgs.category;
        } else {
            return '/marketplace/apps';
        }
    }
};

let appDetails = {
    name: 'appDetails',
    getPath: (routeArgs: any) => '/marketplace/apps/' + routeArgs.appid,
    params: ''
};

let localePicker = {
        name: 'locale',
        getPath: () => '/localepicker',
        params: ''
};

let marketing = {
        name: 'sell',
        getPath: () => '/sell',
        params: ''
};

let about = {
        name: 'about',
        getPath: () => '/about',
        params: ''
};

let fieldHub = {
        name: 'fieldHub',
        getPath: () => '/field-hub',
        params: ''
};

export const routes = {
    marketplace,
    appDetails,
    marketing,
    localePicker,
    about,
    fieldHub
}