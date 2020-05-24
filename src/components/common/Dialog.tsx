import * as React from 'react';
import localization from '../../model/resources/localization';

import './Dialog.css';
import closeSvg from '../../../wwwroot/images/close.svg';

interface DialogProps {
	id: string;
	title: string;
	children?: any;
	onClose: () => void;
}

// tslint:disable-next-line: function-name
export default function Dialog(props: DialogProps) {
	return (
		<section id={props.id} className="dialog">
			<header><h1>{props.title}</h1></header>
			<button className="dialog_closeButton" onClick={props.onClose}>
				<img src={closeSvg} alt={localization.close} />
			</button>
			{props.children}
		</section>
	);
}
