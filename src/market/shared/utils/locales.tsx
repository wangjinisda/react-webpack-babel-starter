export interface Locale {
    language: string;
    locale: string;
    languageCode: string;
};

export let AllLocales: Locale[] = [
    { language: 'Brasil - Português', locale: 'pt-BR', languageCode: 'pt' },
    { language: 'Catalan - Català', locale: 'ca-es', languageCode: 'ca' },
    { language: 'Česká Republika - Čeština', locale: 'cs-CZ', languageCode: 'cs' },
    { language: 'Danmark - Dansk', locale: 'da-DK', languageCode: 'da' },
    { language: 'Deutschland - Deutsch', locale: 'de-DE', languageCode: 'de' },
    { language: 'Eesti - Eesti', locale: 'et-ee', languageCode: 'et' },
    { language: 'España - Español', locale: 'es-ES', languageCode: 'es' },
    { language: 'Euskal Herria - Euskara', locale: 'eu-ES', languageCode: 'eu' },
    { language: 'France - Français', locale: 'fr-FR', languageCode: 'fr' },
    { language: 'Galego - Galego', locale: 'gl-ES', languageCode: 'gl' },
    { language: 'Hrvatska - Hrvatski', locale: 'hr-hr', languageCode: 'hr' },
    { language: 'Indonesia - Bahasa Indonesia', locale: 'id-ID', languageCode: 'id' },
    { language: 'Italia - Italiano', locale: 'it-IT', languageCode: 'it' },
    { language: 'Kazakhstan - Қазақша', locale: 'kk-KZ', languageCode: 'kk' },
    { language: 'Latvija - Latviešu', locale: 'lv-LV', languageCode: 'lv' },
    { language: 'Lietuva - Lietuvių', locale: 'lt-LT', languageCode: 'lt' },
    { language: 'Magyarország - Magyar', locale: 'hu-HU', languageCode: 'hu' },
    { language: 'Malaysia - Bahasa Melayu', locale: 'ms-MY', languageCode: 'ms' },
    { language: 'Nederland - Nederlands', locale: 'nl-NL', languageCode: 'nl' },
    { language: 'Norge - Bokmål', locale: 'nb-NO', languageCode: 'no' },
    { language: 'Polska - Polski', locale: 'pl-PL', languageCode: 'pl' },
    { language: 'Portugal - Português', locale: 'pt-pt', languageCode: 'pt-PT' }, // todo: not clear
    { language: 'România - Română', locale: 'ro-RO', languageCode: 'ro' },
    { language: 'Slovenija - Slovenščina', locale: 'sl-SI', languageCode: 'sl' },
    { language: 'Slovensko - Slovenčina', locale: 'sk-SK', languageCode: 'sk' },
    { language: 'Srbija - Srpski', locale: 'sr-Latn', languageCode: 'sr-Latn' },
    { language: 'Suomi - Suomi', locale: 'fi-FI', languageCode: 'fi' },
    { language: 'Sverige - Svenska', locale: 'sv-SE', languageCode: 'sv' },
    { language: 'Türkiye - Türkçe', locale: 'tr-TR', languageCode: 'tr' },
    { language: 'United States - English', locale: 'en-us', languageCode: 'en' },
    { language: 'Việt Nam - Tiếng việt', locale: 'vi-VN', languageCode: 'vi' },
    { language: 'Ελλάδα - Ελληνικά', locale: 'el-GR', languageCode: 'el' },
    { language: 'България - Български', locale: 'bg-bg', languageCode: 'bg' },
    { language: 'Россия - Русский', locale: 'ru-RU', languageCode: 'ru' },
    { language: 'Србија - српски', locale: 'sr-Cyrl', languageCode: 'sr-Cyrl' },
    { language: 'Україна - Українська', locale: 'uk-UA', languageCode: 'uk' },
    { language: 'ישראל - עברית', locale: 'he-IL', languageCode: 'he' },
    { language: 'المملكة العربية السعودية - العربية', locale: 'ar-SA', languageCode: 'ar' },
    { language: 'भारत - हिंदी', locale: 'hi-IN', languageCode: 'hi' },
    { language: 'ไทย - ไทย', locale: 'th-TH', languageCode: 'th' },
    { language: '대한민국 - 한국어', locale: 'ko-KR', languageCode: 'ko' },
    { language: '中国 - 简体中文', locale: 'zh-CN', languageCode: 'zh-Hans' },   // note 
    { language: '台灣 - 繁體中文', locale: 'zh-TW', languageCode: 'zh-Hant' },  // note
    { language: '日本 - 日本語', locale: 'ja-JP', languageCode: 'ja' }
];

export function GetLanguageCode(locale: string) {
    // languageCode must only be defined if locale was valid and we could extract the right value
    let languageCode = '';
    let lowerCaseLocale = locale.toLowerCase();

    // the special cases:
    // todo: norwegian is not mapped
    if (lowerCaseLocale === 'zh-cn' || lowerCaseLocale === 'zh-hans') {
        languageCode = 'zh-Hans';
    } else if (lowerCaseLocale === 'zh-tw' || lowerCaseLocale === 'zh-hk' || lowerCaseLocale === 'zh-hant') {
        languageCode = 'zh-Hant';
    } else if (lowerCaseLocale === 'sr-cyrl') {
        languageCode = 'sr-Cyrl';
    } else if (lowerCaseLocale === 'sr-latn') {
        languageCode = 'sr-Latn';
    } else if (lowerCaseLocale === 'pt-pt') {
        languageCode = 'pt-PT';
    } else if (lowerCaseLocale === 'nb-no') {
        languageCode = 'no';  // todo: Joey to make sure this is correct mapping
    } else if (lowerCaseLocale.lastIndexOf('-') > 0) {
        languageCode = lowerCaseLocale.substring(0, lowerCaseLocale.lastIndexOf('-'));
    } else {
        // Assume that the input is the languageCode.
        // If it is not valid, it should be filtered out by the caller as appropriate.
        languageCode = lowerCaseLocale;
    }

    // GetLanguageCode will be used both by the static list of locales. And, on each request. 
    return languageCode;
}