// This is a generated file during the build. Please do not change anything in this file.
// If you want to change anything in this file, please contact the project owners

/* tslint:disable:max-line-length */

export interface IDataValues {
    urlKey: string;
    locKey: string;
    title: string;
    backendKey: string;
    targetProperty?: string;
    targetMask?: any;
    subCategoryDataMapping?: any;
    count?: number;
    isActive?: boolean;
    checkFilter?: boolean;
}

export interface IDataCollection {
    [dataKey: string]: IDataValues;
}

export interface IDataMap {
    category: IDataCollection;
    globalFilter1: IDataCollection;
    globalFilter2: IDataCollection;
    globalFilter3: IDataCollection;
    globalFilter4: IDataCollection;
}

export const BackendKeyToLocKey = {
    'home': 'MAC_Loc_apps',
    'whatsNew': 'MAC_Loc_whats-new',
    'web': 'MAC_Loc_web',
    'virtualMachines': 'MAC_Loc_virtual-machines',
    'Compute_MP': 'MAC_Loc_compute',
    'recommended': 'MAC_Loc_featured',
    'virtualMachineImages': 'MAC_Loc_virtual-machine-images',
    'operatingSystems': 'MAC_Loc_operating-systems',
    'solutionTemplates': 'MAC_Loc_solution-templates',
    'applicationInfrastructure': 'MAC_Loc_application-infrastructure',
    'windowsBased': 'MAC_Loc_windows-based',
    'linuxBased': 'MAC_Loc_linux-based',
    'bizApps': 'MAC_Loc_business-applications',
    'Networking_MP': 'MAC_Loc_networking',
    'appliances': 'MAC_Loc_appliances',
    'Storage_MP': 'MAC_Loc_storage',
    'backupAndRecovery': 'MAC_Loc_backup-and-recovery',
    'dataMigration': 'MAC_Loc_data-migration',
    'hybridStorageAndGlobalDataAccess': 'MAC_Loc_enterprise-hybrid-storage',
    'WebAndMobile_MP': 'MAC_Loc_web-mobile',
    'web_recommended': 'MAC_Loc_web-apps',
    'mobile_recommended': 'MAC_Loc_mobile-apps',
    'logicapp_recommended': 'MAC_Loc_logic-apps',
    'mediaServices': 'MAC_Loc_media-services',
    'blogsCMS': 'MAC_Loc_blogs-cmss',
    'starterSites': 'MAC_Loc_starter-web-apps',
    'appFrameworks': 'MAC_Loc_web-app-frameworks',
    'eCommerce': 'MAC_Loc_ecommerce',
    'addons': 'MAC_Loc_addons',
    'Databases_MP': 'MAC_Loc_databases',
    'databaseServers': 'MAC_Loc_database-servers',
    'noSQL': 'MAC_Loc_nosql-databases',
    'azureCertified': 'MAC_Loc_databases-all',
    'IntelligenceAndAnalytics_MP': 'MAC_Loc_intelligence-analytics',
    'analytics': 'MAC_Loc_data-analytics',
    'dataInsights': 'MAC_Loc_data-insights',
    'InternetOfThings_MP': 'MAC_Loc_internet-of-things',
    'storage': 'MAC_Loc_storage',
    'connectivity': 'MAC_Loc_connectivity',
    'pcs': 'MAC_Loc_iot-pcs',
    'EnterpriseIntegration_MP': 'MAC_Loc_enterprise-integration',
    'biztalk': 'MAC_Loc_biztalk',
    'messaging': 'MAC_Loc_messaging',
    'SecurityIdentity_MP': 'MAC_Loc_security-identity',
    'SecurityProtection': 'MAC_Loc_security-protection',
    'Identity': 'MAC_Loc_identity-access-mgmt',
    'Compliance': 'MAC_Loc_compliance',
    'DeveloperTools_MP': 'MAC_Loc_developer-tools',
    'developerTools': 'MAC_Loc_tools',
    'devops': 'MAC_Loc_devops',
    'scripts': 'MAC_Loc_scripts',
    'MonitoringAndManagement_MP': 'MAC_Loc_monitoring-management',
    'monitoringAndDiagnostics': 'MAC_Loc_monitoring-diagnostics',
    'managementSolutions': 'MAC_Loc_management-solutions',
    'AddOns_MP': 'MAC_Loc_addons',
    'devServicesAzureCertified': 'MAC_Loc_addons-all',
    'Containers_MP': 'MAC_Loc_containers',
    'GetStartedWithContainers_MP': 'MAC_Loc_platform',
    'WebDH': 'MAC_Loc_web',
    'Blockchain_MP': 'MAC_Loc_blockchain',
    'BlockChainDistributedLedgers_MP': 'MAC_Loc_distributed-ledgers',
    'BlockchainTools_MP': 'MAC_Loc_tools',
    'AADapps': 'MAC_Loc_azure-active-directory-apps',
    'Featured': 'MAC_Loc_featured',
    'BusinessManagement': 'MAC_Loc_business-management',
    'Collaboration': 'MAC_Loc_collaboration',
    'Construction': 'MAC_Loc_construction',
    'Consumer': 'MAC_Loc_consumer',
    'ContentManagement': 'MAC_Loc_content-management',
    'CRM': 'MAC_Loc_crm',
    'DataServices': 'MAC_Loc_data-services',
    'DeveloperServices': 'MAC_Loc_developer-services',
    'ECommerce': 'MAC_Loc_ecommerce',
    'Education': 'MAC_Loc_education',
    'ERP': 'MAC_Loc_erp',
    'Finance': 'MAC_Loc_finance',
    'Health': 'MAC_Loc_health',
    'HR': 'MAC_Loc_human-resources',
    'ITInfra': 'MAC_Loc_it-infrastructure',
    'Mail': 'MAC_Loc_mail',
    'Marketing': 'MAC_Loc_marketing',
    'Media': 'MAC_Loc_media',
    'Productivity': 'MAC_Loc_productivity',
    'ProjectMgmt': 'MAC_Loc_project-management',
    'Security': 'MAC_Loc_security',
    'Social': 'MAC_Loc_social',
    'SupplyMgmt': 'MAC_Loc_supply-management',
    'Telecommunications': 'MAC_Loc_telecommunications',
    'Tools': 'MAC_Loc_tools',
    'Travel': 'MAC_Loc_travel',
    'WebDesign': 'MAC_Loc_web-design-hosting',
    'Testdrive_MP': 'MAC_Loc_test-drives',
    'security': 'MAC_Loc_firewalls-and-security',
    'dataanalytics': 'MAC_Loc_big-data-analytics',
    'storage_TD': 'MAC_Loc_storage-infrastrcture',
    'mcsolution': 'MAC_Loc_mcsolution',
    'mcpartnersolution': 'MAC_Loc_mcpartnersolution',
    'integrated_industry_solution': 'MAC_Loc_integrated-industry-solution',
    'manufacturing_solution': 'MAC_Loc_manufacturing-solution',
    'public_service_solution': 'MAC_Loc_public-service-solution',
    'retailing_solution': 'MAC_Loc_retailing-solution',
    'tourism_solution': 'MAC_Loc_tourism-solution',
    'estate_solution': 'MAC_Loc_estate-solution',
    'professional_services_solution': 'MAC_Loc_professional-services-solution',
    'internet_solution': 'MAC_Loc_internet-solution',
    'financial_solution': 'MAC_Loc_financial-solution',
    'media_solution': 'MAC_Loc_media-solution',
    'car_solution': 'MAC_Loc_car-solution',
    'it_service_solution': 'MAC_Loc_it-service-solution',
    'trials': 'MAC_Loc_trials',
    'testDrive': 'Test_Drive',
    'freeTrial': 'MAC_Loc_free-trial',
    'pricingModel': 'MAC_Loc_pricing-model',
    'free': 'Pricing_Free',
    'payAsYouGo': 'MAC_Loc_pay-as-you-go',
    'byol': 'MAC_Loc_byol',
    'operatingSystem': 'MAC_Loc_operating-system',
    'windows': 'MAC_Loc_windows',
    'linux': 'MAC_Loc_linux',
    'publisher': 'App_Publisher',
    'partners': 'Partner_BackButton',
    'microsoft': 'MAC_Loc_microsoft'
};

export const BackendKeyToURLKey = {
    'home': 'apps',
    'whatsNew': 'whats-new',
    'web': 'web',
    'virtualMachines': 'virtual-machines',
    'Compute_MP': 'compute',
    'recommended': 'featured',
    'virtualMachineImages': 'virtual-machine-images',
    'operatingSystems': 'operating-systems',
    'solutionTemplates': 'solution-templates',
    'applicationInfrastructure': 'application-infrastructure',
    'windowsBased': 'windows-based',
    'linuxBased': 'linux-based',
    'bizApps': 'business-applications',
    'Networking_MP': 'networking',
    'appliances': 'appliances',
    'Storage_MP': 'storage',
    'backupAndRecovery': 'backup-and-recovery',
    'dataMigration': 'data-migration',
    'hybridStorageAndGlobalDataAccess': 'enterprise-hybrid-storage',
    'WebAndMobile_MP': 'web-mobile',
    'web_recommended': 'web-apps',
    'mobile_recommended': 'mobile-apps',
    'logicapp_recommended': 'logicapp-apps',
    'mediaServices': 'media-services',
    'blogsCMS': 'blogs-cmss',
    'starterSites': 'starter-web-apps',
    'appFrameworks': 'web-app-frameworks',
    'eCommerce': 'ecommerce',
    'addons': 'addons',
    'Databases_MP': 'databases',
    'databaseServers': 'database-servers',
    'noSQL': 'nosql-databases',
    'azureCertified': 'databases-all',
    'IntelligenceAndAnalytics_MP': 'intelligence-analytics',
    'analytics': 'data-analytics',
    'dataInsights': 'data-insights',
    'InternetOfThings_MP': 'internet-of-things',
    'storage': 'storage',
    'connectivity': 'connectivity',
    'pcs': 'pcs',
    'EnterpriseIntegration_MP': 'enterprise-integration',
    'biztalk': 'biztalk',
    'messaging': 'messaging',
    'SecurityIdentity_MP': 'security-identity',
    'SecurityProtection': 'security-protection',
    'Identity': 'identity-access-mgmt',
    'Compliance': 'compliance',
    'DeveloperTools_MP': 'developer-tools',
    'developerTools': 'tools',
    'devops': 'devops',
    'scripts': 'scripts',
    'MonitoringAndManagement_MP': 'monitoring-management',
    'monitoringAndDiagnostics': 'monitoring-diagnostics',
    'managementSolutions': 'management-solutions',
    'AddOns_MP': 'addons',
    'devServicesAzureCertified': 'addons-all',
    'Containers_MP': 'containers',
    'GetStartedWithContainers_MP': 'platform',
    'WebDH': 'web',
    'Blockchain_MP': 'blockchain',
    'BlockChainDistributedLedgers_MP': 'distributed-ledgers',
    'BlockchainTools_MP': 'tools',
    'AADapps': 'azure-active-directory-apps',
    'Featured': 'featured',
    'BusinessManagement': 'business-management',
    'Collaboration': 'collaboration',
    'Construction': 'construction',
    'Consumer': 'consumer',
    'ContentManagement': 'content-management',
    'CRM': 'crm',
    'DataServices': 'data-services',
    'DeveloperServices': 'developer-services',
    'ECommerce': 'ecommerce',
    'Education': 'education',
    'ERP': 'erp',
    'Finance': 'finance',
    'Health': 'health',
    'HR': 'human-resources',
    'ITInfra': 'it-infrastructure',
    'Mail': 'mail',
    'Marketing': 'marketing',
    'Media': 'media',
    'Productivity': 'productivity',
    'ProjectMgmt': 'project-management',
    'Security': 'security',
    'Social': 'social',
    'SupplyMgmt': 'supply-management',
    'Telecommunications': 'telecommunications',
    'Tools': 'tools',
    'Travel': 'travel',
    'WebDesign': 'web-design-hosting',
    'Testdrive_MP': 'test-drives',
    'security': 'firewalls-and-security',
    'dataanalytics': 'big-data-analytics',
    'storage_TD': 'storage-infrastrcture',
    'mcsolution': 'solutions',
    'mcpartnersolution': 'partner-solutions',
    'integrated_industry_solution': 'integrated-industry-solution',
    'manufacturing_solution': 'manufacturing-solution',
    'public_service_solution': 'public-service-solution',
    'retailing_solution': 'retailing-solution',
    'tourism_solution': 'tourism-solution',
    'estate_solution': 'estate-solution',
    'professional_services_solution': 'professional-services-solution',
    'internet_solution': 'internet-solution',
    'financial_solution': 'financial-solution',
    'media_solution': 'media-solution',
    'car_solution': 'car-solution',
    'it_service_solution': 'it-service-solution',
    'trials': 'trials',
    'testDrive': 'test-drive',
    'freeTrial': 'free-trial',
    'pricingModel': 'pricing-model',
    'free': 'pricing-free',
    'payAsYouGo': 'pay-as-you-go',
    'byol': 'byol',
    'operatingSystem': 'operating-system',
    'windows': 'windows',
    'linux': 'linux',
    'publisher': 'publisher',
    'partners': 'partners',
    'microsoft': 'microsoft'
};

export const LocKeyToURLKey = {
    'MAC_Loc_apps': 'apps',
    'MAC_Loc_whats-new': 'whats-new',
    'MAC_Loc_web': 'web',
    'MAC_Loc_virtual-machines': 'virtual-machines',
    'MAC_Loc_compute': 'compute',
    'MAC_Loc_featured': 'featured',
    'MAC_Loc_virtual-machine-images': 'virtual-machine-images',
    'MAC_Loc_operating-systems': 'operating-systems',
    'MAC_Loc_solution-templates': 'solution-templates',
    'MAC_Loc_application-infrastructure': 'application-infrastructure',
    'MAC_Loc_windows-based': 'windows-based',
    'MAC_Loc_linux-based': 'linux-based',
    'MAC_Loc_business-applications': 'business-applications',
    'MAC_Loc_networking': 'networking',
    'MAC_Loc_appliances': 'appliances',
    'MAC_Loc_storage': 'storage',
    'MAC_Loc_backup-and-recovery': 'backup-and-recovery',
    'MAC_Loc_data-migration': 'data-migration',
    'MAC_Loc_enterprise-hybrid-storage': 'enterprise-hybrid-storage',
    'MAC_Loc_web-mobile': 'web-mobile',
    'MAC_Loc_web-apps': 'web-apps',
    'MAC_Loc_mobile-apps': 'mobile-apps',
    'MAC_Loc_logic-apps': 'logicapp-apps',
    'MAC_Loc_media-services': 'media-services',
    'MAC_Loc_blogs-cmss': 'blogs-cmss',
    'MAC_Loc_starter-web-apps': 'starter-web-apps',
    'MAC_Loc_web-app-frameworks': 'web-app-frameworks',
    'MAC_Loc_ecommerce': 'ecommerce',
    'MAC_Loc_addons': 'addons',
    'MAC_Loc_databases': 'databases',
    'MAC_Loc_database-servers': 'database-servers',
    'MAC_Loc_nosql-databases': 'nosql-databases',
    'MAC_Loc_databases-all': 'databases-all',
    'MAC_Loc_intelligence-analytics': 'intelligence-analytics',
    'MAC_Loc_data-analytics': 'data-analytics',
    'MAC_Loc_data-insights': 'data-insights',
    'MAC_Loc_internet-of-things': 'internet-of-things',
    'MAC_Loc_connectivity': 'connectivity',
    'MAC_Loc_iot-pcs': 'pcs',
    'MAC_Loc_enterprise-integration': 'enterprise-integration',
    'MAC_Loc_biztalk': 'biztalk',
    'MAC_Loc_messaging': 'messaging',
    'MAC_Loc_security-identity': 'security-identity',
    'MAC_Loc_security-protection': 'security-protection',
    'MAC_Loc_identity-access-mgmt': 'identity-access-mgmt',
    'MAC_Loc_compliance': 'compliance',
    'MAC_Loc_developer-tools': 'developer-tools',
    'MAC_Loc_tools': 'tools',
    'MAC_Loc_devops': 'devops',
    'MAC_Loc_scripts': 'scripts',
    'MAC_Loc_monitoring-management': 'monitoring-management',
    'MAC_Loc_monitoring-diagnostics': 'monitoring-diagnostics',
    'MAC_Loc_management-solutions': 'management-solutions',
    'MAC_Loc_recommended': 'recommended',
    'MAC_Loc_addons-all': 'addons-all',
    'MAC_Loc_containers': 'containers',
    'MAC_Loc_platform': 'platform',
    'MAC_Loc_blockchain': 'blockchain',
    'MAC_Loc_distributed-ledgers': 'distributed-ledgers',
    'MAC_Loc_azure-active-directory-apps': 'azure-active-directory-apps',
    'MAC_Loc_business-management': 'business-management',
    'MAC_Loc_collaboration': 'collaboration',
    'MAC_Loc_construction': 'construction',
    'MAC_Loc_consumer': 'consumer',
    'MAC_Loc_content-management': 'content-management',
    'MAC_Loc_crm': 'crm',
    'MAC_Loc_data-services': 'data-services',
    'MAC_Loc_developer-services': 'developer-services',
    'MAC_Loc_education': 'education',
    'MAC_Loc_erp': 'erp',
    'MAC_Loc_finance': 'finance',
    'MAC_Loc_health': 'health',
    'MAC_Loc_human-resources': 'human-resources',
    'MAC_Loc_it-infrastructure': 'it-infrastructure',
    'MAC_Loc_mail': 'mail',
    'MAC_Loc_marketing': 'marketing',
    'MAC_Loc_media': 'media',
    'MAC_Loc_productivity': 'productivity',
    'MAC_Loc_project-management': 'project-management',
    'MAC_Loc_security': 'security',
    'MAC_Loc_social': 'social',
    'MAC_Loc_supply-management': 'supply-management',
    'MAC_Loc_telecommunications': 'telecommunications',
    'MAC_Loc_travel': 'travel',
    'MAC_Loc_web-design-hosting': 'web-design-hosting',
    'MAC_Loc_test-drives': 'test-drives',
    'MAC_Loc_firewalls-and-security': 'firewalls-and-security',
    'MAC_Loc_big-data-analytics': 'big-data-analytics',
    'MAC_Loc_storage-infrastrcture': 'storage-infrastrcture',
    'MAC_Loc_mcsolution': 'solutions',
    'MAC_Loc_featured-solution': 'featured',
    'MAC_Loc_ecommerce-solution': 'ecommerce-solution',
    'MAC_Loc_mcpartnersolution': 'partner-solutions',
    'MAC_Loc_featured-partner-solution': 'featured',
    'MAC_Loc_integrated-industry-solution': 'integrated-industry-solution',
    'MAC_Loc_manufacturing-solution': 'manufacturing-solution',
    'MAC_Loc_public-service-solution': 'public-service-solution',
    'MAC_Loc_retailing-solution': 'retailing-solution',
    'MAC_Loc_tourism-solution': 'tourism-solution',
    'MAC_Loc_estate-solution': 'estate-solution',
    'MAC_Loc_professional-services-solution': 'professional-services-solution',
    'MAC_Loc_internet-solution': 'internet-solution',
    'MAC_Loc_financial-solution': 'financial-solution',
    'MAC_Loc_media-solution': 'media-solution',
    'MAC_Loc_car-solution': 'car-solution',
    'MAC_Loc_it-service-solution': 'it-service-solution',
    'MAC_Loc_trials': 'trials',
    'Test_Drive': 'test-drive',
    'MAC_Loc_free-trial': 'free-trial',
    'MAC_Loc_pricing-model': 'pricing-model',
    'Pricing_Free': 'pricing-free',
    'MAC_Loc_pay-as-you-go': 'pay-as-you-go',
    'MAC_Loc_byol': 'byol',
    'MAC_Loc_operating-system': 'operating-system',
    'MAC_Loc_windows': 'windows',
    'MAC_Loc_linux': 'linux',
    'App_Publisher': 'publisher',
    'Partner_BackButton': 'partners',
    'MAC_Loc_microsoft': 'microsoft'
};

export const SubCategoryBitmask = {
    'home_whatsNew': {
        property: 'category_mask_1',
        mask: 1
    },
    'home_web': {
        property: 'category_mask_1',
        mask: 2
    },
    'home_virtualMachines': {
        property: 'category_mask_1',
        mask: 4
    },
    'Compute_MP_recommended': {
        property: 'category_mask_1',
        mask: 8
    },
    'Compute_MP_virtualMachineImages': {
        property: 'category_mask_1',
        mask: 16
    },
    'Compute_MP_whatsNew': {
        property: 'category_mask_1',
        mask: 32
    },
    'Compute_MP_operatingSystems': {
        property: 'category_mask_1',
        mask: 64
    },
    'Compute_MP_solutionTemplates': {
        property: 'category_mask_1',
        mask: 128
    },
    'Compute_MP_applicationInfrastructure': {
        property: 'category_mask_1',
        mask: 256
    },
    'Compute_MP_windowsBased': {
        property: 'category_mask_1',
        mask: 512
    },
    'Compute_MP_linuxBased': {
        property: 'category_mask_1',
        mask: 1024
    },
    'Compute_MP_bizApps': {
        property: 'category_mask_1',
        mask: 2048
    },
    'Networking_MP_recommended': {
        property: 'category_mask_1',
        mask: 4096
    },
    'Networking_MP_whatsNew': {
        property: 'category_mask_1',
        mask: 8192
    },
    'Networking_MP_appliances': {
        property: 'category_mask_1',
        mask: 16384
    },
    'Storage_MP_recommended': {
        property: 'category_mask_1',
        mask: 32768
    },
    'Storage_MP_backupAndRecovery': {
        property: 'category_mask_1',
        mask: 65536
    },
    'Storage_MP_dataMigration': {
        property: 'category_mask_1',
        mask: 131072
    },
    'Storage_MP_hybridStorageAndGlobalDataAccess': {
        property: 'category_mask_1',
        mask: 262144
    },
    'WebAndMobile_MP_web_recommended': {
        property: 'category_mask_1',
        mask: 524288
    },
    'WebAndMobile_MP_mobile_recommended': {
        property: 'category_mask_1',
        mask: 1048576
    },
    'WebAndMobile_MP_logicapp_recommended': {
        property: 'category_mask_1',
        mask: 2097152
    },
    'WebAndMobile_MP_mediaServices': {
        property: 'category_mask_1',
        mask: 4194304
    },
    'WebAndMobile_MP_blogsCMS': {
        property: 'category_mask_1',
        mask: 8388608
    },
    'WebAndMobile_MP_starterSites': {
        property: 'category_mask_1',
        mask: 16777216
    },
    'WebAndMobile_MP_appFrameworks': {
        property: 'category_mask_1',
        mask: 33554432
    },
    'WebAndMobile_MP_eCommerce': {
        property: 'category_mask_1',
        mask: 67108864
    },
    'WebAndMobile_MP_addons': {
        property: 'category_mask_1',
        mask: 134217728
    },
    'Databases_MP_recommended': {
        property: 'category_mask_1',
        mask: 268435456
    },
    'Databases_MP_databaseServers': {
        property: 'category_mask_1',
        mask: 536870912
    },
    'Databases_MP_noSQL': {
        property: 'category_mask_1',
        mask: 1073741824
    },
    'Databases_MP_azureCertified': {
        property: 'category_mask_2',
        mask: 1
    },
    'IntelligenceAndAnalytics_MP_whatsNew': {
        property: 'category_mask_2',
        mask: 2
    },
    'IntelligenceAndAnalytics_MP_analytics': {
        property: 'category_mask_2',
        mask: 4
    },
    'IntelligenceAndAnalytics_MP_dataInsights': {
        property: 'category_mask_2',
        mask: 8
    },
    'InternetOfThings_MP_analytics': {
        property: 'category_mask_2',
        mask: 16
    },
    'InternetOfThings_MP_storage': {
        property: 'category_mask_2',
        mask: 32
    },
    'InternetOfThings_MP_connectivity': {
        property: 'category_mask_2',
        mask: 64
    },
    'InternetOfThings_MP_pcs': {
        property: 'category_mask_2',
        mask: 128
    },
    'EnterpriseIntegration_MP_recommended': {
        property: 'category_mask_2',
        mask: 256
    },
    'EnterpriseIntegration_MP_biztalk': {
        property: 'category_mask_2',
        mask: 512
    },
    'EnterpriseIntegration_MP_messaging': {
        property: 'category_mask_2',
        mask: 1024
    },
    'SecurityIdentity_MP_recommended': {
        property: 'category_mask_2',
        mask: 2048
    },
    'SecurityIdentity_MP_SecurityProtection': {
        property: 'category_mask_2',
        mask: 4096
    },
    'SecurityIdentity_MP_Identity': {
        property: 'category_mask_2',
        mask: 8192
    },
    'SecurityIdentity_MP_Compliance': {
        property: 'category_mask_2',
        mask: 16384
    },
    'DeveloperTools_MP_developerTools': {
        property: 'category_mask_2',
        mask: 32768
    },
    'DeveloperTools_MP_devops': {
        property: 'category_mask_2',
        mask: 65536
    },
    'DeveloperTools_MP_scripts': {
        property: 'category_mask_2',
        mask: 131072
    },
    'MonitoringAndManagement_MP_recommended': {
        property: 'category_mask_2',
        mask: 262144
    },
    'MonitoringAndManagement_MP_monitoringAndDiagnostics': {
        property: 'category_mask_2',
        mask: 524288
    },
    'MonitoringAndManagement_MP_managementSolutions': {
        property: 'category_mask_2',
        mask: 1048576
    },
    'MonitoringAndManagement_MP_bizApps': {
        property: 'category_mask_2',
        mask: 2097152
    },
    'AddOns_MP_recommended': {
        property: 'category_mask_2',
        mask: 4194304
    },
    'AddOns_MP_devServicesAzureCertified': {
        property: 'category_mask_2',
        mask: 8388608
    },
    'Containers_MP_GetStartedWithContainers_MP': {
        property: 'category_mask_2',
        mask: 16777216
    },
    'Containers_MP_WebDH': {
        property: 'category_mask_2',
        mask: 33554432
    },
    'Blockchain_MP_BlockChainDistributedLedgers_MP': {
        property: 'category_mask_2',
        mask: 67108864
    },
    'Blockchain_MP_BlockchainTools_MP': {
        property: 'category_mask_2',
        mask: 134217728
    },
    'AADapps_Featured': {
        property: 'category_mask_2',
        mask: 268435456
    },
    'AADapps_BusinessManagement': {
        property: 'category_mask_2',
        mask: 536870912
    },
    'AADapps_Collaboration': {
        property: 'category_mask_2',
        mask: 1073741824
    },
    'AADapps_Construction': {
        property: 'category_mask_3',
        mask: 1
    },
    'AADapps_Consumer': {
        property: 'category_mask_3',
        mask: 2
    },
    'AADapps_ContentManagement': {
        property: 'category_mask_3',
        mask: 4
    },
    'AADapps_CRM': {
        property: 'category_mask_3',
        mask: 8
    },
    'AADapps_DataServices': {
        property: 'category_mask_3',
        mask: 16
    },
    'AADapps_DeveloperServices': {
        property: 'category_mask_3',
        mask: 32
    },
    'AADapps_ECommerce': {
        property: 'category_mask_3',
        mask: 64
    },
    'AADapps_Education': {
        property: 'category_mask_3',
        mask: 128
    },
    'AADapps_ERP': {
        property: 'category_mask_3',
        mask: 256
    },
    'AADapps_Finance': {
        property: 'category_mask_3',
        mask: 512
    },
    'AADapps_Health': {
        property: 'category_mask_3',
        mask: 1024
    },
    'AADapps_HR': {
        property: 'category_mask_3',
        mask: 2048
    },
    'AADapps_ITInfra': {
        property: 'category_mask_3',
        mask: 4096
    },
    'AADapps_Mail': {
        property: 'category_mask_3',
        mask: 8192
    },
    'AADapps_Marketing': {
        property: 'category_mask_3',
        mask: 16384
    },
    'AADapps_Media': {
        property: 'category_mask_3',
        mask: 32768
    },
    'AADapps_Productivity': {
        property: 'category_mask_3',
        mask: 65536
    },
    'AADapps_ProjectMgmt': {
        property: 'category_mask_3',
        mask: 131072
    },
    'AADapps_Security': {
        property: 'category_mask_3',
        mask: 262144
    },
    'AADapps_Social': {
        property: 'category_mask_3',
        mask: 524288
    },
    'AADapps_SupplyMgmt': {
        property: 'category_mask_3',
        mask: 1048576
    },
    'AADapps_Telecommunications': {
        property: 'category_mask_3',
        mask: 2097152
    },
    'AADapps_Tools': {
        property: 'category_mask_3',
        mask: 4194304
    },
    'AADapps_Travel': {
        property: 'category_mask_3',
        mask: 8388608
    },
    'AADapps_WebDesign': {
        property: 'category_mask_3',
        mask: 16777216
    },
    'Testdrive_MP_security': {
        property: 'category_mask_3',
        mask: 33554432
    },
    'Testdrive_MP_dataanalytics': {
        property: 'category_mask_3',
        mask: 67108864
    },
    'Testdrive_MP_devops': {
        property: 'category_mask_3',
        mask: 134217728
    },
    'Testdrive_MP_storage_TD': {
        property: 'category_mask_3',
        mask: 268435456
    },
    'mcsolution_recommended': {
        property: 'category_mask_3',
        mask: 536870912
    },
    'mcsolution_eCommerce': {
        property: 'category_mask_3',
        mask: 1073741824
    },
    'mcsolution_InternetOfThings_MP': {
        property: 'category_mask_4',
        mask: 1
    },
    'mcpartnersolution_recommended': {
        property: 'category_mask_4',
        mask: 2
    },
    'mcpartnersolution_integrated_industry_solution': {
        property: 'category_mask_4',
        mask: 4
    },
    'mcpartnersolution_manufacturing_solution': {
        property: 'category_mask_4',
        mask: 8
    },
    'mcpartnersolution_public_service_solution': {
        property: 'category_mask_4',
        mask: 16
    },
    'mcpartnersolution_retailing_solution': {
        property: 'category_mask_4',
        mask: 32
    },
    'mcpartnersolution_tourism_solution': {
        property: 'category_mask_4',
        mask: 64
    },
    'mcpartnersolution_estate_solution': {
        property: 'category_mask_4',
        mask: 128
    },
    'mcpartnersolution_professional_services_solution': {
        property: 'category_mask_4',
        mask: 256
    },
    'mcpartnersolution_internet_solution': {
        property: 'category_mask_4',
        mask: 512
    },
    'mcpartnersolution_financial_solution': {
        property: 'category_mask_4',
        mask: 1024
    },
    'mcpartnersolution_media_solution': {
        property: 'category_mask_4',
        mask: 2048
    },
    'mcpartnersolution_car_solution': {
        property: 'category_mask_4',
        mask: 4096
    },
    'mcpartnersolution_it_service_solution': {
        property: 'category_mask_4',
        mask: 8192
    },
    'trials_testDrive': {
        property: 'globalFilter1_mask_1',
        mask: 1
    },
    'trials_freeTrial': {
        property: 'globalFilter1_mask_1',
        mask: 2
    },
    'pricingModel_free': {
        property: 'globalFilter2_mask_1',
        mask: 1
    },
    'pricingModel_payAsYouGo': {
        property: 'globalFilter2_mask_1',
        mask: 2
    },
    'pricingModel_byol': {
        property: 'globalFilter2_mask_1',
        mask: 4
    },
    'operatingSystem_windows': {
        property: 'globalFilter3_mask_1',
        mask: 1
    },
    'operatingSystem_linux': {
        property: 'globalFilter3_mask_1',
        mask: 2
    },
    'publisher_partners': {
        property: 'globalFilter4_mask_1',
        mask: 1
    },
    'publisher_microsoft': {
        property: 'globalFilter4_mask_1',
        mask: 2
    }
};

export const CategoryTargetPropertyList = [
    'category_mask_1',
    'category_mask_2',
    'category_mask_3',
    'category_mask_4',
    'globalFilter1_mask_1',
    'globalFilter2_mask_1',
    'globalFilter3_mask_1',
    'globalFilter4_mask_1'
];

export const CategoryIgnoreList = [
    'apps'
];

export const DataMap: IDataMap = {
    category: {
        'apps': {
            urlKey: 'apps',
            locKey: 'MAC_Loc_apps',
            title: 'Apps',
            backendKey: 'home',
            subCategoryDataMapping: {
                'whats-new': {
                    urlKey: 'whats-new',
                    locKey: 'MAC_Loc_whats-new',
                    title: 'Whats new',
                    backendKey: 'whatsNew',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 1
                },
                'web': {
                    urlKey: 'web',
                    locKey: 'MAC_Loc_web',
                    title: 'Web',
                    backendKey: 'web',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 2
                },
                'virtual-machines': {
                    urlKey: 'virtual-machines',
                    locKey: 'MAC_Loc_virtual-machines',
                    title: 'Virtual Machines',
                    backendKey: 'virtualMachines',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 4
                }
            }
        },
        'compute': {
            urlKey: 'compute',
            locKey: 'MAC_Loc_compute',
            title: 'Compute',
            backendKey: 'Compute_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 8
                },
                'virtual-machine-images': {
                    urlKey: 'virtual-machine-images',
                    locKey: 'MAC_Loc_virtual-machine-images',
                    title: 'Virtual Machine Images',
                    backendKey: 'virtualMachineImages',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 16
                },
                'whats-new': {
                    urlKey: 'whats-new',
                    locKey: 'MAC_Loc_whats-new',
                    title: 'Whats new',
                    backendKey: 'whatsNew',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 32
                },
                'operating-systems': {
                    urlKey: 'operating-systems',
                    locKey: 'MAC_Loc_operating-systems',
                    title: 'Operating Systems',
                    backendKey: 'operatingSystems',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 64
                },
                'solution-templates': {
                    urlKey: 'solution-templates',
                    locKey: 'MAC_Loc_solution-templates',
                    title: 'Solution Templates',
                    backendKey: 'solutionTemplates',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 128
                },
                'application-infrastructure': {
                    urlKey: 'application-infrastructure',
                    locKey: 'MAC_Loc_application-infrastructure',
                    title: 'Application infrastructure',
                    backendKey: 'applicationInfrastructure',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 256
                },
                'windows-based': {
                    urlKey: 'windows-based',
                    locKey: 'MAC_Loc_windows-based',
                    title: 'Windows based',
                    backendKey: 'windowsBased',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 512
                },
                'linux-based': {
                    urlKey: 'linux-based',
                    locKey: 'MAC_Loc_linux-based',
                    title: 'Linux based',
                    backendKey: 'linuxBased',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 1024
                },
                'business-applications': {
                    urlKey: 'business-applications',
                    locKey: 'MAC_Loc_business-applications',
                    title: 'Business applications',
                    backendKey: 'bizApps',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 2048
                }
            }
        },
        'networking': {
            urlKey: 'networking',
            locKey: 'MAC_Loc_networking',
            title: 'Networking',
            backendKey: 'Networking_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 4096
                },
                'whats-new': {
                    urlKey: 'whats-new',
                    locKey: 'MAC_Loc_whats-new',
                    title: 'Whats new',
                    backendKey: 'whatsNew',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 8192
                },
                'appliances': {
                    urlKey: 'appliances',
                    locKey: 'MAC_Loc_appliances',
                    title: 'Appliances',
                    backendKey: 'appliances',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 16384
                }
            }
        },
        'storage': {
            urlKey: 'storage',
            locKey: 'MAC_Loc_storage',
            title: 'Storage',
            backendKey: 'Storage_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 32768
                },
                'backup-and-recovery': {
                    urlKey: 'backup-and-recovery',
                    locKey: 'MAC_Loc_backup-and-recovery',
                    title: 'Backup and Recovery',
                    backendKey: 'backupAndRecovery',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 65536
                },
                'data-migration': {
                    urlKey: 'data-migration',
                    locKey: 'MAC_Loc_data-migration',
                    title: 'Data migration',
                    backendKey: 'dataMigration',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 131072
                },
                'enterprise-hybrid-storage': {
                    urlKey: 'enterprise-hybrid-storage',
                    locKey: 'MAC_Loc_enterprise-hybrid-storage',
                    title: 'Enterprise hybrid storage',
                    backendKey: 'hybridStorageAndGlobalDataAccess',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 262144
                }
            }
        },
        'web-mobile': {
            urlKey: 'web-mobile',
            locKey: 'MAC_Loc_web-mobile',
            title: 'Web + Mobile',
            backendKey: 'WebAndMobile_MP',
            subCategoryDataMapping: {
                'web-apps': {
                    urlKey: 'web-apps',
                    locKey: 'MAC_Loc_web-apps',
                    title: 'Web Apps',
                    backendKey: 'web_recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 524288
                },
                'mobile-apps': {
                    urlKey: 'mobile-apps',
                    locKey: 'MAC_Loc_mobile-apps',
                    title: 'Mobile Apps',
                    backendKey: 'mobile_recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 1048576
                },
                'logic-apps': {
                    urlKey: 'logicapp-apps',
                    locKey: 'MAC_Loc_logic-apps',
                    title: 'Logic Apps',
                    backendKey: 'logicapp_recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 2097152
                },
                'media-services': {
                    urlKey: 'media-services',
                    locKey: 'MAC_Loc_media-services',
                    title: 'Media services',
                    backendKey: 'mediaServices',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 4194304
                },
                'blogs-cmss': {
                    urlKey: 'blogs-cmss',
                    locKey: 'MAC_Loc_blogs-cmss',
                    title: 'Blogs + CMSs',
                    backendKey: 'blogsCMS',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 8388608
                },
                'starter-web-apps': {
                    urlKey: 'starter-web-apps',
                    locKey: 'MAC_Loc_starter-web-apps',
                    title: 'Starter web apps',
                    backendKey: 'starterSites',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 16777216
                },
                'web-app-frameworks': {
                    urlKey: 'web-app-frameworks',
                    locKey: 'MAC_Loc_web-app-frameworks',
                    title: 'Web app frameworks',
                    backendKey: 'appFrameworks',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 33554432
                },
                'ecommerce': {
                    urlKey: 'ecommerce',
                    locKey: 'MAC_Loc_ecommerce',
                    title: 'Ecommerce',
                    backendKey: 'eCommerce',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 67108864
                },
                'addons': {
                    urlKey: 'addons',
                    locKey: 'MAC_Loc_addons',
                    title: 'Add-ons',
                    backendKey: 'addons',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 134217728
                }
            }
        },
        'databases': {
            urlKey: 'databases',
            locKey: 'MAC_Loc_databases',
            title: 'Databases',
            backendKey: 'Databases_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 268435456
                },
                'database-servers': {
                    urlKey: 'database-servers',
                    locKey: 'MAC_Loc_database-servers',
                    title: 'Database servers',
                    backendKey: 'databaseServers',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 536870912
                },
                'nosql-databases': {
                    urlKey: 'nosql-databases',
                    locKey: 'MAC_Loc_nosql-databases',
                    title: 'NoSQL Databases',
                    backendKey: 'noSQL',
                    'targetProperty': 'category_mask_1',
                    'targetMask': 1073741824
                },
                'databases-all': {
                    urlKey: 'databases-all',
                    locKey: 'MAC_Loc_databases-all',
                    title: 'Databases all',
                    backendKey: 'azureCertified',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 1
                }
            }
        },
        'intelligence-analytics': {
            urlKey: 'intelligence-analytics',
            locKey: 'MAC_Loc_intelligence-analytics',
            title: 'Intelligence + analytics',
            backendKey: 'IntelligenceAndAnalytics_MP',
            subCategoryDataMapping: {
                'whats-new': {
                    urlKey: 'whats-new',
                    locKey: 'MAC_Loc_whats-new',
                    title: 'Whats new',
                    backendKey: 'whatsNew',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 2
                },
                'data-analytics': {
                    urlKey: 'data-analytics',
                    locKey: 'MAC_Loc_data-analytics',
                    title: 'Data analytics',
                    backendKey: 'analytics',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 4
                },
                'data-insights': {
                    urlKey: 'data-insights',
                    locKey: 'MAC_Loc_data-insights',
                    title: 'Data insights',
                    backendKey: 'dataInsights',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 8
                }
            }
        },
        'internet-of-things': {
            urlKey: 'internet-of-things',
            locKey: 'MAC_Loc_internet-of-things',
            title: 'Internet of Things',
            backendKey: 'InternetOfThings_MP',
            subCategoryDataMapping: {
                'data-analytics': {
                    urlKey: 'data-analytics',
                    locKey: 'MAC_Loc_data-analytics',
                    title: 'Data analytics',
                    backendKey: 'analytics',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 16
                },
                'storage': {
                    urlKey: 'storage',
                    locKey: 'MAC_Loc_storage',
                    title: 'Storage',
                    backendKey: 'storage',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 32
                },
                'connectivity': {
                    urlKey: 'connectivity',
                    locKey: 'MAC_Loc_connectivity',
                    title: 'Connectivity',
                    backendKey: 'connectivity',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 64
                },
                'pcs': {
                    urlKey: 'pcs',
                    locKey: 'MAC_Loc_iot-pcs',
                    title: 'Preconfigured Solutions',
                    backendKey: 'pcs',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 128
                }
            }
        },
        'enterprise-integration': {
            urlKey: 'enterprise-integration',
            locKey: 'MAC_Loc_enterprise-integration',
            title: 'Enterprise Integration',
            backendKey: 'EnterpriseIntegration_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 256
                },
                'biztalk': {
                    urlKey: 'biztalk',
                    locKey: 'MAC_Loc_biztalk',
                    title: 'BizTalk',
                    backendKey: 'biztalk',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 512
                },
                'messaging': {
                    urlKey: 'messaging',
                    locKey: 'MAC_Loc_messaging',
                    title: 'Messaging',
                    backendKey: 'messaging',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 1024
                }
            }
        },
        'security-identity': {
            urlKey: 'security-identity',
            locKey: 'MAC_Loc_security-identity',
            title: 'Security + Identity',
            backendKey: 'SecurityIdentity_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 2048
                },
                'security-protection': {
                    urlKey: 'security-protection',
                    locKey: 'MAC_Loc_security-protection',
                    title: 'Security + protection',
                    backendKey: 'SecurityProtection',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 4096
                },
                'identity-access-mgmt': {
                    urlKey: 'identity-access-mgmt',
                    locKey: 'MAC_Loc_identity-access-mgmt',
                    title: 'Identity + access mgmt',
                    backendKey: 'Identity',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 8192
                },
                'compliance': {
                    urlKey: 'compliance',
                    locKey: 'MAC_Loc_compliance',
                    title: 'Compliance',
                    backendKey: 'Compliance',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 16384
                }
            }
        },
        'developer-tools': {
            urlKey: 'developer-tools',
            locKey: 'MAC_Loc_developer-tools',
            title: 'Developer tools',
            backendKey: 'DeveloperTools_MP',
            subCategoryDataMapping: {
                'tools': {
                    urlKey: 'tools',
                    locKey: 'MAC_Loc_tools',
                    title: 'Tools',
                    backendKey: 'developerTools',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 32768
                },
                'devops': {
                    urlKey: 'devops',
                    locKey: 'MAC_Loc_devops',
                    title: 'DevOps',
                    backendKey: 'devops',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 65536
                },
                'scripts': {
                    urlKey: 'scripts',
                    locKey: 'MAC_Loc_scripts',
                    title: 'Scripts',
                    backendKey: 'scripts',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 131072
                }
            }
        },
        'monitoring-management': {
            urlKey: 'monitoring-management',
            locKey: 'MAC_Loc_monitoring-management',
            title: 'Monitoring + Management',
            backendKey: 'MonitoringAndManagement_MP',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 262144
                },
                'monitoring-diagnostics': {
                    urlKey: 'monitoring-diagnostics',
                    locKey: 'MAC_Loc_monitoring-diagnostics',
                    title: 'Monitoring + diagnostics',
                    backendKey: 'monitoringAndDiagnostics',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 524288
                },
                'management-solutions': {
                    urlKey: 'management-solutions',
                    locKey: 'MAC_Loc_management-solutions',
                    title: 'Management Solutions',
                    backendKey: 'managementSolutions',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 1048576
                },
                'business-applications': {
                    urlKey: 'business-applications',
                    locKey: 'MAC_Loc_business-applications',
                    title: 'Business applications',
                    backendKey: 'bizApps',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 2097152
                }
            }
        },
        'addons': {
            urlKey: 'addons',
            locKey: 'MAC_Loc_addons',
            title: 'Add-ons',
            backendKey: 'AddOns_MP',
            subCategoryDataMapping: {
                'recommended': {
                    urlKey: 'recommended',
                    locKey: 'MAC_Loc_recommended',
                    title: 'Recommended',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 4194304
                },
                'addons-all': {
                    urlKey: 'addons-all',
                    locKey: 'MAC_Loc_addons-all',
                    title: 'Add-ons all',
                    backendKey: 'devServicesAzureCertified',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 8388608
                }
            }
        },
        'containers': {
            urlKey: 'containers',
            locKey: 'MAC_Loc_containers',
            title: 'Containers',
            backendKey: 'Containers_MP',
            subCategoryDataMapping: {
                'platform': {
                    urlKey: 'platform',
                    locKey: 'MAC_Loc_platform',
                    title: 'Platform',
                    backendKey: 'GetStartedWithContainers_MP',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 16777216
                },
                'web': {
                    urlKey: 'web',
                    locKey: 'MAC_Loc_web',
                    title: 'Web',
                    backendKey: 'WebDH',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 33554432
                }
            }
        },
        'blockchain': {
            urlKey: 'blockchain',
            locKey: 'MAC_Loc_blockchain',
            title: 'Blockchain',
            backendKey: 'Blockchain_MP',
            subCategoryDataMapping: {
                'distributed-ledgers': {
                    urlKey: 'distributed-ledgers',
                    locKey: 'MAC_Loc_distributed-ledgers',
                    title: 'Distributed ledgers',
                    backendKey: 'BlockChainDistributedLedgers_MP',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 67108864
                },
                'tools': {
                    urlKey: 'tools',
                    locKey: 'MAC_Loc_tools',
                    title: 'Tools',
                    backendKey: 'BlockchainTools_MP',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 134217728
                }
            }
        },
        'azure-active-directory-apps': {
            urlKey: 'azure-active-directory-apps',
            locKey: 'MAC_Loc_azure-active-directory-apps',
            title: 'Azure Active Directory apps',
            backendKey: 'AADapps',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured',
                    title: 'Featured',
                    backendKey: 'Featured',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 268435456
                },
                'business-management': {
                    urlKey: 'business-management',
                    locKey: 'MAC_Loc_business-management',
                    title: 'Business Management',
                    backendKey: 'BusinessManagement',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 536870912
                },
                'collaboration': {
                    urlKey: 'collaboration',
                    locKey: 'MAC_Loc_collaboration',
                    title: 'Collaboration',
                    backendKey: 'Collaboration',
                    'targetProperty': 'category_mask_2',
                    'targetMask': 1073741824
                },
                'construction': {
                    urlKey: 'construction',
                    locKey: 'MAC_Loc_construction',
                    title: 'Construction',
                    backendKey: 'Construction',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 1
                },
                'consumer': {
                    urlKey: 'consumer',
                    locKey: 'MAC_Loc_consumer',
                    title: 'Consumer',
                    backendKey: 'Consumer',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 2
                },
                'content-management': {
                    urlKey: 'content-management',
                    locKey: 'MAC_Loc_content-management',
                    title: 'Content Management',
                    backendKey: 'ContentManagement',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 4
                },
                'crm': {
                    urlKey: 'crm',
                    locKey: 'MAC_Loc_crm',
                    title: 'CRM',
                    backendKey: 'CRM',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 8
                },
                'data-services': {
                    urlKey: 'data-services',
                    locKey: 'MAC_Loc_data-services',
                    title: 'Data Services',
                    backendKey: 'DataServices',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 16
                },
                'developer-services': {
                    urlKey: 'developer-services',
                    locKey: 'MAC_Loc_developer-services',
                    title: 'Developer Services',
                    backendKey: 'DeveloperServices',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 32
                },
                'ecommerce': {
                    urlKey: 'ecommerce',
                    locKey: 'MAC_Loc_ecommerce',
                    title: 'E-Commerce',
                    backendKey: 'ECommerce',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 64
                },
                'education': {
                    urlKey: 'education',
                    locKey: 'MAC_Loc_education',
                    title: 'Education',
                    backendKey: 'Education',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 128
                },
                'erp': {
                    urlKey: 'erp',
                    locKey: 'MAC_Loc_erp',
                    title: 'ERP',
                    backendKey: 'ERP',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 256
                },
                'finance': {
                    urlKey: 'finance',
                    locKey: 'MAC_Loc_finance',
                    title: 'Finance',
                    backendKey: 'Finance',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 512
                },
                'health': {
                    urlKey: 'health',
                    locKey: 'MAC_Loc_health',
                    title: 'Health',
                    backendKey: 'Health',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 1024
                },
                'human-resources': {
                    urlKey: 'human-resources',
                    locKey: 'MAC_Loc_human-resources',
                    title: 'Human Resources',
                    backendKey: 'HR',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 2048
                },
                'it-infrastructure': {
                    urlKey: 'it-infrastructure',
                    locKey: 'MAC_Loc_it-infrastructure',
                    title: 'IT Infrastructure',
                    backendKey: 'ITInfra',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 4096
                },
                'mail': {
                    urlKey: 'mail',
                    locKey: 'MAC_Loc_mail',
                    title: 'Mail',
                    backendKey: 'Mail',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 8192
                },
                'marketing': {
                    urlKey: 'marketing',
                    locKey: 'MAC_Loc_marketing',
                    title: 'Marketing',
                    backendKey: 'Marketing',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 16384
                },
                'media': {
                    urlKey: 'media',
                    locKey: 'MAC_Loc_media',
                    title: 'Media',
                    backendKey: 'Media',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 32768
                },
                'productivity': {
                    urlKey: 'productivity',
                    locKey: 'MAC_Loc_productivity',
                    title: 'Productivity',
                    backendKey: 'Productivity',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 65536
                },
                'project-management': {
                    urlKey: 'project-management',
                    locKey: 'MAC_Loc_project-management',
                    title: 'Project Management',
                    backendKey: 'ProjectMgmt',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 131072
                },
                'security': {
                    urlKey: 'security',
                    locKey: 'MAC_Loc_security',
                    title: 'Security',
                    backendKey: 'Security',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 262144
                },
                'social': {
                    urlKey: 'social',
                    locKey: 'MAC_Loc_social',
                    title: 'Social',
                    backendKey: 'Social',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 524288
                },
                'supply-management': {
                    urlKey: 'supply-management',
                    locKey: 'MAC_Loc_supply-management',
                    title: 'Supply Management',
                    backendKey: 'SupplyMgmt',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 1048576
                },
                'telecommunications': {
                    urlKey: 'telecommunications',
                    locKey: 'MAC_Loc_telecommunications',
                    title: 'Telecommunications',
                    backendKey: 'Telecommunications',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 2097152
                },
                'tools': {
                    urlKey: 'tools',
                    locKey: 'MAC_Loc_tools',
                    title: 'Tools',
                    backendKey: 'Tools',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 4194304
                },
                'travel': {
                    urlKey: 'travel',
                    locKey: 'MAC_Loc_travel',
                    title: 'Travel',
                    backendKey: 'Travel',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 8388608
                },
                'web-design-hosting': {
                    urlKey: 'web-design-hosting',
                    locKey: 'MAC_Loc_web-design-hosting',
                    title: 'Web Design & Hosting',
                    backendKey: 'WebDesign',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 16777216
                }
            }
        },
        'test-drives': {
            urlKey: 'test-drives',
            locKey: 'MAC_Loc_test-drives',
            title: 'Test drives',
            backendKey: 'Testdrive_MP',
            subCategoryDataMapping: {
                'firewalls-and-security': {
                    urlKey: 'firewalls-and-security',
                    locKey: 'MAC_Loc_firewalls-and-security',
                    title: 'Firewalls and Security',
                    backendKey: 'security',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 33554432
                },
                'big-data-analytics': {
                    urlKey: 'big-data-analytics',
                    locKey: 'MAC_Loc_big-data-analytics',
                    title: 'Big data + analytics',
                    backendKey: 'dataanalytics',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 67108864
                },
                'devops': {
                    urlKey: 'devops',
                    locKey: 'MAC_Loc_devops',
                    title: 'DevOps',
                    backendKey: 'devops',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 134217728
                },
                'storage-infrastrcture': {
                    urlKey: 'storage-infrastrcture',
                    locKey: 'MAC_Loc_storage-infrastrcture',
                    title: 'Storage + Infrastrcture',
                    backendKey: 'storage_TD',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 268435456
                }
            }
        },
        'solutions': {
            urlKey: 'solutions',
            locKey: 'MAC_Loc_mcsolution',
            title: 'Solutions',
            backendKey: 'mcsolution',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured-solution',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 536870912
                },
                'ecommerce': {
                    urlKey: 'ecommerce-solution',
                    locKey: 'MAC_Loc_ecommerce-solution',
                    title: 'E-Commerce',
                    backendKey: 'eCommerce',
                    'targetProperty': 'category_mask_3',
                    'targetMask': 1073741824
                },
                'internet-of-things': {
                    urlKey: 'internet-of-things',
                    locKey: 'MAC_Loc_internet-of-things',
                    title: 'Internet of Things',
                    backendKey: 'InternetOfThings_MP',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 1
                }
            }
        },
        'partner-solutions': {
            urlKey: 'partner-solutions',
            locKey: 'MAC_Loc_mcpartnersolution',
            title: 'Partner Solutions',
            backendKey: 'mcpartnersolution',
            subCategoryDataMapping: {
                'featured': {
                    urlKey: 'featured',
                    locKey: 'MAC_Loc_featured-partner-solution',
                    title: 'Featured',
                    backendKey: 'recommended',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 2
                },
                'integrated-industry-solutions': {
                    urlKey: 'integrated-industry-solution',
                    locKey: 'MAC_Loc_integrated-industry-solution',
                    title: 'Integrated Industry',
                    backendKey: 'integrated_industry_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 4
                },
                'manufacturing': {
                    urlKey: 'manufacturing-solution',
                    locKey: 'MAC_Loc_manufacturing-solution',
                    title: 'Manufacturing',
                    backendKey: 'manufacturing_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 8
                },
                'public-service': {
                    urlKey: 'public-service-solution',
                    locKey: 'MAC_Loc_public-service-solution',
                    title: 'Public Service',
                    backendKey: 'public_service_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 16
                },
                'retailing': {
                    urlKey: 'retailing-solution',
                    locKey: 'MAC_Loc_retailing-solution',
                    title: 'Retailing',
                    backendKey: 'retailing_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 32
                },
                'tourism': {
                    urlKey: 'tourism-solution',
                    locKey: 'MAC_Loc_tourism-solution',
                    title: 'Tourism',
                    backendKey: 'tourism_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 64
                },
                'estate': {
                    urlKey: 'estate-solution',
                    locKey: 'MAC_Loc_estate-solution',
                    title: 'Estate',
                    backendKey: 'estate_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 128
                },
                'professional-services': {
                    urlKey: 'professional-services-solution',
                    locKey: 'MAC_Loc_professional-services-solution',
                    title: 'Professional Services',
                    backendKey: 'professional_services_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 256
                },
                'internet': {
                    urlKey: 'internet-solution',
                    locKey: 'MAC_Loc_internet-solution',
                    title: 'Internet',
                    backendKey: 'internet_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 512
                },
                'financial': {
                    urlKey: 'financial-solution',
                    locKey: 'MAC_Loc_financial-solution',
                    title: 'Financial',
                    backendKey: 'financial_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 1024
                },
                'media': {
                    urlKey: 'media-solution',
                    locKey: 'MAC_Loc_media-solution',
                    title: 'Media',
                    backendKey: 'media_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 2048
                },
                'car': {
                    urlKey: 'car-solution',
                    locKey: 'MAC_Loc_car-solution',
                    title: 'Car/Vehicle',
                    backendKey: 'car_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 4096
                },
                'it-services': {
                    urlKey: 'it-service-solution',
                    locKey: 'MAC_Loc_it-service-solution',
                    title: 'IT Services',
                    backendKey: 'it_service_solution',
                    'targetProperty': 'category_mask_4',
                    'targetMask': 8192
                }
            }
        }
    },
    globalFilter1: {
        'trials': {
            urlKey: 'trials',
            locKey: 'MAC_Loc_trials',
            title: 'Trials',
            backendKey: 'trials',
            subCategoryDataMapping: {
                'test-drive': {
                    urlKey: 'test-drive',
                    locKey: 'Test_Drive',
                    title: 'Test Drive',
                    backendKey: 'testDrive',
                    'targetProperty': 'globalFilter1_mask_1',
                    'targetMask': 1
                },
                'free-trial': {
                    urlKey: 'free-trial',
                    locKey: 'MAC_Loc_free-trial',
                    title: '30-day Software Free Trial',
                    backendKey: 'freeTrial',
                    'targetProperty': 'globalFilter1_mask_1',
                    'targetMask': 2
                }
            }
        }
    },
    globalFilter2: {
        'pricing-model': {
            urlKey: 'pricing-model',
            locKey: 'MAC_Loc_pricing-model',
            title: 'Pricing Model',
            backendKey: 'pricingModel',
            subCategoryDataMapping: {
                'free': {
                    urlKey: 'pricing-free',
                    locKey: 'Pricing_Free',
                    title: 'Free',
                    backendKey: 'free',
                    'targetProperty': 'globalFilter2_mask_1',
                    'targetMask': 1
                },
                'pay-as-you-go': {
                    urlKey: 'pay-as-you-go',
                    locKey: 'MAC_Loc_pay-as-you-go',
                    title: 'Pay as you go',
                    backendKey: 'payAsYouGo',
                    'targetProperty': 'globalFilter2_mask_1',
                    'targetMask': 2
                },
                'byol': {
                    urlKey: 'byol',
                    locKey: 'MAC_Loc_byol',
                    title: 'Bring your own license (BYOL)',
                    backendKey: 'byol',
                    'targetProperty': 'globalFilter2_mask_1',
                    'targetMask': 4
                }
            }
        }
    },
    globalFilter3: {
        'operating-system': {
            urlKey: 'operating-system',
            locKey: 'MAC_Loc_operating-system',
            title: 'Operating System',
            backendKey: 'operatingSystem',
            subCategoryDataMapping: {
                'windows': {
                    urlKey: 'windows',
                    locKey: 'MAC_Loc_windows',
                    title: 'Windows',
                    backendKey: 'windows',
                    'targetProperty': 'globalFilter3_mask_1',
                    'targetMask': 1
                },
                'linux': {
                    urlKey: 'linux',
                    locKey: 'MAC_Loc_linux',
                    title: 'Linux',
                    backendKey: 'linux',
                    'targetProperty': 'globalFilter3_mask_1',
                    'targetMask': 2
                }
            }
        }
    },
    globalFilter4: {
        'publisher': {
            urlKey: 'publisher',
            locKey: 'App_Publisher',
            title: 'Publisher',
            backendKey: 'publisher',
            subCategoryDataMapping: {
                'partners': {
                    urlKey: 'partners',
                    locKey: 'Partner_BackButton',
                    title: 'Partners',
                    backendKey: 'partners',
                    'targetProperty': 'globalFilter4_mask_1',
                    'targetMask': 1
                },
                'microsoft': {
                    urlKey: 'microsoft',
                    locKey: 'MAC_Loc_microsoft',
                    title: 'Microsoft',
                    backendKey: 'microsoft',
                    'targetProperty': 'globalFilter4_mask_1',
                    'targetMask': 2
                }
            }
        }
    }
};

