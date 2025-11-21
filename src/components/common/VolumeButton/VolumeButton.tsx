import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setSoundVolume } from '../../../state/settingsSlice';
import FlyoutButton, { FlyoutHorizontalOrientation, FlyoutVerticalOrientation } from '../FlyoutButton/FlyoutButton';

import './VolumeButton.css';
import volumeOnIcon from '../../../../assets/images/volume-on.svg';
import volumeOffIcon from '../../../../assets/images/volume-off.svg';

interface VolumeButtonProps {
	canPlayAudio: boolean;
}

export default function VolumeButton(props: VolumeButtonProps) {
	const soundVolume = useAppSelector(state => state.settings.soundVolume);
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
							value={soundVolume}
							onChange={changeVolumeHandler}
							className="volumeButtonControl"
						/>
					</div>
				}
				verticalOrientation={FlyoutVerticalOrientation.Bottom}
				horizontalOrientation={FlyoutHorizontalOrientation.Left}
			>
				<img 
					src={soundVolume && props.canPlayAudio ? volumeOnIcon : volumeOffIcon} 
					alt={localization.soundVolume}
					className="volumeIcon"
				/>
			</FlyoutButton>
		</>
	);
}
