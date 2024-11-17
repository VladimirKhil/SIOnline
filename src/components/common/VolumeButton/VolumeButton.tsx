import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/new/hooks';
import { setSoundVolume } from '../../../state/new/settingsSlice';

import './VolumeButton.css';

interface VolumeButtonProps {
	canPlayAudio: boolean;
	isVolumeControlVisible: boolean;
	toggleVisibility: () => void;
}

export default function VolumeButton(props: VolumeButtonProps) {
	const settings = useAppSelector(state => state.settings);
	const appDispatch = useAppDispatch();

	const changeVolumeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setSoundVolume(Number(e.target.value)));
	};

	return (
		<>
			<button
				type="button"
				onClick={props.toggleVisibility}
				className="volumeButton"
				style={{ background: props.isVolumeControlVisible ? 'lightgrey' : 'none' }}
				title={settings.soundVolume ? localization.enableSound : localization.disableSound}
			>
				{settings.soundVolume && props.canPlayAudio ? '🔈' : '🔇'}
			</button>

			<input
				aria-label='Volume range'
				min={0}
				max={1}
				step={0.1}
				type="range"
				value={settings.soundVolume}
				onChange={changeVolumeHandler}
				style={{ display: props.isVolumeControlVisible ? 'block' : 'none' }}
				className="volumeButtonControl"
			/>
		</>
	);
}
