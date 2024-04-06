import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../../../model/resources/localization';

import './ErrorView.css';

interface ErrorViewProps {
	error: string | null;
}

function copyTextToClipboard(error: string | null) {
	if (error) {
		navigator.clipboard.writeText(error);
	}
}

// TODO: provide a button to send error to the server

export function ErrorView(props: ErrorViewProps): JSX.Element {
	return (
		<div className='errorView'>
			<div className='errorBox'>
				<div className="errorTitle">{localization.errorHappened}</div>
				<div className='errorBody'>{props.error}</div>
				<div className='buttons'>
					{navigator.clipboard ? (
						<button
							className='standard'
							disabled={!props.error}
							onClick={() => copyTextToClipboard(props.error)}
						>
							{localization.copyText}
						</button>
					) : null}
					<button
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
