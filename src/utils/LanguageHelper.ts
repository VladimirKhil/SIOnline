import localization from '../model/resources/localization';

export function getLanguage(language: string): string {
	switch (language) {
		case 'ru-RU': case 'ru': return localization.languageRu;
		case 'en-US': case 'en': return localization.languageEn;
		case 'es-ES': case 'es': return localization.languageEs;
		case 'sr-RS': case 'sr': return localization.languageSr;
		case 'uz-UZ': case 'uz': return localization.languageUz;
		default: return language;
	}
}

export function getFullCulureName(culture: string): string {
	switch (culture) {
		case 'ru':
			return 'ru-RU';
		case 'es':
			return 'es-ES';
		case 'sr':
			return 'sr-RS';
		case 'uz':
			return 'uz-UZ';
		default:
			return 'en-US';
	}
}