import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import roomActionCreators from '../../state/room/roomActionCreators';
import localization from '../../model/resources/localization';
import { isHost } from '../../utils/StateHelpers';
import Sex from '../../model/enums/Sex';
import Role from '../../client/contracts/Role';

import './StartGameArea.css';

interface StartGameAreaProps {
	isConnected: boolean;
	hasGameStarted: boolean;
	isHost: boolean;
	isReady: boolean;
	sex: Sex;	
	isAutomatic: boolean;
	role: Role;
	onReady: (isReady: boolean) => void;
	onStart: () => void;
}

const getIsReady = (state: State) => {
	const { persons, role } = state.room;

	if (role === Role.Showman) {
		return persons.showman.isReady;
	}
	
	if (role === Role.Player) {
		const me = persons.players.find(p => p.name === state.user.login);
		if (me) {
			return me.isReady;
		}
	}

	return false;
};

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	hasGameStarted: state.room.stage.isGameStarted,
	isHost: isHost(state),
	sex: state.settings.sex,
	isReady: getIsReady(state),
	isAutomatic: state.game.isAutomatic,
	role: state.room.role
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStart: () => {
		dispatch(roomActionCreators.startGame() as unknown as Action);
	},
	onReady: (isReady: boolean) => {
		dispatch(roomActionCreators.ready(isReady) as unknown as Action);
	}
});

export function StartGameArea(props: StartGameAreaProps): JSX.Element | null {
	const enabledClass = props.isConnected ? '' : 'disabled';

	return props.hasGameStarted || props.isAutomatic ? null : (
		<div className="start_area">
			{props.role !== Role.Viewer ? (
				<button
					type="button"
					className={`ready_button ${enabledClass}`}
					onClick={() => props.onReady(!props.isReady)}
				>
					<span className="mark">{props.isReady ? '✔️' : ''}</span>
					<span>{props.sex === Sex.Female ? localization.readyFemale : localization.readyMale}</span>
				</button>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(StartGameArea);
