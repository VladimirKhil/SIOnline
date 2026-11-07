import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import {
	setTableBackgroundMode,
	setTableBackgroundColor,
	setTableBackgroundAlpha,
	setTableHighlightedTextColor,
	setTableBackgroundImage,
	setTableBackgroundGradient,
} from '../../../state/settingsSlice';
import { userErrorChanged } from '../../../state/commonSlice';
import { BackgroundMode, DefaultHighlightedTextColor } from '../../../model/ThemeSettings';

import './BackgroundModeSelector.scss';

const MaxImageSizeMb = 1;

/**
 * Component for selecting and configuring table background mode
 * Supports: solid color with transparency, linear/radial gradients, and images
 */
const BackgroundModeSelector: React.FC = () => {
	const theme = useAppSelector(state => state.settings.theme);
	const { table: tableTheme } = theme;
	const dispatch = useAppDispatch();
	const imageInputRef = React.useRef<HTMLInputElement>(null);

	const backgroundMode = (tableTheme.backgroundMode ?? 'solid') as BackgroundMode;

	const handleBackgroundModeChange = (mode: BackgroundMode) => {
		dispatch(setTableBackgroundMode(mode));
	};

	const handleBackgroundColorChange = (color: string) => {
		dispatch(setTableBackgroundColor(color));
	};

	const handleAlphaChange = (alpha: number) => {
		dispatch(setTableBackgroundAlpha(alpha));
	};

	const handleHighlightedTextColorChange = (color: string) => {
		dispatch(setTableHighlightedTextColor(color));
	};

	const handleGradientColorChange = (index: number, color: string) => {
		if (!tableTheme.backgroundGradient) return;

		const colors = [...tableTheme.backgroundGradient.colors];
		colors[index] = color;

		dispatch(setTableBackgroundGradient({
			...tableTheme.backgroundGradient,
			colors,
		}));
	};

	const handleGradientAngleChange = (angle: number) => {
		if (!tableTheme.backgroundGradient) return;

		dispatch(setTableBackgroundGradient({
			...tableTheme.backgroundGradient,
			angle,
		}));
	};

	const handleAddGradientStop = () => {
		if (!tableTheme.backgroundGradient) {
			dispatch(setTableBackgroundGradient({
				type: backgroundMode === 'linear-gradient' ? 'linear' : 'radial',
				angle: 90,
				colors: ['#FFFFFF', '#000000'],
			}));
		} else if (tableTheme.backgroundGradient.colors.length < 5) {
			const colors = [...tableTheme.backgroundGradient.colors];
			colors.push('#808080');

			dispatch(setTableBackgroundGradient({
				...tableTheme.backgroundGradient,
				colors,
			}));
		}
	};

	const handleRemoveGradientStop = (index: number) => {
		if (!tableTheme.backgroundGradient || tableTheme.backgroundGradient.colors.length <= 2) return;

		const colors = tableTheme.backgroundGradient.colors.filter((_, i) => i !== index);

		dispatch(setTableBackgroundGradient({
			...tableTheme.backgroundGradient,
			colors,
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { target } = e;
		const { files } = target;
		if (!files || files.length === 0) return;

		const [file] = files;

		if (file.size > MaxImageSizeMb * 1024 * 1024) {
			dispatch(userErrorChanged(`${localization.fileIsTooBig} (${MaxImageSizeMb} MB)`));
			return;
		}

		const reader = new FileReader();
		reader.onload = (event) => {
			const result = event.target?.result;
			if (typeof result === 'string') {
				dispatch(setTableBackgroundImage(result));
			}
		};
		reader.readAsDataURL(file);
	};

	const handleImageClear = () => {
		dispatch(setTableBackgroundImage(null));
		if (imageInputRef.current) {
			// eslint-disable-next-line no-param-reassign
			imageInputRef.current.value = '';
		}
	};

	return (
		<div className='backgroundModeSelector'>
			<div className='settingItem'>
				<label htmlFor='tableBackgroundMode' className='common-label'>{localization.backgroundMode}</label>
				<select
					id='tableBackgroundMode'
					value={backgroundMode}
					onChange={e => handleBackgroundModeChange(e.target.value as BackgroundMode)}>
					<option value='solid'>{localization.backgroundModeSolid}</option>
					<option value='linear-gradient'>{localization.backgroundModeLinearGradient}</option>
					<option value='radial-gradient'>{localization.backgroundModeRadialGradient}</option>
					<option value='image'>{localization.backgroundModeImage}</option>
				</select>
			</div>

			{backgroundMode === 'solid' && (
				<div className='solidSection'>
					<div className='settingItem'>
						<input
							id='tableBackgroundColor'
							type='color'
							value={tableTheme.backgroundColor || '#0A0E30'}
							onChange={e => handleBackgroundColorChange(e.target.value)}
						/>
						<label htmlFor='tableBackgroundColor'>{localization.backgroundColor}</label>
					</div>
				</div>
			)}

			{(backgroundMode === 'linear-gradient' || backgroundMode === 'radial-gradient') && (
				<div className='gradientSection'>
					{backgroundMode === 'linear-gradient' && (
						<div className='settingItem'>
							<label htmlFor='gradientAngle'>{localization.backgroundAngle}</label>
							<div className='angleControl'>
								<input
									id='gradientAngle'
									type='range'
									min='0'
									max='360'
									value={tableTheme.backgroundGradient?.angle ?? 90}
									onChange={e => handleGradientAngleChange(parseInt(e.target.value, 10))}
								/>
								<span className='angleValue'>{tableTheme.backgroundGradient?.angle ?? 90}°</span>
							</div>
						</div>
					)}

					<div className='gradientStops'>
						<label>{localization.backgroundColorStops}</label>
						{tableTheme.backgroundGradient?.colors.map((color, index) => (
							<div key={index} className='gradientStop'>
								<input
									type='color'
									value={color}
									onChange={e => handleGradientColorChange(index, e.target.value)}
								/>
								{(tableTheme.backgroundGradient?.colors.length ?? 0) > 2 && (
									<button
										type='button'
										className='standard delete'
										onClick={() => handleRemoveGradientStop(index)}>
										{localization.delete}
									</button>
								)}
							</div>
						))}

						{(tableTheme.backgroundGradient?.colors.length ?? 0) < 5 && (
							<button
								type='button'
								className='standard'
								onClick={handleAddGradientStop}>
								+ {localization.add}
							</button>
						)}
					</div>
				</div>
			)}

			{backgroundMode === 'image' && (
				<div className='imageSection'>
					<div className='settingItem'>
						<label className='settingItem__simple'>{localization.backgroundImage}</label>

						{tableTheme.backgroundImage && (
							<img
								className='backgroundImagePreview'
								alt='background'
								src={tableTheme.backgroundImage}
							/>
						)}

						<input
							ref={imageInputRef}
							className='backgroundImageSelector'
							type='file'
							accept='.jpg,.jpeg,.png'
							aria-label='Background image selector'
							onChange={handleImageUpload}
						/>

						{tableTheme.backgroundImage && (
							<button
								type='button'
								className='standard delete'
								onClick={handleImageClear}>
								{localization.delete}
							</button>
						)}
					</div>
				</div>
			)}

			<div className='settingItem'>
				<label htmlFor='tableBackgroundAlpha'>{localization.backgroundTransparency}</label>
				<div className='alphaControl'>
					<input
						id='tableBackgroundAlpha'
						type='range'
						min='0'
						max='100'
						value={tableTheme.backgroundAlpha ?? 100}
						onChange={e => handleAlphaChange(parseInt(e.target.value, 10))}
					/>
					<span className='alphaValue'>{tableTheme.backgroundAlpha ?? 100}%</span>
				</div>
			</div>

			<div className='settingItem'>
				<input
					id='tableHighlightedTextColor'
					type='color'
					value={tableTheme.highlightedTextColor || DefaultHighlightedTextColor}
					onChange={e => handleHighlightedTextColorChange(e.target.value)}
				/>
				<label htmlFor='tableHighlightedTextColor'>{localization.highlightedTextColor}</label>
			</div>
		</div>
	);
};

export default BackgroundModeSelector;
