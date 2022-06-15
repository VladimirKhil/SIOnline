import * as React from 'react';
import { connect } from 'react-redux';
import localization from '../model/resources/localization';
import settingsActionCreators from '../state/settings/settingsActionCreators';
import State from '../state/State';

import './LobbyChatVisibilityButton.css';

interface LobbyChatVisibilityButtonProps {
	isLobbyChatVisible: boolean;

	onLobbyChatVisibilityChanged: (isVisible: boolean) => void;
}

const mapStateToProps = (state: State) => ({
	isLobbyChatVisible: !state.settings.isLobbyChatHidden,
});

const mapDispatchToProps = (dispatch: any) => ({
	onLobbyChatVisibilityChanged: (isVisible: boolean) => {
		dispatch(settingsActionCreators.onLobbyChatVisibilityChanged(isVisible));
	},
});

export function LobbyChatVisibilityButton(props: LobbyChatVisibilityButtonProps): JSX.Element {
	return (
		<button
			className='lobbyChatVisibilityButton'
			title={props.isLobbyChatVisible ? localization.hideChat : localization.showChat}
			onClick={() => props.onLobbyChatVisibilityChanged(!props.isLobbyChatVisible)}
		>
			👁
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(LobbyChatVisibilityButton);
