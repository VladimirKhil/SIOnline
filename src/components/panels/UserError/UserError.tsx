import * as React from 'react';

import './UserError.css';

interface UserErrorProps {
	error: string;
}

export default function UserError(props: UserErrorProps): JSX.Element {
	return (
		<div className='userError'>
			{props.error}
		</div>
	);
}