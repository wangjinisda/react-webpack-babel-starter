import * as routerHistory from '../shared/routerHistory';

function deepCopy(data: any): any {
    let newData: any = {};
    if (data == null || typeof data !== 'object') {
        return data;
    }
    if (data.length) {
        newData = data.map((i: any) => i);
    } else {
        for (let k in data) {
            newData[k] = deepCopy(data[k]);
        }
    }
    return newData;
}

let macHistory = deepCopy(routerHistory);
// todo: should really remove other ones?

// marketplace
macHistory.routeParams.marketplace.push('subcategories');
macHistory.routeParams.marketplace.push('filters');
macHistory.routes.marketplace = {
    name: 'appGallery',
    getPath: (routeArgs?: IMarketplaceParams) => {
        if (routeArgs && routeArgs.category) {
            return '/marketplace/apps/category/' + routeArgs.category;
        } else {
            return '/marketplace/apps';
        }
    },
    params: macHistory.routeParams.marketplace.concat(macHistory.routeParams.appView),
    initialParamsValue: {
        subcategories: null,
        page: '1',
        search: null,
        category: null,
        industry: null,
        product: null,
        filters: null
    }
} as routerHistory.IRouteConfig<IMarketplaceParams>;

export interface IMarketplaceParams {
    category: string;
}

// app details
macHistory.routes.appDetails = {
    name: 'appDetails',
    getPath: (routeArgs: routerHistory.IAppDetailsParams) => '/marketplace/apps/' + routeArgs.appid,
    params: macHistory.routeParams.appDetails.concat(macHistory.routeParams.appView)
} as routerHistory.IRouteConfig<routerHistory.IAppDetailsParams>;

macHistory.routes.testDrive = {
    name: 'testdrive',
    getPath: (routeArgs: routerHistory.ITestDriveParams) => '/marketplace/apps/' + routeArgs.appid + '/manage/testdrive',
    params: macHistory.routeParams.appDetails.concat(macHistory.routeParams.appView)
} as routerHistory.IRouteConfig<routerHistory.ITestDriveParams>;

// export all
Object.keys(macHistory).forEach(function (key) {
    exports[key] = macHistory[key];
});