// This is a generated file during the build. Please do not change anything in this file.
// If you want to change anything in this file, please contact the project owners

/* tslint:disable:max-line-length */

export enum ProductEnum {
    'azure' = 64,
    'web-apps' = 4096,
    'cortana-intelligence' = 8192,
    'dynamics-365' = 2,
    'dynamics-365-for-operations' = 1,
    'dynamics-365-for-sales' = 128,
    'dynamics-365-for-financials' = 8,
    'dynamics-365-for-customer-services' = 1024,
    'dynamics-365-for-field-services' = 256,
    'dynamics-365-for-project-services-automation' = 512,
    'power-bi' = 16,
    'dynamics-nav' = 4,
    'powerapps' = 2048,
    'office' = 16384,
    'excel' = 32768,
    'onenote' = 65536,
    'outlook' = 131072,
    'powerpoint' = 262144,
    'project' = 524288,
    'sharepoint' = 1048576,
    'teams' = 2097152,
    'word' = 4194304,
    'office-deprecated' = 32
}

export enum IndustryEnum {
    'agriculture' = 1,
    'distribution' = 2,
    'finance' = 4,
    'government' = 8,
    'healthcare' = 16,
    'manufacturing' = 32,
    'professional-services' = 64,
    'retail' = 128,
    'education' = 256
}

export enum CategoryEnum {
    'analytics' = 1,
    'artifical-intelligence' = 1024,
    'collaboration' = 2,
    'customer-service' = 4,
    'finance' = 8,
    'human-resources' = 16,
    'it-admin' = 32,
    'marketing' = 64,
    'operations' = 128,
    'productivity' = 256,
    'sales' = 512
}

export enum ProductBitmaskEnum {
    'Azure' = 64,
    'Azure for Web Apps' = 4096,
    'Azure for Cortana Intelligence' = 8192,
    'Dynamics 365' = 2,
    'Dynamics 365 for Operations' = 1,
    'Dynamics 365 for Sales' = 128,
    'Dynamics 365 for Financials' = 8,
    'Dynamics 365 for Customer Services' = 1024,
    'Dynamics 365 for Field Services' = 256,
    'Dynamics 365 for Project Services Automation' = 512,
    'Power BI' = 16,
    'Dynamics NAV' = 4,
    'PowerApps' = 2048,
    'Office365' = 16384,
    'Excel' = 32768,
    'OneNote' = 65536,
    'Outlook' = 131072,
    'PowerPoint' = 262144,
    'Project' = 524288,
    'SharePoint' = 1048576,
    'Teams' = 2097152,
    'Word' = 4194304,
    'Office 365' = 32
}

export enum IndustryBitmaskEnum {
    'Agriculture' = 1,
    'Distribution' = 2,
    'FinancialServices' = 4,
    'Government' = 8,
    'HealthCareandLifeSciences' = 16,
    'Manufacturing' = 32,
    'ProfessionalServices' = 64,
    'RetailandConsumerGoods' = 128,
    'Education' = 256
}

export enum CategoryBitmaskEnum {
    'Analytics' = 1,
    'ArtificialIntelligence' = 1024,
    'Collaboration' = 2,
    'CustomerService' = 4,
    'Finance' = 8,
    'HumanResources' = 16,
    'ITandAdministration' = 32,
    'Marketing' = 64,
    'OperationsSupplyChain' = 128,
    'Productivity' = 256,
    'Sales' = 512
}

export interface IDataValues {
    FilterID: number;
    LocKey: string;
    Title: string;
    LongTitle: string;
    UrlKey: string;
    ShortcutFilters: string[];
    IsChildFilter: boolean;
    DisplayOnHome: boolean;
    AllowMSA?: boolean;
    BackendKey: string;
    ProductCode?: string;
    ShortcutUrlKey: string;
    ShortcutBitmask: number;
    FilterGroup: string;
    isActive?: boolean;
    count?: number;
    match?: (item: any) => boolean;
    checkFilter?: boolean;
}

export interface IDataCollection {
    [dataKey: string]: IDataValues;
}

export interface IDataMap {
    products: IDataCollection;
    categories: IDataCollection;
    industries: IDataCollection;
}

export const DataMap: IDataMap = {
    products: {
        'azure': {
            FilterID: 64,
            LocKey: 'Filter_CloudSolutions',
            Title: 'Cloud Solutions',
            LongTitle: 'Cloud Solutions',
            UrlKey: 'azure',
            ShortcutFilters: [
                'web-apps',
                'cortana-intelligence'
            ],
            IsChildFilter: false,
            DisplayOnHome: true,
            AllowMSA: false,
            BackendKey: 'Azure',
            ProductCode: 'Azure',
            ShortcutUrlKey: 'web-apps;cortana-intelligence',
            ShortcutBitmask: 12352,
            FilterGroup: 'product'
        },
        'web-apps': {
            FilterID: 4096,
            LocKey: 'Filter_AZ_WebApps',
            Title: 'Web apps',
            LongTitle: 'Web apps',
            UrlKey: 'web-apps',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Azure for Web Apps',
            ProductCode: 'Web Apps',
            ShortcutUrlKey: 'web-apps',
            ShortcutBitmask: 4096,
            FilterGroup: 'product'
        },
        'cortana-intelligence': {
            FilterID: 8192,
            LocKey: 'Filter_AZ_Cortana_Intelligence',
            Title: 'Cortana Intelligence',
            LongTitle: 'Cortana Intelligence',
            UrlKey: 'cortana-intelligence',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Azure for Cortana Intelligence',
            ProductCode: 'Cortana Intelligence',
            ShortcutUrlKey: 'cortana-intelligence',
            ShortcutBitmask: 8192,
            FilterGroup: 'product'
        },
        'dynamics-365': {
            FilterID: 2,
            LocKey: 'Filter_Dynamics365',
            Title: 'Dynamics 365',
            LongTitle: 'Dynamics 365',
            UrlKey: 'dynamics-365',
            ShortcutFilters: [
                'dynamics-365-for-sales',
                'dynamics-365-for-field-services',
                'dynamics-365-for-project-services-automation',
                'dynamics-365-for-customer-services',
                'dynamics-365-for-operations',
                'dynamics-365-for-financials'
            ],
            IsChildFilter: false,
            DisplayOnHome: true,
            AllowMSA: false,
            BackendKey: 'Dynamics 365',
            ProductCode: 'Dynamics 365',
            ShortcutUrlKey: 'dynamics-365-for-sales;dynamics-365-for-field-services;dynamics-365-for-project-services-automation;dynamics-365-for-customer-services;dynamics-365-for-operations;dynamics-365-for-financials',
            ShortcutBitmask: 1931,
            FilterGroup: 'product'
        },
        'dynamics-365-for-operations': {
            FilterID: 1,
            LocKey: 'Filter_D365_Operations',
            Title: 'Operations',
            LongTitle: 'Dynamics 365 for Operations',
            UrlKey: 'dynamics-365-for-operations',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Operations',
            ProductCode: 'Dynamics 365 for Operations',
            ShortcutUrlKey: 'dynamics-365-for-operations',
            ShortcutBitmask: 1,
            FilterGroup: 'product'
        },
        'dynamics-365-for-sales': {
            FilterID: 128,
            LocKey: 'Filter_D365_Sales',
            Title: 'Sales',
            LongTitle: 'Dynamics 365 for Sales',
            UrlKey: 'dynamics-365-for-sales',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Sales',
            ProductCode: 'Dynamics 365 for Sales',
            ShortcutUrlKey: 'dynamics-365-for-sales',
            ShortcutBitmask: 128,
            FilterGroup: 'product'
        },
        'dynamics-365-for-financials': {
            FilterID: 8,
            LocKey: 'Filter_D365_Financials',
            Title: 'Financials',
            LongTitle: 'Dynamics 365 for Financials',
            UrlKey: 'dynamics-365-for-financials',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Financials',
            ProductCode: 'Dynamics 365 for Financials',
            ShortcutUrlKey: 'dynamics-365-for-financials',
            ShortcutBitmask: 8,
            FilterGroup: 'product'
        },
        'dynamics-365-for-customer-services': {
            FilterID: 1024,
            LocKey: 'Filter_D365_Customer',
            Title: 'Customer Service',
            LongTitle: 'Dynamics 365 for Customer Service',
            UrlKey: 'dynamics-365-for-customer-services',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Customer Services',
            ProductCode: 'Dynamics 365 for Customer Services',
            ShortcutUrlKey: 'dynamics-365-for-customer-services',
            ShortcutBitmask: 1024,
            FilterGroup: 'product'
        },
        'dynamics-365-for-field-services': {
            FilterID: 256,
            LocKey: 'Filter_D365_Field_Services',
            Title: 'Field Service',
            LongTitle: 'Dynamics 365 for Field Service',
            UrlKey: 'dynamics-365-for-field-services',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Field Services',
            ProductCode: 'Dynamics 365 for Field Services',
            ShortcutUrlKey: 'dynamics-365-for-field-services',
            ShortcutBitmask: 256,
            FilterGroup: 'product'
        },
        'dynamics-365-for-project-services-automation': {
            FilterID: 512,
            LocKey: 'Filter_D365_Project',
            Title: 'Project Service Automation',
            LongTitle: 'Dynamics 365 for Project Service Automation',
            UrlKey: 'dynamics-365-for-project-services-automation',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics 365 for Project Services Automation',
            ProductCode: 'Dynamics 365 for Project Services Automation',
            ShortcutUrlKey: 'dynamics-365-for-project-services-automation',
            ShortcutBitmask: 512,
            FilterGroup: 'product'
        },
        'power-bi': {
            FilterID: 16,
            LocKey: 'Filter_PowerBI',
            Title: 'Power BI',
            LongTitle: 'Power BI',
            UrlKey: 'power-bi',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            AllowMSA: false,
            BackendKey: 'Power BI',
            ProductCode: 'Power BI',
            ShortcutUrlKey: 'power-bi',
            ShortcutBitmask: 16,
            FilterGroup: 'product'
        },
        'dynamics-nav': {
            FilterID: 4,
            LocKey: 'Filter_DynamicsNAV',
            Title: 'Dynamics NAV',
            LongTitle: 'Dynamics NAV',
            UrlKey: 'dynamics-nav',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Dynamics NAV',
            ProductCode: 'Dynamics NAV',
            ShortcutUrlKey: 'dynamics-nav',
            ShortcutBitmask: 4,
            FilterGroup: 'product'
        },
        'powerapps': {
            FilterID: 2048,
            LocKey: 'Filter_PowerApps',
            Title: 'PowerApps',
            LongTitle: 'PowerApps',
            UrlKey: 'powerapps',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'PowerApps',
            ProductCode: 'PowerApps',
            ShortcutUrlKey: 'powerapps',
            ShortcutBitmask: 2048,
            FilterGroup: 'product'
        },
        'office': {
            FilterID: 16384,
            LocKey: 'Filter_Office365',
            Title: 'Office 365',
            LongTitle: 'Office 365',
            UrlKey: 'office',
            ShortcutFilters: [
                'excel',
                'onenote',
                'outlook',
                'powerpoint',
                'project',
                'sharepoint',
                'teams',
                'word'
            ],
            IsChildFilter: false,
            DisplayOnHome: true,
            AllowMSA: false,
            BackendKey: 'Office365',
            ProductCode: 'Office365',
            ShortcutUrlKey: 'excel;onenote;outlook;powerpoint;project;sharepoint;teams;word',
            ShortcutBitmask: 8372224,
            FilterGroup: 'product'
        },
        'excel': {
            FilterID: 32768,
            LocKey: 'Filter_O365_Excel',
            Title: 'Excel',
            LongTitle: 'Excel',
            UrlKey: 'excel',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'Excel',
            ProductCode: 'Excel',
            ShortcutUrlKey: 'excel',
            ShortcutBitmask: 32768,
            FilterGroup: 'product'
        },
        'onenote': {
            FilterID: 65536,
            LocKey: 'Filter_O365_OneNote',
            Title: 'OneNote',
            LongTitle: 'OneNote',
            UrlKey: 'onenote',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'OneNote',
            ProductCode: 'OneNote',
            ShortcutUrlKey: 'onenote',
            ShortcutBitmask: 65536,
            FilterGroup: 'product'
        },
        'outlook': {
            FilterID: 131072,
            LocKey: 'Filter_O365_Outlook',
            Title: 'Outlook',
            LongTitle: 'Outlook',
            UrlKey: 'outlook',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'Outlook',
            ProductCode: 'Outlook',
            ShortcutUrlKey: 'outlook',
            ShortcutBitmask: 131072,
            FilterGroup: 'product'
        },
        'powerpoint': {
            FilterID: 262144,
            LocKey: 'Filter_O365_PowerPoint',
            Title: 'PowerPoint',
            LongTitle: 'PowerPoint',
            UrlKey: 'powerpoint',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'PowerPoint',
            ProductCode: 'PowerPoint',
            ShortcutUrlKey: 'powerpoint',
            ShortcutBitmask: 262144,
            FilterGroup: 'product'
        },
        'project': {
            FilterID: 524288,
            LocKey: 'Filter_O365_Project',
            Title: 'Project',
            LongTitle: 'Project',
            UrlKey: 'project',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'Project',
            ProductCode: 'Project',
            ShortcutUrlKey: 'project',
            ShortcutBitmask: 524288,
            FilterGroup: 'product'
        },
        'sharepoint': {
            FilterID: 1048576,
            LocKey: 'Filter_O365_SharePoint',
            Title: 'SharePoint',
            LongTitle: 'SharePoint',
            UrlKey: 'sharepoint',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'SharePoint',
            ProductCode: 'SharePoint',
            ShortcutUrlKey: 'sharepoint',
            ShortcutBitmask: 1048576,
            FilterGroup: 'product'
        },
        'teams': {
            FilterID: 2097152,
            LocKey: 'Filter_O365_Teams',
            Title: 'Teams',
            LongTitle: 'Teams',
            UrlKey: 'teams',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Teams',
            ProductCode: 'Teams',
            ShortcutUrlKey: 'teams',
            ShortcutBitmask: 2097152,
            FilterGroup: 'product'
        },
        'word': {
            FilterID: 4194304,
            LocKey: 'Filter_O365_Word',
            Title: 'Word',
            LongTitle: 'Word',
            UrlKey: 'word',
            ShortcutFilters: null,
            IsChildFilter: true,
            DisplayOnHome: false,
            AllowMSA: true,
            BackendKey: 'Word',
            ProductCode: 'Word',
            ShortcutUrlKey: 'word',
            ShortcutBitmask: 4194304,
            FilterGroup: 'product'
        },
        'office-deprecated': {
            FilterID: 32,
            LocKey: 'Filter_Office',
            Title: 'Deprecated Office 365',
            LongTitle: 'Deprecated Office 365',
            UrlKey: 'office-deprecated',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: false,
            AllowMSA: false,
            BackendKey: 'Office 365',
            ProductCode: 'Office 365',
            ShortcutUrlKey: 'office-deprecated',
            ShortcutBitmask: 32,
            FilterGroup: 'product'
        }
    },
    industries: {
        'agriculture': {
            FilterID: 1,
            LocKey: 'Filter_Agriculture',
            Title: 'Agriculture',
            LongTitle: 'Agriculture',
            UrlKey: 'agriculture',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Agriculture',
            ShortcutUrlKey: 'agriculture',
            ShortcutBitmask: 1,
            FilterGroup: 'industry'
        },
        'distribution': {
            FilterID: 2,
            LocKey: 'Filter_Distribution',
            Title: 'Distribution',
            LongTitle: 'Distribution',
            UrlKey: 'distribution',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Distribution',
            ShortcutUrlKey: 'distribution',
            ShortcutBitmask: 2,
            FilterGroup: 'industry'
        },
        'finance': {
            FilterID: 4,
            LocKey: 'Filter_FinancialServices',
            Title: 'Financial Services',
            LongTitle: 'Financial Services',
            UrlKey: 'finance',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'FinancialServices',
            ShortcutUrlKey: 'finance',
            ShortcutBitmask: 4,
            FilterGroup: 'industry'
        },
        'government': {
            FilterID: 8,
            LocKey: 'Filter_Government',
            Title: 'Government',
            LongTitle: 'Government',
            UrlKey: 'government',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Government',
            ShortcutUrlKey: 'government',
            ShortcutBitmask: 8,
            FilterGroup: 'industry'
        },
        'healthcare': {
            FilterID: 16,
            LocKey: 'Filter_HealthcareLifesciences',
            Title: 'Healthcare + Life sciences',
            LongTitle: 'Healthcare + Life sciences',
            UrlKey: 'healthcare',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'HealthCareandLifeSciences',
            ShortcutUrlKey: 'healthcare',
            ShortcutBitmask: 16,
            FilterGroup: 'industry'
        },
        'manufacturing': {
            FilterID: 32,
            LocKey: 'Filter_Manufacturing',
            Title: 'Manufacturing',
            LongTitle: 'Manufacturing',
            UrlKey: 'manufacturing',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Manufacturing',
            ShortcutUrlKey: 'manufacturing',
            ShortcutBitmask: 32,
            FilterGroup: 'industry'
        },
        'professional-services': {
            FilterID: 64,
            LocKey: 'Filter_Professionalservices',
            Title: 'Professional services',
            LongTitle: 'Professional services',
            UrlKey: 'professional-services',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'ProfessionalServices',
            ShortcutUrlKey: 'professional-services',
            ShortcutBitmask: 64,
            FilterGroup: 'industry'
        },
        'retail': {
            FilterID: 128,
            LocKey: 'Filter_RetailConsumergoods',
            Title: 'Retail + Consumer goods',
            LongTitle: 'Retail + Consumer goods',
            UrlKey: 'retail',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'RetailandConsumerGoods',
            ShortcutUrlKey: 'retail',
            ShortcutBitmask: 128,
            FilterGroup: 'industry'
        },
        'education': {
            FilterID: 256,
            LocKey: 'Filter_Education',
            Title: 'Education',
            LongTitle: 'Education',
            UrlKey: 'education',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Education',
            ShortcutUrlKey: 'education',
            ShortcutBitmask: 256,
            FilterGroup: 'industry'
        }
    },
    categories: {
        'analytics': {
            FilterID: 1,
            LocKey: 'Filter_Analytics',
            Title: 'Analytics',
            LongTitle: 'Analytics',
            UrlKey: 'analytics',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Analytics',
            ShortcutUrlKey: 'analytics',
            ShortcutBitmask: 1,
            FilterGroup: 'category'
        },
        'artifical-intelligence': {
            FilterID: 1024,
            LocKey: 'Filter_ArtificialIntelligence',
            Title: 'Artificial Intelligence',
            LongTitle: 'Artificial Intelligence',
            UrlKey: 'artifical-intelligence',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'ArtificialIntelligence',
            ShortcutUrlKey: 'artifical-intelligence',
            ShortcutBitmask: 1024,
            FilterGroup: 'category'
        },
        'collaboration': {
            FilterID: 2,
            LocKey: 'Filter_Collaboration',
            Title: 'Collaboration',
            LongTitle: 'Collaboration',
            UrlKey: 'collaboration',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Collaboration',
            ShortcutUrlKey: 'collaboration',
            ShortcutBitmask: 2,
            FilterGroup: 'category'
        },
        'customer-service': {
            FilterID: 4,
            LocKey: 'Filter_Customerservice',
            Title: 'Customer service',
            LongTitle: 'Customer service',
            UrlKey: 'customer-service',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'CustomerService',
            ShortcutUrlKey: 'customer-service',
            ShortcutBitmask: 4,
            FilterGroup: 'category'
        },
        'finance': {
            FilterID: 8,
            LocKey: 'Filter_Finance',
            Title: 'Finance',
            LongTitle: 'Finance',
            UrlKey: 'finance',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Finance',
            ShortcutUrlKey: 'finance',
            ShortcutBitmask: 8,
            FilterGroup: 'category'
        },
        'human-resources': {
            FilterID: 16,
            LocKey: 'Filter_Humanresources',
            Title: 'Human resources',
            LongTitle: 'Human resources',
            UrlKey: 'human-resources',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'HumanResources',
            ShortcutUrlKey: 'human-resources',
            ShortcutBitmask: 16,
            FilterGroup: 'category'
        },
        'it-admin': {
            FilterID: 32,
            LocKey: 'Filter_ITadministration',
            Title: 'IT + administration',
            LongTitle: 'IT + administration',
            UrlKey: 'it-admin',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'ITandAdministration',
            ShortcutUrlKey: 'it-admin',
            ShortcutBitmask: 32,
            FilterGroup: 'category'
        },
        'marketing': {
            FilterID: 64,
            LocKey: 'Filter_Marketing',
            Title: 'Marketing',
            LongTitle: 'Marketing',
            UrlKey: 'marketing',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Marketing',
            ShortcutUrlKey: 'marketing',
            ShortcutBitmask: 64,
            FilterGroup: 'category'
        },
        'operations': {
            FilterID: 128,
            LocKey: 'Filter_Operationssupplychain',
            Title: 'Operations + supply chain',
            LongTitle: 'Operations + supply chain',
            UrlKey: 'operations',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'OperationsSupplyChain',
            ShortcutUrlKey: 'operations',
            ShortcutBitmask: 128,
            FilterGroup: 'category'
        },
        'productivity': {
            FilterID: 256,
            LocKey: 'Filter_Productivity',
            Title: 'Productivity',
            LongTitle: 'Productivity',
            UrlKey: 'productivity',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Productivity',
            ShortcutUrlKey: 'productivity',
            ShortcutBitmask: 256,
            FilterGroup: 'category'
        },
        'sales': {
            FilterID: 512,
            LocKey: 'Filter_Sales',
            Title: 'Sales',
            LongTitle: 'Sales',
            UrlKey: 'sales',
            ShortcutFilters: null,
            IsChildFilter: false,
            DisplayOnHome: true,
            BackendKey: 'Sales',
            ShortcutUrlKey: 'sales',
            ShortcutBitmask: 512,
            FilterGroup: 'category'
        }
    }
};

export const ProductIgnoreList = {
    'dynamics-ax': false,
    'dynamics-crm': false,
    'dynamics-nav': false,
    'project-madeira': false,
    'power-bi': false,
    'office': false,
    'azure': false
};