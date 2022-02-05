import * as React from 'react';
import localization from '../../model/resources/localization';
import { ForwardedRef } from 'react';

import closeSvg from '../../../assets/images/close.svg';

import './Dialog.css';

interface DialogProps {
	id?: string;
	className?: string;
	title: string;
	children?: any;
	onClose: () => void;
}

const Dialog = React.forwardRef((props: DialogProps, ref: ForwardedRef<HTMLElement>) => (
	<section id={props.id} className={`dialog ${props.className}`} ref={ref}>
		<header><h1>{props.title}</h1></header>
		<button type="button" className="dialog_closeButton" onClick={props.onClose}>
			<img src={closeSvg} alt={localization.close} />
		</button>
		{props.children}
	</section>
));

export default Dialog;
