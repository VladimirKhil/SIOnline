import * as React from 'react';
import localization from '../../../model/resources/localization';
import Selector from '../../common/Selector/Selector';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { languageChanged } from '../../../state/settingsSlice';

import './LanguageView.css';

interface LanguageViewProps {
	disabled: boolean | undefined;
}

export default function LanguageView(props: LanguageViewProps): JSX.Element {
	const culture = useAppSelector(state => state.settings.appSettings.culture || localization.getLanguage());
	const appDispatch = useAppDispatch();

	function onLanguageChanged(language: string | null): void {
		appDispatch(languageChanged(language));
	}

	return (
		<Selector
			className='languageArea'
			data={[{
				value: 'ru',
				name: 'РУ',
				tooltip: localization.languageRu
			}, {
				value: 'ua',
				name: 'УК',
				tooltip: localization.languageUa
			}, {
				value: 'en',
				name: 'EN',
				tooltip: localization.languageEn
			}]}
			value={culture}
			disabled={props.disabled}
			onValueChanged={onLanguageChanged}
		/>
	);
}