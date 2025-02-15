import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import localization from '../../../model/resources/localization';
import { copyToClipboard } from '../../../state/globalActions';

import './ErrorView.css';

interface ErrorViewProps {
	error: string | null;
}

// TODO: provide a button to send error to the server

export function ErrorView(props: ErrorViewProps): JSX.Element {
	const appDispatch = useDispatch();

	const copyTextToClipboard = () => {
		if (props.error) {
			appDispatch(copyToClipboard(props.error));
		}
	};

	return (
		<div className='errorView'>
			<div className='errorBox'>
				<div className="errorTitle">{localization.errorHappened}</div>
				<div className='errorBody'>{props.error}</div>
				<div className='buttons'>
					{<button
						type='button'
						className='standard'
						disabled={!props.error}
						onClick={() => copyTextToClipboard()}
					>
						{localization.copyText}
					</button>}
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
