import * as React from 'react';
import localization from '../../../model/resources/localization';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../../common/FlyoutButton/FlyoutButton';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { languageChanged } from '../../../state/settingsSlice';

import './LanguageView.css';

interface LanguageViewProps {
	disabled: boolean | undefined;
}

interface LanguageItem {
	code: string;
	name: string;
}

const languages: LanguageItem[] = [{
	code: 'EN',
	name: 'English'
}, {
	code: 'ES',
	name: 'Español'
}, {
	code: 'RU',
	name: 'Русский'
}, {
	code: 'SR',
	name: 'Srpski'
}, {
	code: 'UZ',
	name: 'O\'zbek'
}];

export default function LanguageView(props: LanguageViewProps): JSX.Element {
	const culture = useAppSelector(state => state.settings.appSettings.culture) || localization.getLanguage();
	const appDispatch = useAppDispatch();
	const selectedLanguageCode = culture.toUpperCase();
	const selectedLanguage = languages.find(language => language.code === selectedLanguageCode) || languages[0];

	const onFlyoutMouseDown = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
		// Settings dialog listens for global mousedown to close on outside click.
		// Stop this event so selecting a language is treated as an inside interaction.
		e.preventDefault();
		e.stopPropagation();
	}, []);

	function onLanguageChanged(language: string | null): void {
		appDispatch(languageChanged(language));
	}

	return (
		<FlyoutButton
			className='languageArea'
			flyout={(
				<ul className='languageMenu' onMouseDown={onFlyoutMouseDown}>
					{languages.map(language => (
						<li
							key={language.code}
							className={language.code === selectedLanguageCode ? 'selected' : ''}
							onClick={() => onLanguageChanged(language.code.toLowerCase())}
						>
							<span className='languageCode'>{language.code}</span>
							<span className='languageName'>{language.name}</span>
						</li>
					))}
				</ul>
			)}
			horizontalOrientation={FlyoutHorizontalOrientation.Left}
			verticalOrientation={FlyoutVerticalOrientation.Bottom}
			disabled={props.disabled}
		>
			<span className='languageCode'>{selectedLanguage.name}</span>
		</FlyoutButton>
	);
}