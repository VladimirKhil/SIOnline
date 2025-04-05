import localization from '../model/resources/localization';

export default function getLanguage(language: string): string {
	switch (language) {
		case 'ru-RU': return localization.languageRu;
		case 'en-US': return localization.languageEn;
		default: return language;
	}
}