import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import localization from '../model/resources/localization';
import settingsActionCreators from '../state/settings/settingsActionCreators';
import State from '../state/State';
import Selector from './common/Selector';

import './LanguageView.css';

interface LanguageViewProps {
	culture: string;
	disabled: boolean | undefined;
	onLanguageChanged: (language: string | null) => void;
}

const mapStateToProps = (state: State) => ({
	culture: state.settings.appSettings.culture || localization.getLanguage(),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onLanguageChanged: (language: string | null) => {
		dispatch(settingsActionCreators.languageChanged(language));
	},
});

export function LanguageView(props: LanguageViewProps): JSX.Element {
	return (
		<Selector
			className='languageArea'
			data={[{
				value: 'ru',
				name: 'РУ',
				tooltip: localization.languageRu
			}, {
				value: 'en',
				name: 'EN',
				tooltip: localization.languageEn
			}]}
			value={props.culture}
			disabled={props.disabled}
			onValueChanged={props.onLanguageChanged}
		/>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguageView);