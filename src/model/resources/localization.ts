import settingsLocalization from '../../features/settings/localization';
import siquesterLocalization from '../../features/siquester/localization';
import gameLocalization from '../../features/game/localization';
import appLocalization from '../../features/app/localization';
import storageLocalization from '../../features/storage/localization';
import tableLocalization from '../../features/table/localization';
import roomLocalization from '../../features/room/localization';
import gameEventsLocalization from '../../features/game-events/localization';
import errorsLocalization from '../../features/errors/localization';
import demoLocalization from '../../features/demo/localization';
import commonLocalization from '../../features/common/localization';
import LocalizedStrings from 'localized-strings';

// First language is used as the default when browser language is different from provided languages

const localization = new LocalizedStrings({
	en: {
		...settingsLocalization.en,
		...siquesterLocalization.en,
		...gameLocalization.en,
		...appLocalization.en,
		...storageLocalization.en,
		...tableLocalization.en,
		...roomLocalization.en,
		...gameEventsLocalization.en,
		...errorsLocalization.en,
		...demoLocalization.en,
		...commonLocalization.en,
	},
	ru: {
		...settingsLocalization.ru,
		...siquesterLocalization.ru,
		...gameLocalization.ru,
		...appLocalization.ru,
		...storageLocalization.ru,
		...tableLocalization.ru,
		...roomLocalization.ru,
		...gameEventsLocalization.ru,
		...errorsLocalization.ru,
		...demoLocalization.ru,
		...commonLocalization.ru,
	},
	sr: {
		...settingsLocalization.sr,
		...siquesterLocalization.sr,
		...gameLocalization.sr,
		...appLocalization.sr,
		...storageLocalization.sr,
		...tableLocalization.sr,
		...roomLocalization.sr,
		...gameEventsLocalization.sr,
		...errorsLocalization.sr,
		...demoLocalization.sr,
		...commonLocalization.sr,
	},
	uz: {
		...settingsLocalization.uz,
		...siquesterLocalization.uz,
		...gameLocalization.uz,
		...appLocalization.uz,
		...storageLocalization.uz,
		...tableLocalization.uz,
		...roomLocalization.uz,
		...gameEventsLocalization.uz,
		...errorsLocalization.uz,
		...demoLocalization.uz,
		...commonLocalization.uz,
	},
	es: {
		...settingsLocalization.es,
		...siquesterLocalization.es,
		...gameLocalization.es,
		...appLocalization.es,
		...storageLocalization.es,
		...tableLocalization.es,
		...roomLocalization.es,
		...gameEventsLocalization.es,
		...errorsLocalization.es,
		...demoLocalization.es,
		...commonLocalization.es,
	},
});

export default localization;
