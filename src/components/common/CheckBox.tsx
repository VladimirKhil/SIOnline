import * as React from 'react';

import './CheckBox.css';

interface CheckBoxProps {
	header: string;
	isChecked: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function CheckBox(props: CheckBoxProps): JSX.Element {
	return (
		<>
			<div className="checkmark">{props.isChecked ? '✔' : ''}</div>
			{props.header}
		</>
	);
}
