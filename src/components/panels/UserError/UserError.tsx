import * as React from 'react';
import { MessageLevel } from '../../../state/new/commonSlice';

import './UserError.css';

interface UserErrorProps {
	error: string;
	messageLevel: MessageLevel;
}

function getLevelClassName(messageLevel: MessageLevel) {
	switch (messageLevel) {
		case MessageLevel.Error:
			return 'error';

		case MessageLevel.Warning:
			return 'warn';

		case MessageLevel.Information:
			return 'info';

		default:
			return '';
	}
}

export default function UserError(props: UserErrorProps): JSX.Element {
	return (
		<div className={`userError ${getLevelClassName(props.messageLevel)}`}>
			{props.error}
		</div>
	);
}