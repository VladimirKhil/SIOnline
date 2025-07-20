import * as React from 'react';
import { connect } from 'react-redux';
import State from '../../../state/State';
import localization from '../../../model/resources/localization';
import { sendJoinMode } from '../../../state/serverActions';
import PersonView from '../PersonView/PersonView';
import { isHost } from '../../../utils/StateHelpers';
import JoinMode from '../../../client/game/JoinMode';
import Persons from '../../../model/Persons';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { getPin } from '../../../state/room2Slice';
import inviteLink from '../../../utils/inviteLink';

import './PersonsView.css';

interface PersonsViewProps {
	isHost: boolean;
	all: Persons;
}

const mapStateToProps = (state: State) => ({
	isHost: isHost(state),
	all: state.room2.persons.all,
});

export function PersonsView(props: PersonsViewProps): JSX.Element {
	const room = useAppSelector(state => state.room2);
	const common = useAppSelector(state => state.common);
	const appDispatch = useAppDispatch();

	const showman = props.all[room.persons.showman.name];
	const playersNames = room.persons.players.map(p => p.name);

	const players = playersNames
		.map(name => props.all[name])
		.filter(p => p)
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const viewers = Object.keys(props.all)
		.filter(name => name !== room.persons.showman.name && !playersNames.includes(name))
		.map(name => props.all[name])
		.sort((p1, p2) => p1.name.localeCompare(p2.name));

	const onJoinModeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
		appDispatch(sendJoinMode(parseInt(e.target.value, 10) as JoinMode));
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

			{common.clipboardSupported
				? <div className="buttonsPanel inviteLinkHost sidePanel">
					<button type="button" className='standard' onClick={() => inviteLink(appDispatch)}>{localization.inviteLink}</button>
					{props.isHost ? <button type='button' className='standard' onClick={getPinCore}>{localization.getPin}</button> : null}
				</div>
				: null}

			<div className="buttonsPanel sidePanel joinMode">
				<span className='joinModeTitle'>{localization.joinMode}</span>

				<select
					title={localization.joinMode}
					value = {room.joinMode}
					onChange={onJoinModeChanged}
					disabled={!common.isSIHostConnected || !props.isHost}>
					<option value={JoinMode.AnyRole}>{localization.joinModeAnyRole}</option>
					<option value={JoinMode.OnlyViewer}>{localization.joinModeViewer}</option>
					<option value={JoinMode.Forbidden}>{localization.joinModeForbidden}</option>
				</select>
			</div>
		</>
	);
}

export default connect(mapStateToProps)(PersonsView);
