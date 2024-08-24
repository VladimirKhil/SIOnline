import * as React from 'react';
import Dialog from '../../common/Dialog/Dialog';

import './PersonsDialog.css';

interface PersonsDialogProps {
	title: string;
	children?: unknown;

	onClose: () => void;
}

export default function PersonsDialog(props: PersonsDialogProps): JSX.Element {
	return (
		<Dialog className="personsDialog" title={props.title} onClose={props.onClose}>
			{props.children}
		</Dialog>
	);
}

PersonsDialog.defaultProps = {
	children: null
};
