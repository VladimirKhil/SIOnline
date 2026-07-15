import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setFullScreen } from '../../../state/settingsSlice';

import './FullScreenButton.css';

export function FullScreenButton(): JSX.Element | null {
	const isFullScreenSupported = useAppSelector(state => state.ui.isFullScreenSupported);
	const fullScreen = useAppSelector(state => state.settings.fullScreen);
	const appDispatch = useAppDispatch();

	if (!isFullScreenSupported) {
		return null;
	}

	return (
		<button
			type='button'
			className="fullScreenButton"
			title={localization.fullScreen}
			onClick={() => appDispatch(setFullScreen(!fullScreen))}
		>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				{fullScreen
					? <>
						<path d="M19 5L13 11M13 6V11H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M5 19L11 13M11 18V13H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</>
					: <>
						<path d="M13 11L19 5M14 5H19V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						<path d="M11 13L5 19M10 19H5V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</>}
			</svg>
		</button>
	);
}

export default FullScreenButton;
