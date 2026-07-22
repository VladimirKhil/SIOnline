import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Sex from '../../../model/enums/Sex';
import Role from '../../../model/Role';
import { useAppSelector } from '../../../state/hooks';

import './ReadyButton.scss';
import PersonInfo from '../../../model/PersonInfo';
import PlayerInfo from '../../../model/PlayerInfo';

/**
 * Props for the ReadyButton component.
 */
interface ReadyButtonProps {
	isConnected: boolean;
	sex: Sex;

	onReady: (isReady: boolean) => void;
}

const getIsReady = (role: Role, showman: PersonInfo, players: PlayerInfo[], name: string) => {
	if (role === Role.Showman) {
		return showman.isReady;
	}

	if (role === Role.Player) {
		const me = players.find(p => p.name === name);

		if (me) {
			return me.isReady;
		}
	}

	return false;
};

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	sex: state.settings.sex,
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
	onReady: (isReady: boolean) => {
		dispatch(roomActionCreators.ready(isReady) as unknown as Action);
	},
});

function getNotReadyMessage(props: ReadyButtonProps) {
	return props.sex === Sex.Female ? localization.readyToPlayFemale : localization.readyToPlayMale;
}

function getReadyMessage() {
	return localization.cancelReadiness;
}

/**
 * Renders the ready status toggle button for room participants.
 */
export function ReadyButton(props: ReadyButtonProps): JSX.Element | null {
	const role = useAppSelector(state => state.room2.role);
	const persons = useAppSelector(state => state.room2.persons);
	const name = useAppSelector(state => state.room2.name);

	const isReady = getIsReady(role, persons.showman, persons.players, name);
	const enabledClass = props.isConnected ? '' : 'disabled';
	const label = isReady ? getReadyMessage() : getNotReadyMessage(props);

	return (
		<div className='readyButtonHost'>
			<button
				type="button"
				className={`ready_button ${isReady ? 'ready' : 'not-ready'} ${enabledClass}`}
				onClick={() => props.onReady(!isReady)}
				disabled={!props.isConnected}
			>
				{label}
			</button>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadyButton);
