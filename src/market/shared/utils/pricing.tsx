import { ILocContext, ILocParamsContext } from '../interfaces/context';
import { IPrice, ILocalPrice, PricingStates } from '../Models';
import { IBillingCountry } from './../Models';

export function getPriceString(context: ILocContext & ILocParamsContext, price: IPrice | ILocalPrice | PricingStates,
    countryCode: string, currency: string, maximumFractionDigits = 3, formatStringLocalizationKey = '{0}/{1}'): string {
    let text = '';
    if (price && typeof price === 'object') {
        if (price.value === 0) {
            text = context.loc('Pricing_Free');
        } else {
            let unitLocalizationKey = '';
            if (price.unit.toLowerCase() === 'hr' || price.unit.toLowerCase() === 'hour' || price.unit.toLowerCase() === 'hours') {
                unitLocalizationKey = 'Pricing_Hour';
            } else if (price.unit.toLowerCase() === 'month') {
                unitLocalizationKey = 'Pricing_Month';
            } else if (price.unit.toLowerCase() === 'perpetual') {
                unitLocalizationKey = '';
            } else {
                unitLocalizationKey = price.unit;
            }

            let priceString = price.value.toLocaleString(countryCode, {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: maximumFractionDigits
            });

            // If the currency code is not converted to a symbol, then we want to display a space between the text and number.
            // For ex, PHP11.166 should be PHP 11.166. toLocaleString(..) does not support formatting. So we shd do this manually.
            // We first find out if the currency is present in the resulting priceString. This makes sure we aren't inserting space in a symbol.
            // We find out the position to insert a space (currencyValuePosition). We make sure that we are inserting
            // a space in between the price string - we don't want to insert a space at the end. Also, we don't want to insert a space if we already have one.
            let currencyCodePosition = priceString.indexOf(currency);
            let currencyValuePosition = currencyCodePosition + currency.length;
            if (currencyCodePosition >= 0 && currencyValuePosition < priceString.length && !/\s/.test(priceString[currencyValuePosition])) {
                priceString = priceString.slice(0, currencyValuePosition) + ' ' + priceString.slice(currencyValuePosition, priceString.length);
            }

            if (unitLocalizationKey) {
                // $ is used to escape the second $ character
                if (priceString[0] === '$') {
                    priceString = '$' + priceString;
                }

                text = context.locParams(formatStringLocalizationKey, [priceString, context.loc(unitLocalizationKey)]);
            } else {
                text = priceString;
            }
        }
    }

    return text;
}

export const billingCountries: IBillingCountry[] = [
    // Start Mooncake
    {
        countryCode: 'cn',
        currency: 'CNY',
        name: 'China'
    }
    // End Mooncake
];