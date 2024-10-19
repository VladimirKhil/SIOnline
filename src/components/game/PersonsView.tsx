import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import State from '../../state/State';
import localization from '../../model/resources/localization';
import Account from '../../model/Account';
import roomActionCreators from '../../state/room/roomActionCreators';
import PersonView from './PersonView';
import { isHost } from '../../utils/StateHelpers';
import JoinMode from '../../client/game/JoinMode';
import Persons from '../../model/Persons';
import { useAppDispatch, useAppSelector } from '../../state/new/hooks';
import { getPin } from '../../state/new/room2Slice';
import { AppDispatch } from '../../state/new/store';
import { userInfoChanged } from '../../state/new/commonSlice';

import './PersonsView.css';

interface PersonsViewProps {
	isConnected: boolean;
	isHost: boolean;
	all: Persons;
	login: string;
	selectedPerson: Account | null;
	joinMode: JoinMode;

	kick: () => void;
	ban: () => void;
	setHost: () => void;
	onJoinModeChanged(joinMode: JoinMode): void;
}

const mapStateToProps = (state: State) => {
	const { selectedPersonName } = state.room.chat;

	return {
		isConnected: state.common.isSIHostConnected,
		isHost: isHost(state),
		all: state.room.persons.all,
		login: state.room.name,
		selectedPerson: selectedPersonName ? state.room.persons.all[selectedPersonName] : null,
		joinMode: state.room.joinMode,
	};
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
	kick: () => {
		dispatch((roomActionCreators.kickPerson() as object) as AnyAction);
	},
	ban: () => {
		dispatch((roomActionCreators.banPerson() as object) as AnyAction);
	},
	setHost: () => {
		dispatch((roomActionCreators.setHost() as object) as AnyAction);
	},
	onJoinModeChanged(joinMode: JoinMode) {
		dispatch((roomActionCreators.setJoinMode(joinMode) as object) as AnyAction);
	}
});

function inviteLink(appDispatch: AppDispatch) {
	const link = window.location.href;

	if (navigator.clipboard) {
		navigator.clipboard.writeText(link);
	} else {
		alert(link);
	}

	appDispatch(userInfoChanged(localization.inviteLinkCopied));
}

export function PersonsView(props: PersonsViewProps): JSX.Element {
	const roomState = useAppSelector(state => state.room2);
	const appDispatch = useAppDispatch();

	const showman = props.all[roomState.persons.showman.name];
	const playersNames = roomState.persons.players.map(p => p.name);

	const players = playersNames
		.map(name => props.all[name])
		.filter(p => p)
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const viewers = Object.keys(props.all)
		.filter(name => name !== roomState.persons.showman.name && !playersNames.includes(name))
		.map(name => props.all[name])
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const canKick = props.isHost && props.selectedPerson && props.selectedPerson.name !== props.login && props.selectedPerson.isHuman;

	const onJoinModeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		props.onJoinModeChanged(parseInt(e.target.value, 10) as JoinMode);
	};

	const getPinCore = () => {
		appDispatch(getPin());
	};

	return (
		<>
			<div className="personsList">
				<div className="personsHeader">{localization.showman}</div>

				{showman ? (
					<ul>
						<PersonView account={showman} />
					</ul>
				) : null}

				<div className="personsHeader">{localization.players}</div>

				<ul>
					{players.map((person, index) => (
						<PersonView key={person ? person.name : index} account={person} />
					))}
				</ul>

				<div className="personsHeader">{localization.viewers}</div>

				<ul>
					{viewers.map(person => <PersonView key={person.name} account={person} />)}
				</ul>
			</div>

			<div className="buttonsPanel inviteLinkHost sidePanel">
				<button type="button" className='standard' onClick={() => inviteLink(appDispatch)}>{localization.inviteLink}</button>
				<button type='button' className='standard' onClick={getPinCore}>{localization.getPin}</button>
			</div>

			<div className="buttonsPanel sidePanel joinMode">
				<span className='joinModeTitle'>{localization.joinMode}</span>

				<select
					value = {props.joinMode}
					onChange={onJoinModeChanged}
					disabled={!props.isConnected || !props.isHost}>
					<option value={JoinMode.AnyRole}>{localization.joinModeAnyRole}</option>
					<option value={JoinMode.OnlyViewer}>{localization.joinModeViewer}</option>
					<option value={JoinMode.Forbidden}>{localization.joinModeForbidden}</option>
				</select>
			</div>

			<div className="buttonsPanel sidePanel">
				<button
					type="button"
					className='standard'
					onClick={() => props.setHost()}
					disabled={!props.isConnected || !canKick}>
					{localization.setHost}
				</button>
			</div>

			<div className="buttonsPanel sidePanel">
				<button
					type="button"
					className='standard'
					onClick={() => props.kick()}
					disabled={!props.isConnected || !canKick}>
					{localization.kick}
				</button>

				<button type="button" className='standard' onClick={() => props.ban()} disabled={!props.isConnected || !canKick}>
					{localization.ban}
				</button>
			</div>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonsView);
