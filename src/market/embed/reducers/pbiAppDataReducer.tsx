import { Constants } from '../../shared/utils/constants';
import { IAppDataItem, IAppDetailInformation } from '../../shared/Models';
import { ProductEnum, DataMap } from '../../shared/utils/dataMapping';

const findItem = (arr: any[], callback: (item: any) => boolean): any => {
  for (let item of arr) {
    if (callback(item)) {
      return item;
    }
  }

  return null;
};

// TODO: follow up with Jamie Warner's team to figure out how they can add this to their list
const appIdsToIgnore = [
    '89230731-57f8-48c1-9f19-4307de3b7dbd',
    'dc0bfbad-9508-40b3-bff7-fd86639bea78',
    'b019fa14-15cf-4baf-bc0f-0b4b07b2a2dc',
    '09ea17d2-a321-4021-94b9-bb8949fd19b7',
    '0d2d1835-934a-486d-b712-b898e02a4353',
    '4f1864d0-5c45-49e9-a721-8bf017e6d905',
    'e334cc9e-62f7-41b0-8e7f-6e1306541c8e',
    '835677b9-83ed-493f-ae58-da107b750344'
];

const parsePBIApp = (app: any, index: number): IAppDataItem => {
    let iconURL = app.iconUrl;
    let largeIcon = app.iconUrl;

    // One of the items in the 'images' array has key 'main' -- this is the large icon
    if (app.images) {
        let mainIndex = -1;
        for (let i = 0, len = app.images.length; i < len; i++) {
            let img = app.images[i];
            if (img.key === 'main') {
                largeIcon = img.url;
                mainIndex = i;
            } else {
                img.ImageName = img.key;
                img.ImageUri = img.url;
                delete img.key;
                delete img.url;
            }
        }

        if (mainIndex !== -1) {
            app.images.splice(mainIndex, 1);
        }
    }

    if (!iconURL || iconURL.charAt(iconURL.length - 1) === '/') {
        iconURL = '/images/defaultIcon.png';
    }

    if (!largeIcon) {
        largeIcon = '/images/defaultIcon.png';
    }

    // More PBI fields: emailAddress, description, images, learnMoreUrl,
    // publishTime, version

    let details: any = null;
    if (app.additionalMetadata) {
        try {
            details = JSON.parse(app.additionalMetadata);
            if (details) {
                let industryNumbers: number[] = [];
                for (let industry of details.industries) {
                    for (let industryMap in DataMap.industries) {
                        if (DataMap.industries[industryMap].Title === industry) {
                            industryNumbers.push(DataMap.industries[industryMap].FilterID);
                            break;
                        }
                    }
                }
                if (industryNumbers.length > 0) {
                    details.industries = industryNumbers;
                }

                let categoryNumbers: number[] = [];
                for (let category of details.categories) {
                    for (let categoryMap in DataMap.categories) {
                        if (DataMap.categories[categoryMap].Title === category) {
                            categoryNumbers.push(DataMap.categories[categoryMap].FilterID);
                            break;
                        }
                    }
                }
                if (categoryNumbers.length > 0) {
                    details.categories = categoryNumbers;
                }

                // convert the collateralDocuments format =(
                if (details.collateralDocuments) {
                    for (let i = 0, len = details.collateralDocuments.length; i < len; i++) {
                        let doc = details.collateralDocuments[i];
                        doc.DocumentName = doc.documentName;
                        doc.DocumentUri = doc.documentUrl;
                        delete doc.documentName;
                        delete doc.documentUrl;
                    }
                }
            }
        } catch (e) {
            details = null;
        }
    }

    let detailInformation = {
        // if there is no short description -- use the description field only for shortDescription
        // this is to prevent a duplicated despcription from showing on the detail page
        Description: app.shortDescription ? app.description : null,
        LargeIconUri: largeIcon,
        Subcategories: [] as string[],
        Keywords: details && details.keyWords ? details.keyWords : [] as string[],
        HelpLink: app.learnMoreUrl,
        SupportLink: null,
        Images: app.images,
        DemoVideos: [],
        CollateralDocuments: details && details.collateralDocuments ? details.collateralDocuments : null,
        AdditionalPurchasesRequired: false,
        Countries: [],
        LanguagesSupported: [],
        AppVersion: app.version,
        PrivacyPolicyUrl: details && details.privacyPolicyUrl ? details.privacyPolicyUrl : null,
        PlatformVersion: null,
        ReleaseDate: details && details.releaseDate ? details.releaseDate : app.publishTime
    } as IAppDetailInformation;

    let friendlyURL: string = null;
    if (app.url) {
        let nameStart = app.url.lastIndexOf('/') + 1;
        if (nameStart <= app.url.length) {
            friendlyURL = app.url.substr(nameStart).toLowerCase();
        }
    }

    let appDataItem = {
        index: index,
        appid: app.applicationId,
        title: app.applicationName,
        publisher: app.publishedBy,
        shortDescription: app.shortDescription ? app.shortDescription : app.description,
        builtFor: 'Power BI',
        iconURL: iconURL,
        actionString: Constants.ActionStrings.Get, // PowerBI has details.actions[] but I am ignoring it for now
        primaryProduct: ProductEnum['power-bi'],
        products: ProductEnum['power-bi'],
        industries: details && details.industries ? details.industries : 0,
        categories: details && details.categories ? details.categories : 0,
        handoffURL: app.url,
        privateApp: app.category === 'private',
        friendlyURL: friendlyURL,
        licenseTermsUrl: details && details.licenseTermsUrl ? details.licenseTermsUrl : '',
        detailInformation: detailInformation,
        filtermatch: true,
        detailLoadFailed: false
    };

    return appDataItem;
};

export const parsePBIApps = (appData: any): IAppDataItem[] => {
    let appList: IAppDataItem[] = [];

    let databaseServices: IAppDataItem[] = [];
    let manifestServices: IAppDataItem[] = [];
    let orgApps: IAppDataItem[] = [];

    for (let i = 0; i < appData.length; i++) {
        let match = findItem(appIdsToIgnore, (appid: string) => {
            return appid === appData[i].applicationId;
        });

        if (match) {
            continue;
        }

        let pbiCategory = appData[i].PBIContentProviderCategory;
        let collection = pbiCategory === 3 ? databaseServices : (
            pbiCategory === 1 ? manifestServices : orgApps
        );

        // missing code to get the Basil 'manifest item' with localized stuff
        // missing code to search through an appIdsToIgnore array

        collection.push(parsePBIApp(appData[i], i));
    }

    // Take all of PowerBI's database entries
    for (let d of databaseServices) {
        appList.push(d);
    }

    // Some of the manifest entries are duplicates of those from the database.
    // Don't add the ones that already have a database entry
    for (let m of manifestServices) {
        let match: IAppDataItem = findItem(databaseServices, (app: any) => {
            return app.title === m.title;
        });

        if (!match) {
            appList.push(m);
            continue;
        }

        if (!match.detailInformation.Images || match.detailInformation.Images.length === 0) {
            match.iconURL = m.iconURL;
            match.detailInformation.LargeIconUri = m.detailInformation.LargeIconUri;
            match.detailInformation.Images = m.detailInformation.Images;
            // add learn more url
            match.shortDescription = m.shortDescription;
        }
    }

    for (let o of orgApps) {
        appList.push(o);
    }

    // PowerBI Apps are wanting to be sorted alphabetically
    appList = appList.sort((a: IAppDataItem, b: IAppDataItem) => {
        let aTitle = a.title.toLowerCase();
        let bTitle = b.title.toLowerCase();
        return aTitle > bTitle ? 1 : ( aTitle < bTitle ? -1 : 0 );
    });

    return appList;
};
