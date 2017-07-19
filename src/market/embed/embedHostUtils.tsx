import { DataMap, ProductEnum } from '../shared/utils/dataMapping';

const powerBIHost = ProductEnum['power-bi'];
const dynamics365financials = ProductEnum['dynamics-365-for-financials'];
const dynamics365 = ProductEnum['dynamics-365'];
const dynamicsCRMLegacy = ProductEnum['dynamics-365-for-sales'];

export function shouldShowCloseButton(embedHost: ProductEnum) {
    return embedHost !== dynamics365financials;
}

export function shouldHideFilterPane(embedHost: ProductEnum) {
    return embedHost === powerBIHost || embedHost === dynamics365financials;
}

export function shouldHideIndustriesAndProducts(embedHost: ProductEnum) {
    return embedHost !== dynamics365;
}

export function hasDynamicData(embedHost?: ProductEnum) {
    return embedHost === powerBIHost;
}

export function hasPrivateApps(embedHost: ProductEnum) {
    return embedHost === powerBIHost || embedHost === dynamics365;
}

export function shouldShowCuratedData(embedHost: ProductEnum) {
    return embedHost === dynamics365;
}

export function shouldShowPowerAppsNoContent(embedHost: ProductEnum) {
    return embedHost === powerBIHost || embedHost === dynamics365;
}

export function shouldShowLegacyStyle(embedHost: ProductEnum) {
    return embedHost === dynamics365financials || embedHost === dynamicsCRMLegacy;
}

export function getPowerAppsTitle() {
    return DataMap.products['powerapps'].Title;
}