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
	pressGameButton: () => void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	isGameButtonEnabled: state.room.isGameButtonEnabled,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	pressGameButton: () => {
		dispatch(roomActionCreators.pressGameButton() as object as Action);
	},
});

export function GameButton(props: GameButtonProps) {
	return (
		<button
			type='button'
			className="playerButton"
			title={localization.gameButton}
			disabled={!props.isConnected || !props.isGameButtonEnabled}
			onClick={() => props.pressGameButton()}>
			{localization.answer}
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(GameButton);
