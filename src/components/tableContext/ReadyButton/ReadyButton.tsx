import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import { ready } from '../../../state/serverActions';
import Sex from '../../../model/enums/Sex';
import Role from '../../../model/Role';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';

import './ReadyButton.scss';
import PersonInfo from '../../../model/PersonInfo';
import PlayerInfo from '../../../model/PlayerInfo';

/**
 * Props for the ReadyButton component.
 */
interface ReadyButtonProps {
	isConnected: boolean;
	sex: Sex;

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
	const appDispatch = useAppDispatch();
	const role = useAppSelector(state => state.room2.role);
	const persons = useAppSelector(state => state.room2.persons);
	const name = useAppSelector(state => state.room2.name);
	const demoButtonHighlights = useAppSelector(state => state.room2.demoButtonHighlights);

	const isReady = getIsReady(role, persons.showman, persons.players, name);
	const enabledClass = props.isConnected ? '' : 'disabled';
	const label = isReady ? getReadyMessage() : getNotReadyMessage(props);

	return (
		<div className='readyButtonHost'>
			<button
				type="button"
				className={`ready_button ${isReady ? 'ready' : 'not-ready'} ${enabledClass} ${demoButtonHighlights.ready ? 'demoHighlighted' : ''}`}
				onClick={() => appDispatch(ready(!isReady))}
				disabled={!props.isConnected}
			>
				{label}
			</button>
		</div>
	);
}

export default connect(mapStateToProps)(ReadyButton);
