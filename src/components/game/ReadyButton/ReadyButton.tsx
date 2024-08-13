import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Sex from '../../../model/enums/Sex';
import Role from '../../../model/Role';
import { useAppSelector } from '../../../state/new/hooks';
import { Room2State } from '../../../state/new/room2Slice';

import './ReadyButton.css';

interface ReadyButtonProps {
	isConnected: boolean;
	role: Role;
	myName: string;
	sex: Sex;

	onReady: (isReady: boolean) => void;
}

const getIsReady = (state: Room2State, role: Role, myName: string) => {
	const { persons } = state;

	if (role === Role.Showman) {
		return persons.showman.isReady;
	}

	if (role === Role.Player) {
		const me = persons.players.find(p => p.name === myName);

		if (me) {
			return me.isReady;
		}
	}

	return false;
};

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	sex: state.settings.sex,
	role: state.room.role,
	myName: state.room.name,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onReady: (isReady: boolean) => {
		dispatch(roomActionCreators.ready(isReady) as unknown as Action);
	},
});

export function ReadyButton(props: ReadyButtonProps): JSX.Element | null {
	const roomState = useAppSelector(state => state.room2);
	const isReady = getIsReady(roomState, props.role, props.myName);
	const enabledClass = props.isConnected ? '' : 'disabled';

	return (
		<button
			type="button"
			className={`ready_button ${enabledClass} ${isReady ? 'active' : ''}`}
			onClick={() => props.onReady(!isReady)}
		>
			<span>{props.sex === Sex.Female ? localization.readyFemale : localization.readyMale}</span>
		</button>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadyButton);