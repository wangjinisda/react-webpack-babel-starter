import { IDataItem, IDetailInformation, ISearchResult, IPrice, IStartingPrice, ITestDriveItem } from './Models';
import { PlanPricingType, OS } from '../constants';

export interface IPricingInformation {
  billingRegion: string;
  skus?: ISKU[];
}

export interface IThirdPartyPricing {
  currencyCode: string;
  pricePerCore: { [meterID: string]: IPrice };
}

export interface ISKU {
  id: string;
  title: string;
  handoffURL?: string;
  summary?: string;
  hasFreeTrial?: boolean;
  description: string;
  leadgenEnabled?: boolean;
}

export interface IVMSKU extends ISKU {
  instances: IVMSKUInstance[];
  recommendedInstanceIDs: string[];
  thirdPartyPricing: IThirdPartyPricing;
  os: OS;
  isBYOL: boolean;
  startingPrice?: IStartingPrice;
}

export interface ISimpleSKU extends ISKU {
  price: IPrice;
}

export interface ISKUInstance {
  id: string;
}

export interface IStorageSize {
  capacity: number;
  unit: string;
}

export interface IVMCategory {
  name: string;
  description?: string;
  startingPrice?: IPrice;
}

export interface IVMSKUInstance extends ISKUInstance {
  tier: string;
  category: string;
  coreCount: number;
  ram: IStorageSize;
  diskSize: IStorageSize;
  driveType: string;
  hardwareCost: { [region: string]: IPrice };
  hardwareCurrencyCode: string;
}

export interface IAppDetailInformation extends IDetailInformation {
  Subcategories?: string[];
  Keywords?: string[];
  HelpLink: string;
  SupportLink: string;
  PrivacyPolicyUrl?: string;
  AdditionalPurchasesRequired?: boolean;
  Countries?: string[];
  AppVersion?: string;
  PlatformVersion?: string;
  ReleaseDate?: string;
  TestDriveDetails?: ITestDriveItem;
}

export interface IAppDataItemBasicData extends IDataItem {
  appid: string;
  publisher: string;
  builtFor: string;
  iconBackgroundColor?: string;
  actionString: string;
  primaryProduct: number;
  privateApp?: boolean;
  leadgenEnabled?: boolean;
  detailInformation?: IAppDetailInformation;    // todo: with TS2.0 we should set this to non-nullable so that our appdetail page can be written more succinct
  startingPrice?: IStartingPrice;
  testDriveType?: string;
  planPricingType?: PlanPricingType;
  pricingInformation?: IPricingInformation;
  // Start Mooncake: add mooncake partner
  mooncakePartner?: any;
  // End Mooncake
}

export interface IAppDataItemExtraData {
  appid: string;
  shortDescription?: string;
  licenseTermsUrl?: string;
  handoffURL?: string;
  testDriveURL?: string;
  iconURL?: string;
}

export interface IAppDataItem extends IAppDataItemBasicData, IAppDataItemExtraData {
}

export interface IAppSearchResult extends ISearchResult {
  type: 'AppSearchResult';
  publisher: string;
}

export interface IFirstPartyPricing {
  items: { [os: number]: IFirstPartyPricingItem[] };
}

export interface IFirstPartyPricingItem {
  id: string;
  category: string;
  instanceName: string;
  cores: number;
  disk: IStorageSize;
  diskType: string;
  os: OS;
  ram: IStorageSize;
  prices: { [region: string]: IPrice };
  currencyCode: string;
  hasPersistentStorage: boolean;
}