import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setSoundVolume } from '../../../state/settingsSlice';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../FlyoutButton/FlyoutButton';

import './VolumeButton.css';

interface VolumeButtonProps {
	canPlayAudio: boolean;
}

export default function VolumeButton(props: VolumeButtonProps) {
	const settings = useAppSelector(state => state.settings);
	const appDispatch = useAppDispatch();

	const changeVolumeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		appDispatch(setSoundVolume(Number(e.target.value)));
	};

	return (
		<>
			<FlyoutButton
				className="volumeButton"
				title={localization.soundVolume}
				flyout={
					<div className="volumeFlyout">
						<input
							aria-label='Volume range'
							min={0}
							max={1}
							step={0.1}
							type="range"
							value={settings.soundVolume}
							onChange={changeVolumeHandler}
							className="volumeButtonControl"
						/>
					</div>
				}
				verticalOrientation={FlyoutVerticalOrientation.Top}
				horizontalOrientation={FlyoutHorizontalOrientation.Left}
			>
				{settings.soundVolume && props.canPlayAudio ? '🔈' : '🔇'}
			</FlyoutButton>
		</>
	);
}
