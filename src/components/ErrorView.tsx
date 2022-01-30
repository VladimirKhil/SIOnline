import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import State from '../state/State';

import './ErrorView.css';

interface ErrorViewProps {
	error: string | null;
}

// TODO: provide a button to send error to the server

export function ErrorView(props: ErrorViewProps): JSX.Element {
	return (
		<div className='errorView'>
			<span className="errorTitle">{localization.errorHappened}</span>
			<span>{props.error}</span>
		</div>
	);
}

export default connect()(ErrorView);
