import * as React from 'react';
import { IFirstPartyPricingItem, IVMSKU } from './../Models';
import { IBillingCountry } from '../../shared/Models';
import { OS } from './constants';
import { ILocContext } from '../../shared/interfaces/context';
import { IStartingPrice, PricingStates } from '../../shared/Models';

export const billingCountries: IBillingCountry[] = [
    // Start Mooncake
    {
        countryCode: 'cn',
        currency: 'CNY',
        name: 'China'
    }
    // End Mooncake
];

export function getBillingCountryByCountryCode(countryCode: string): IBillingCountry {
    return billingCountries.filter(item => item.countryCode === countryCode)[0];
}

export let regionOrder = {
    // Start Mooncake
    'china-north': 0,
    'china-east': 1
    // End Mooncake
};

export function processFirstPartyPricingItems(sourceData: any): IFirstPartyPricingItem[] {
    return sourceData.value.map((item: any): IFirstPartyPricingItem => {
        let result: IFirstPartyPricingItem = {
            id: item.id,
            // If the instance is A series and the category is "General Purpose", use the instance tier instead (which sould be either "Basic" or "Standard".)
            category: (item.series === 'A' && item.category === 'GeneralPurpose') ? item.tier : item.category,
            cores: item.cores,
            disk: {
                capacity: item.disk.capacity,
                unit: item.disk.unit
            },
            instanceName: item.instanceName,
            os: OS[item.os as string],
            ram: {
                capacity: item.ram.capacity,
                unit: item.ram.unit
            },
            prices: {},
            diskType: item.diskType,
            currencyCode: item.prices.currencyCode,
            hasPersistentStorage: item.disk.hasPersistentStorage === true
        };

        for (let region in regionOrder) {
            result.prices[region] = {
                value: item.prices.pricesByRegion[region] || item.prices.default,
                unit: item.prices.meterUnit
            };
        }

        return result;
    });
}

export function getThirdPartyStartingPrice(vmSKU: IVMSKU): IStartingPrice {
    if (!vmSKU.isBYOL) {
        let startingPrice = {
            pricingData: {
                value: 0,
                unit: 'hour',
                currency: vmSKU.thirdPartyPricing.currencyCode
            }
        };

        if (vmSKU.thirdPartyPricing && vmSKU.thirdPartyPricing.pricePerCore) {


            let startingPriceValue = Number.MAX_VALUE;
            for (let meterID in vmSKU.thirdPartyPricing.pricePerCore) {
                startingPriceValue = Math.min(startingPriceValue, vmSKU.thirdPartyPricing.pricePerCore[meterID].value);
            }

            startingPrice.pricingData.value = startingPriceValue;
        }

        return startingPrice;
    }

    return {
        pricingData: PricingStates.BYOL
    };
}

export function sortVMSKUsByStartingPrice(skus: IVMSKU[]) {
    skus.sort((a, b) => {
        let valueA = a.startingPrice
            && a.startingPrice.pricingData
            && (a.startingPrice.pricingData as any).value || -1;
        let valueB = b.startingPrice
            && b.startingPrice.pricingData
            && (b.startingPrice.pricingData as any).value || -1;
        return valueA - valueB;
    });
}

export function renderNotAvailablePriceUI(context: ILocContext) {
    return (
        <div className='noAvailablePrice'>
            <h6 className='c-heading-6'>{context.loc('Pricing_SoftwarePlanDetail_Title')}</h6>
            <p>{context.loc('Pricing_SoftwarePlanDetail_NotAvailableDescription')}</p>
        </div>
    );
}