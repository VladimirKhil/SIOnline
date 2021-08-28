import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, Action } from 'redux';
import State from '../../state/State';
import runActionCreators from '../../state/run/runActionCreators';
import localization from '../../model/resources/localization';
import isHost from '../../utils/StateHelpers';
import Sex from '../../model/enums/Sex';
import Role from '../../model/enums/Role';

import './StartGameArea.css';

interface StartGameAreaProps {
	isConnected: boolean;
	hasGameStarted: boolean;
	isHost: boolean;
	isReady: boolean;
	sex: Sex;
	onReady: (isReady: boolean) => void;
	onStart: () => void;
}

const mapStateToProps = (state: State) => {
	const { role } = state.game;
	const { persons } = state.run;
	let isReady = false;
	if (role === Role.Showman) {
		isReady = persons.showman.isReady;
	} else if (role === Role.Player) {
		const me = persons.players.find(p => p.name === state.user.login);
		if (me) {
			isReady = me.isReady;
		}
	}

	return {
		isConnected: state.common.isConnected,
		hasGameStarted: state.run.stage.isGameStarted,
		isHost: isHost(state),
		sex: state.settings.sex,
		isReady
	};
};

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onStart: () => {
		dispatch(runActionCreators.startGame() as unknown as Action);
	},
	onReady: (isReady: boolean) => {
		dispatch(runActionCreators.ready(isReady) as unknown as Action);
	}
});

export function StartGameArea(props: StartGameAreaProps): JSX.Element | null {
	const enabledClass = props.isConnected ? '' : 'disabled';

	return props.hasGameStarted ? null : (
		<div className="start_area">
			<button
				type="button"
				className={`ready_button ${enabledClass}`}
				onClick={() => props.onReady(!props.isReady)}
			>
				<span className="mark">{props.isReady ? '✔️' : ''}</span>
				<span>{props.sex === Sex.Female ? localization.readyFemale : localization.readyMale}</span>
			</button>
			{props.isHost ? (
				<button type="button" className={`start_button ${enabledClass}`} onClick={props.onStart} title={localization.startGameHint}>
					{localization.startGame.toUpperCase()}
				</button>
			) : null}
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(StartGameArea);
