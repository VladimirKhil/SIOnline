import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import isHost from '../../utils/StateHelpers';

import './StartGameButton.css';

interface StartGameButtonProps {
	isConnected: boolean;
	canStart: boolean;
	onStart: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	canStart: !state.run.stage.isGameStarted && isHost(state)
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStart: () => {
		dispatch(runActionCreators.startGame() as object as Action);
	}
});

export function StartGameButton(props: StartGameButtonProps) {
	const enabledClass = props.isConnected ? '' : 'disabled';

	return props.canStart ? (
		<div className="start_button_host">
			<button className={`start_button ${enabledClass}`} onClick={props.onStart}>
				{localization.startGame.toUpperCase()}
			</button>
		</div>
	) : null;
}

export default connect(mapStateToProps, mapDispatchToProps)(StartGameButton);
