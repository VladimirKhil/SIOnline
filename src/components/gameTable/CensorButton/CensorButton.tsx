import * as React from 'react';
import localization from '../../../model/resources/localization';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setCensored } from '../../../state/uiSlice';

import './CensorButton.css';

export function CensorButton(): JSX.Element {
	const isCensored = useAppSelector(state => state.ui.isCensored);
	const appDispatch = useAppDispatch();

	return (
		<button
			type='button'
			className={`censorButton ${isCensored ? 'active' : ''}`}
			title={localization.censorContent}
			aria-pressed={isCensored}
			onClick={() => appDispatch(setCensored(!isCensored))}
		>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round" />

				<circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />

				{isCensored
					? <path d="M4 20L20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					: null}
			</svg>
		</button>
	);
}

export default CensorButton;
