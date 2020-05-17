import * as React from 'react';

import './CheckBox.css';

interface CheckBoxProps {
	header: string;
	isChecked: boolean;
}

// tslint:disable-next-line: function-name
export default function CheckBox(props: CheckBoxProps) {
	return (
		<React.Fragment>
			<div className="checkmark">{props.isChecked ? '✔' : ''}</div>
			{props.header}
		</React.Fragment>
	);
}
