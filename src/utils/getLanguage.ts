import localization from '../model/resources/localization';

export default function getLanguage(language: string): string {
	switch (language) {
		case 'ru-RU': case 'ru': return localization.languageRu;
		case 'en-US': case 'en': return localization.languageEn;
		case 'sr-RS': case 'sr': return localization.languageSr;
		default: return language;
	}
}