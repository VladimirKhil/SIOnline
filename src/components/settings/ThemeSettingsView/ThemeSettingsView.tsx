import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setStudiaBackgroundImageKey, setTableBackgroundColor, setTableTextColor } from '../../../state/settingsSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { selectStudiaBackground } from '../../../state/globalActions';
import Constants from '../../../model/enums/Constants';

import './ThemeSettingsView.scss';

const MaxImageSizeMb = 1;

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