import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Sex from '../../../model/enums/Sex';
import Role from '../../../model/Role';

import './ReadyButton.css';

interface ReadyButtonProps {
	isConnected: boolean;
	isReady: boolean;
	sex: Sex;

	onReady: (isReady: boolean) => void;
}

const getIsReady = (state: State) => {
	const { persons, role } = state.room;

	if (role === Role.Showman) {
		return persons.showman.isReady;
	}

	if (role === Role.Player) {
		const me = persons.players.find(p => p.name === state.room.name);

		if (me) {
			return me.isReady;
		}
	}

	return false;
};

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isConnected,
	sex: state.settings.sex,
	isReady: getIsReady(state),
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onReady: (isReady: boolean) => {
		dispatch(roomActionCreators.ready(isReady) as unknown as Action);
	},
});

export function ReadyButton(props: ReadyButtonProps): JSX.Element | null {
	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<button
			type="button"
			className={`ready_button ${enabledClass} ${props.isReady ? 'active' : ''}`}
			onClick={() => props.onReady(!props.isReady)}
		>
			<span>{props.sex === Sex.Female ? localization.readyFemale : localization.readyMale}</span>
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadyButton);