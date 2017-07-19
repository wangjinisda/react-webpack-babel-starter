/*
    These constants are used only in the embedded client.  They correspond to
    the values that are used in our host/client messaging contracts
*/

export module constants {
    export const initSaasMarketplaceEventName = 'initSaasMarketplace';
    export const acquireAppEventName = 'acquireSaasApp';

    export module actionTypes {
        export const acquireApp = 'acquireApp';
        export const externalRedirect = 'externalRedirect';
        export const updateUrl = 'updateUrl';
        export const closeSaasMarketplace = 'closeSaasMarketplace';
        export const finishedLoadingContentProviderList = 'contentProvidersLoaded';
    }
}
