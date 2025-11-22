import * as React from 'react';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { openLink } from '../../../state/globalActions';

interface LinkProps {
	href: string;
	target?: React.HTMLAttributeAnchorTarget;
	rel?: string;
	children?: any;
	title?: string;
	className?: string;
}

export default function Link(props: LinkProps): JSX.Element {
	const clearUrls = useAppSelector(state => state.common.clearUrls);
	const hostManagedUrls = useAppSelector(state => state.common.hostManagedUrls);
	const appDispatch = useAppDispatch();

	if (hostManagedUrls) {
		const open = () => {
			appDispatch(openLink(props.href));
		};

		return <a target={props.target} className={props.className} rel={props.rel} title={props.title} onClick={open}>
			{props.children}
		</a>;
	}

	if (clearUrls) {
		return props.children;
	}

	return <a href={props.href} className={props.className} target={props.target} rel={props.rel} title={props.title}>
		{props.children}
	</a>;
}
