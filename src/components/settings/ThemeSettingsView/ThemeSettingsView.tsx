import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setTableBackgroundColor, setTableTextColor } from '../../../state/settingsSlice';

const ThemeSettingsView: React.FC = () => {
	const theme = useAppSelector(state => state.settings.theme);
	const appDispatch = useAppDispatch();

	return (
		<div>
			<h2>{localization.table}</h2>

			<div className='settingItem'>
				<input
					id='tableTextColor'
					type='color'
					value={theme.table.textColor}
					onChange={e => appDispatch(setTableTextColor(e.target.value))} />

				<label htmlFor='tableTextColor'>{localization.textColor}</label>
			</div>

			<div className='settingItem'>
				<input
					id='tableTextColor'
					type='color'
					value={theme.table.backgroundColor}
					onChange={e => appDispatch(setTableBackgroundColor(e.target.value))} />

				<label htmlFor='tableTextColor'>{localization.backgroundColor}</label>
			</div>
		</div>
	);
};

export default ThemeSettingsView;