import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setSoundVolume } from '../../../state/settingsSlice';

import './VolumeButton.css';
import volumeOnIcon from '../../../../assets/images/volume-on.svg';
import volumeOffIcon from '../../../../assets/images/volume-off.svg';

interface VolumeButtonProps {
	canPlayAudio: boolean;
}

export default function VolumeButton(props: VolumeButtonProps) {
	const soundVolume = useAppSelector(state => state.settings.soundVolume);
	const appDispatch = useAppDispatch();
	const [isVolumeControlVisible, setIsVolumeControlVisible] = React.useState(false);
	const hideTimeoutRef = React.useRef<number | null>(null);

	const changeVolumeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setSoundVolume(Number(e.target.value)));
	};

	const showVolumeControl = () => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
			hideTimeoutRef.current = null;
		}

		setIsVolumeControlVisible(true);
	};

	const hideVolumeControl = () => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
		}

		hideTimeoutRef.current = window.setTimeout(() => {
			setIsVolumeControlVisible(false);
			hideTimeoutRef.current = null;
		}, 150);
	};

	React.useEffect(() => () => {
		if (hideTimeoutRef.current !== null) {
			window.clearTimeout(hideTimeoutRef.current);
		}
	}, []);

	const toggleVolumeControl = () => setIsVolumeControlVisible(value => !value);

	return (
		<div className="volumeContainer">
			<img
				src={soundVolume && props.canPlayAudio ? volumeOnIcon : volumeOffIcon}
				alt={localization.soundVolume}
				title={localization.soundVolume}
				className="volumeIcon"
				onMouseEnter={showVolumeControl}
				onMouseLeave={hideVolumeControl}
				onClick={toggleVolumeControl}
				onFocus={showVolumeControl}
				tabIndex={0}
			/>

			<div
				className={`volumeControlWrapper ${isVolumeControlVisible ? 'visible' : ''}`}
				onMouseEnter={showVolumeControl}
				onMouseLeave={hideVolumeControl}
			>
				<input
					aria-label='Volume range'
					min={0}
					max={1}
					step={0.01}
					type="range"
					value={soundVolume}
					onChange={changeVolumeHandler}
					onBlur={() => setIsVolumeControlVisible(false)}
					className="volumeButtonControl"
				/>
			</div>
		</div>
	);
}
