import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import localization from '../../../model/resources/localization';
import { copyToClipboard } from '../../../state/globalActions';
import { Dispatch } from '@reduxjs/toolkit';

import './ErrorView.css';

interface ErrorViewProps {
	error: string | null;
}

// TODO: provide a button to send error to the server

export function ErrorView(props: ErrorViewProps): JSX.Element {
	let appDispatch : Dispatch<any> | null = null;

	try {
		appDispatch = useDispatch();
	} catch (e) {
		console.log('useDispatch not initialized');
	}

	const copyTextToClipboard = () => {
		if (props.error && appDispatch) {
			appDispatch(copyToClipboard(props.error));
		}
	};

	return (
		<div className='errorView'>
			<div className='errorBox'>
				<div className="errorTitle">{localization.errorHappened}</div>
				<div className='errorBody'>{props.error}</div>

				<div className='buttons'>
					{appDispatch ? <button
						type='button'
						className='standard'
						disabled={!props.error}
						onClick={() => copyTextToClipboard()}
					>
						{localization.copyText}
					</button> : null}

					<button
						type='button'
						className='standard'
						disabled={!props.error}
						onClick={() => window.location.reload()}
					>
						{localization.reloadPage}
					</button>
				</div>
			</div>
		</div>
	);
}

export default connect()(ErrorView);
