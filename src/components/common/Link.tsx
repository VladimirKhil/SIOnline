import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../state/State';

interface LinkProps {
	clearUrls?: boolean;
	href: string;
	target?: React.HTMLAttributeAnchorTarget;
	rel?: string;
	children?: any;
}

const mapStateToProps = (state: State) => ({
	clearUrls: state.common.clearUrls,
});

export function Link(props: LinkProps): JSX.Element {
	return props.clearUrls ? props.children : (
		<a href={props.href} target={props.target} rel={props.rel}>
			{props.children}
		</a>
	);
}

export default connect(mapStateToProps)(Link);
