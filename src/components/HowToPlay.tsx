import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import actionCreators from '../state/actionCreators';
import localization from '../model/resources/localization';
import Dialog from './common/Dialog';

import './HowToPlay.css';

interface HowToPlayProps {
	onClose: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onClose: () => {
		dispatch(actionCreators.navigateBack());
	}
});

export class HowToPlay extends React.Component<HowToPlayProps> {
	constructor(props: HowToPlayProps) {
		super(props);
	}

	render() {
		return (
			<Dialog id="helpDialog" title={localization.howToPlay} onClose={this.props.onClose}>
				<div className="helpText">
					{localization.about.map(text => (<p key={text}>{text}</p>))}
				</div>
			</Dialog>
		);
	}
}

export default connect(null, mapDispatchToProps)(HowToPlay);
