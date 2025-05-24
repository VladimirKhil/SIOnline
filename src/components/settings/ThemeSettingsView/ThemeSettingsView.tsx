import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setStudiaBackgroundImageKey, setTableBackgroundColor, setTableTextColor, setTableFontFamily } from '../../../state/settingsSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { selectStudiaBackground } from '../../../state/globalActions';
import Constants from '../../../model/enums/Constants';

import './ThemeSettingsView.scss';

const MaxImageSizeMb = 1;

// Common system fonts available across different operating systems
const systemFonts = [
	undefined, // Default option
	'Arial',
	'Arial Black',
	'Verdana',
	'Tahoma',
	'Trebuchet MS',
	'Times New Roman',
	'Georgia',
	'Garamond',
	'Courier New',
	'Segoe UI',
	'Helvetica',
	'Calibri',
	'Futura',
	'Gill Sans',
	'Geneva',
	'Palatino'
];

function renderStudiaBackground() {
	const base64 = localStorage.getItem(Constants.STUDIA_BACKGROUND_KEY);

	if (!base64) {
		return null;
	}

	return <img className='studiaView' alt='studia background' src={`data:image/png;base64, ${base64}`} />;
}

const ThemeSettingsView: React.FC = () => {
	const theme = useAppSelector(state => state.settings.theme);
	const { backgroundImageKey } = theme.room;
	const appDispatch = useAppDispatch();
	const inputRef = React.useRef<HTMLInputElement>(null);

	function onStudiaBackgroundChanged(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			// eslint-disable-next-line prefer-destructuring
			const targetFile = e.target.files[0];

			if (targetFile.size > MaxImageSizeMb * 1024 * 1024) {
				appDispatch(userErrorChanged(`${localization.fileIsTooBig} (${MaxImageSizeMb} MB)`));
				return;
			}

			appDispatch(selectStudiaBackground(targetFile));
		}
	}

	function onStudiaBackgroundDeleted() {
		localStorage.removeItem(Constants.STUDIA_BACKGROUND_KEY);
		localStorage.removeItem(Constants.STUDIA_BACKGROUND_NAME_KEY);
		appDispatch(setStudiaBackgroundImageKey(null));
	}

	return (
		<div className='themeSettingsView'>
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
					id='tableBackgroundColor'
					type='color'
					value={theme.table.backgroundColor}
					onChange={e => appDispatch(setTableBackgroundColor(e.target.value))} />

				<label htmlFor='tableBackgroundColor'>{localization.backgroundColor}</label>
			</div>

			<div className='settingItem'>
				<label htmlFor='tableFontFamily' className='common-label'>{localization.font || 'Font'}</label>

				<select
					id='tableFontFamily'
					value={theme.table.fontFamily || localization.defaultFont}
					onChange={e => appDispatch(setTableFontFamily(e.target.value))}>
					{systemFonts.map(font => (
						<option key={font ?? localization.defaultFont} value={font ?? ''} style={{ fontFamily: font }}>
							{font ?? localization.defaultFont}
						</option>
					))}
				</select>
			</div>

			<h2>{localization.room}</h2>

			<div className='settingItem'>
				<label className='settingItem__simple'>{localization.backgroundImage}</label>

				{backgroundImageKey && renderStudiaBackground()}

				<input
					ref={inputRef}
					className='studiaBackgroundSelector'
					type="file"
					accept=".jpg,.jpeg,.png"
					aria-label='Studia background selector'
					onChange={onStudiaBackgroundChanged}
				/>

				<button
					type='button'
					className='standard delete'
					onClick={onStudiaBackgroundDeleted}>
					{localization.delete}
				</button>
			</div>
		</div>
	);
};

export default ThemeSettingsView;