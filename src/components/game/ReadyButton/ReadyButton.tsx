import * as React from 'react';
import { Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import Sex from '../../../model/enums/Sex';
import Role from '../../../model/Role';
import { useAppSelector } from '../../../state/hooks';
import { Room2State } from '../../../state/room2Slice';

import './ReadyButton.scss';

interface ReadyButtonProps {
	isConnected: boolean;
	sex: Sex;

	onReady: (isReady: boolean) => void;
}

const getIsReady = (state: Room2State) => {
	const { persons, role, name } = state;

	if (role === Role.Showman) {
		return persons.showman.isReady;
	}

	if (role === Role.Player) {
		const me = persons.players.find(p => p.name === name);

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
	return props.sex === Sex.Female ? localization.notReadyFemale : localization.notReadyMale;
}

function getReadyMessage(props: ReadyButtonProps) {
	return props.sex === Sex.Female ? localization.readyFemale : localization.readyMale;
}

export function ReadyButton(props: ReadyButtonProps): JSX.Element | null {
	const room = useAppSelector(state => state.room2);
	const isReady = getIsReady(room);
	const enabledClass = props.isConnected ? '' : 'disabled';
	const label = isReady ? getReadyMessage(props) : getNotReadyMessage(props);
	const buttonLabel = isReady ? '❌' : '✔️';

	return (
		<div className={`readyButtonHost ${isReady ? 'ready' : 'not-ready'}`}>
			<div className='readyButtonHost__label'>
				{label}
			</div>

			<button
				type="button"
				className={`ready_button ${enabledClass}`}
				onClick={() => props.onReady(!isReady)}
			>
				{buttonLabel}
			</button>
		</div>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReadyButton);
