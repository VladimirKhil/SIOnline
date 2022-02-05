import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';

import './ErrorView.css';

interface ErrorViewProps {
	error: string | null;
}

// TODO: provide a button to send error to the server

export function ErrorView(props: ErrorViewProps): JSX.Element {
	return (
		<div className='errorView'>
			<div className="errorTitle">{localization.errorHappened}</div>
			<div className='errorBody'>{props.error}</div>
		</div>
	);
}

export default connect()(ErrorView);
