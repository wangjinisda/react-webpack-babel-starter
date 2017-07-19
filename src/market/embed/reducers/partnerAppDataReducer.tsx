import { Constants } from '../../shared/utils/constants';
import { IAppDataItem, IAppDetailInformation } from '../../shared/Models';
import { DataMap, ProductEnum } from '../../shared/utils/dataMapping';

interface IPartnerApp {
    id: string;
    appActionType: string;
    applicationId: string;
    categories: number;
    details: IPartnerDetailInformation;
    enableLeadSharing: boolean;
    flightCodes: string[];
    handOffURL: string;
    iconBackgroundColor: string;
    industries: number;
    products: number;
    licenseTermsUrl: string;
    privateApp: boolean;
    publisher: string;
    shortDescription: string;
    smallIconUri: string;
    title: string;
}

interface IPartnerDocument {
    documentName: string;
    documentUri: string;
}

interface IPartnerVideo {
    thumbnailUrl: string;
    videoLink: string;
    videoName: string;
}

interface IPartnerImage {
    imageName: string;
    imageUri: string;
}

interface IPartnerDetailInformation {
    additionalPurchasesRequired: boolean;
    appVersion: string;
    collateralDocuments: IPartnerDocument[];
    countries: string[];
    demoVideos: IPartnerVideo[];
    description: string;
    helpLink: string;
    images: IPartnerImage[];
    keywords: string[];
    languagesSupported: string[];
    largeIconUri: string;
    platformVersion: string;
    privacyPolicyUrl: string;
    releaseDate: string;
    subCategories: string[];
    supportLink: string;
}

let ApplicationTypeMap = {
    'FREE': Constants.ActionStrings.Get,
    'TRIAL': Constants.ActionStrings.Try,
    'REQUESTFORTRIAL': Constants.ActionStrings.RequestTrial
};

const convertPartnerDocument = (d: IPartnerDocument) => ({
    DocumentName: d.documentName,
    DocumentUri: d.documentUri
});

const convertPartnerImage = (i: IPartnerImage) => ({
    ImageName: i.imageName,
    ImageUri: i.imageUri
});

const convertPartnerVideo = (v: IPartnerVideo) => ({
    ThumbnailURL: v.thumbnailUrl,
    VideoLink: v.videoLink,
    VideoName: v.videoName
});

function attemptMap<T>(a: T[], f: (v: T) => any) {
    if (a) {
        return a.map(f);
    } else {
        return [];
    }
}

export const parsePartnerApp = (app: IPartnerApp, product: ProductEnum): IAppDataItem => {

    let detailInformation: IAppDetailInformation = null;
    if (app.details) {
        let d = app.details;
        detailInformation = {
            AdditionalPurchasesRequired: d.additionalPurchasesRequired,
            AppVersion: d.appVersion,
            CollateralDocuments: attemptMap(d.collateralDocuments, convertPartnerDocument),
            Countries: d.countries,
            DemoVideos: attemptMap(d.demoVideos, convertPartnerVideo),
            Description: d.description,
            HelpLink: d.helpLink,
            Images: attemptMap(d.images, convertPartnerImage),
            Keywords: d.keywords,
            LanguagesSupported: d.languagesSupported,
            LargeIconUri: d.largeIconUri,
            PlatformVersion: d.platformVersion,
            PrivacyPolicyUrl: d.privacyPolicyUrl,
            ReleaseDate: d.releaseDate,
            Subcategories: d.subCategories,
            SupportLink: d.supportLink
        };
    }

    let builtFor = '';
    if (ProductEnum[product] && DataMap.products[ProductEnum[product]]) {
        builtFor = DataMap.products[ProductEnum[product]].LongTitle;
    }
    let appDataItem = {
        appid: app.applicationId,
        title: app.title,
        publisher: app.publisher,
        shortDescription: app.shortDescription,
        builtFor: builtFor, // TODO -- convert ProductEnum to whatever builtFor string
        iconURL: app.smallIconUri,
        iconBackgroundColor: app.iconBackgroundColor,
        actionString: ApplicationTypeMap[app.appActionType] || Constants.ActionStrings.Get,
        primaryProduct: product,
        privateApp: app.privateApp,
        products: app.products ? app.products : product,
        industries: app.industries ? app.industries : 0,
        categories: app.categories ? app.categories : 0,
        handoffURL: app.handOffURL,
        leadgenEnabled: app.enableLeadSharing,
        licenseTermsUrl: app.licenseTermsUrl,
        detailInformation: detailInformation,
        filtermatch: true,
        detailLoadFailed: false
    };

    return appDataItem;
};

export const parsePartnerApps = (appData: IPartnerApp[], embedHost: ProductEnum, startIndex = 0): IAppDataItem[] => {
    let product = embedHost;
    if (embedHost === ProductEnum['dynamics-365']) {
        product = ProductEnum.powerapps;
    }
    let appList = appData.map((a, i) => parsePartnerApp(a, product));

    // TODO: sort?
    // PowerBI Apps are wanting to be sorted alphabetically
    /* appList = appList.sort((a: IAppDataItem, b: IAppDataItem) => {
        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();
        return aTitle > bTitle ? 1 : ( aTitle < bTitle ? -1 : 0 );
    }); */

    return appList;
};
