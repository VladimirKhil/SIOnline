import { connect } from 'react-redux';
import localization from '../../model/resources/localization';
import * as React from 'react';
import roomActionCreators from '../../state/room/roomActionCreators';
import State from '../../state/State';
import { Dispatch, Action } from 'redux';

import './GameButton.css';

interface GameButtonProps {
	isConnected: boolean;
	isGameButtonEnabled: boolean;
	windowWidth: number;
	pressGameButton: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	isGameButtonEnabled: state.room.isGameButtonEnabled,
	windowWidth: state.ui.windowWidth,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	pressGameButton: () => {
		dispatch(roomActionCreators.pressGameButton() as object as Action);
	},
});

export function GameButton(props: GameButtonProps) {
	return (
		<button
			className="playerButton"
			title={localization.gameButton}
			disabled={!props.isConnected || !props.isGameButtonEnabled}
			onClick={() => props.pressGameButton()}>
			{props.windowWidth < 600 ? localization.answer : <span>&nbsp;</span> }
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameButton);
