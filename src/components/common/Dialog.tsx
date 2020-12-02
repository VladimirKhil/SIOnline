import * as React from 'react';
import localization from '../../model/resources/localization';

import './Dialog.css';

import closeSvg from '../../../assets/images/close.svg';

interface DialogProps {
	id?: string;
	className?: string;
	title: string;
	children?: any;
	onClose: () => void;
}

export default function Dialog(props: DialogProps): JSX.Element {
	return (
		<section id={props.id} className={`dialog ${props.className}`}>
			<header><h1>{props.title}</h1></header>
			<button type="button" className="dialog_closeButton" onClick={props.onClose}>
				<img src={closeSvg} alt={localization.close} />
			</button>
			{props.children}
		</section>
	);
}
