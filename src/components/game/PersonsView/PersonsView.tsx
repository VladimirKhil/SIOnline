import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import roomActionCreators from '../../../state/room/roomActionCreators';
import PersonView from '../PersonView/PersonView';
import { isHost } from '../../../utils/StateHelpers';
import JoinMode from '../../../client/game/JoinMode';
import Persons from '../../../model/Persons';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { getPin } from '../../../state/room2Slice';
import { AppDispatch } from '../../../state/store';
import { userInfoChanged } from '../../../state/commonSlice';

import './PersonsView.css';

interface PersonsViewProps {
	isConnected: boolean;
	isHost: boolean;
	all: Persons;
	joinMode: JoinMode;

	onJoinModeChanged(joinMode: JoinMode): void;
}

const mapStateToProps = (state: State) => ({
	isConnected: state.common.isSIHostConnected,
	isHost: isHost(state),
	all: state.room.persons.all,
	joinMode: state.room.joinMode,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
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
					title={localization.joinMode}
					value = {props.joinMode}
					onChange={onJoinModeChanged}
					disabled={!props.isConnected || !props.isHost}>
					<option value={JoinMode.AnyRole}>{localization.joinModeAnyRole}</option>
					<option value={JoinMode.OnlyViewer}>{localization.joinModeViewer}</option>
					<option value={JoinMode.Forbidden}>{localization.joinModeForbidden}</option>
				</select>
			</div>
		</>
	);
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonsView);
